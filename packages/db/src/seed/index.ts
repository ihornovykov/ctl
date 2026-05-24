import "dotenv/config";
import { notInArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";

import {
	course,
	gradingCriteria,
	language,
	lesson,
	task,
	taskTest,
} from "../schema";
import { assertSeedData } from "./assert-seed";
import { cSeed } from "./courses/c";
import { cppSeed } from "./courses/cpp";
import { goSeed } from "./courses/go";
import { javascriptSeed } from "./courses/javascript";
import { pythonSeed } from "./courses/python";
import { reactSeed } from "./courses/react";
import { typescriptSeed } from "./courses/typescript";
import { vueSeed } from "./courses/vue";
import { languages } from "./languages";
import { mergeCourseBundles } from "./types";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
	console.error("DATABASE_URL is required to run seed");
	process.exit(1);
}

const db = drizzle(databaseUrl, { logger: false });

const courseBundles = [
	javascriptSeed,
	typescriptSeed,
	goSeed,
	pythonSeed,
	cSeed,
	cppSeed,
	reactSeed,
	vueSeed,
];

const seedData = mergeCourseBundles(courseBundles);

const cleanupSeedTables = async () => {
	const courseIds = seedData.courses.map((row) => row.id);
	const lessonIds = seedData.lessons.map((row) => row.id);
	const taskIds = seedData.tasks.map((row) => row.id);
	const taskTestIds = seedData.taskTests.map((row) => row.id);
	const gradingCriteriaIds = seedData.gradingCriteria.map((row) => row.id);
	const languageIds = languages.map((row) => row.id);

	console.log("Cleaning up rows removed from seed...");

	await db
		.delete(gradingCriteria)
		.where(notInArray(gradingCriteria.id, gradingCriteriaIds));
	await db.delete(taskTest).where(notInArray(taskTest.id, taskTestIds));
	await db.delete(task).where(notInArray(task.id, taskIds));
	await db.delete(lesson).where(notInArray(lesson.id, lessonIds));
	await db.delete(course).where(notInArray(course.id, courseIds));
	await db.delete(language).where(notInArray(language.id, languageIds));

	console.log("  Cleanup done.");
};

export const seed = async () => {
	assertSeedData(seedData);
	await cleanupSeedTables();

	console.log("Seeding languages...");
	await db
		.insert(language)
		.values(languages)
		.onConflictDoUpdate({
			target: language.id,
			set: {
				name: language.name,
				icon: language.icon,
				dockerImage: language.dockerImage,
				fileExtension: language.fileExtension,
				monacoLanguage: language.monacoLanguage,
			},
		});
	console.log(`  Inserted/updated ${languages.length} languages`);

	console.log("Seeding courses...");
	await db
		.insert(course)
		.values(seedData.courses)
		.onConflictDoUpdate({
			target: course.id,
			set: {
				title: course.title,
				slug: course.slug,
				shortDescription: course.shortDescription,
				description: course.description,
				difficulty: course.difficulty,
				estimatedHours: course.estimatedHours,
				sortOrder: course.sortOrder,
				isPublished: course.isPublished,
			},
		});
	console.log(`  Inserted/updated ${seedData.courses.length} courses`);

	console.log("Seeding lessons...");
	await db
		.insert(lesson)
		.values(seedData.lessons)
		.onConflictDoUpdate({
			target: lesson.id,
			set: {
				title: lesson.title,
				slug: lesson.slug,
				description: lesson.description,
				content: lesson.content,
				hasTask: lesson.hasTask,
				sortOrder: lesson.sortOrder,
			},
		});
	console.log(`  Inserted/updated ${seedData.lessons.length} lessons`);

	console.log("Seeding tasks...");
	await db
		.insert(task)
		.values(seedData.tasks)
		.onConflictDoUpdate({
			target: task.id,
			set: {
				description: task.description,
				starterCode: task.starterCode,
				solutionCode: task.solutionCode,
				starterFiles: task.starterFiles,
				entryFile: task.entryFile,
				readOnlyFiles: task.readOnlyFiles,
			},
		});
	console.log(`  Inserted/updated ${seedData.tasks.length} tasks`);

	console.log("Seeding task tests...");
	await db
		.insert(taskTest)
		.values(seedData.taskTests)
		.onConflictDoUpdate({
			target: taskTest.id,
			set: {
				title: taskTest.title,
				testCode: taskTest.testCode,
				sortOrder: taskTest.sortOrder,
			},
		});
	console.log(`  Inserted/updated ${seedData.taskTests.length} task tests`);

	console.log("Seeding grading criteria...");
	await db
		.insert(gradingCriteria)
		.values(seedData.gradingCriteria)
		.onConflictDoUpdate({
			target: gradingCriteria.id,
			set: {
				name: gradingCriteria.name,
				description: gradingCriteria.description,
				maxScore: gradingCriteria.maxScore,
				sortOrder: gradingCriteria.sortOrder,
			},
		});
	console.log(
		`  Inserted/updated ${seedData.gradingCriteria.length} grading criteria`
	);

	console.log("Seed complete.");
};

if (import.meta.url === `file://${process.argv[1]}`) {
	seed().catch((err) => {
		console.error(err);
		process.exit(1);
	});
}
