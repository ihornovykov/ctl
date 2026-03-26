import { course, db, enrollment, lesson, lessonProgress } from "@ctl/db";
import { ORPCError } from "@orpc/server";
import { and, eq, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";

import { protectedProcedure, publicProcedure } from "../../index";
import {
	type CourseDetail,
	type CourseListOutput,
	completeLessonInput,
	courseDetailSchema,
	courseSchema,
	courseSlugInput,
	enrollInput,
} from "./validation";

export const coursesRouter = {
	list: publicProcedure
		.output(courseSchema.array())
		.handler(async (): Promise<CourseListOutput> => {
			const courses = await db.query.course.findMany({
				where: eq(course.isPublished, true),
				with: { language: true },
				orderBy: (c, { asc }) => asc(c.sortOrder),
			});

			return courses.map((c) => ({
				id: c.id,
				title: c.title,
				slug: c.slug,
				shortDescription: c.shortDescription,
				difficulty: c.difficulty,
				estimatedHours: c.estimatedHours,
				sortOrder: c.sortOrder,
				language: {
					id: c.language.id,
					name: c.language.name,
					icon: c.language.icon,
					fileExtension: c.language.fileExtension,
					monacoLanguage: c.language.monacoLanguage,
				},
			}));
		}),

	getBySlug: publicProcedure
		.input(courseSlugInput)
		.output(courseDetailSchema)
		.handler(async ({ input, context }): Promise<CourseDetail> => {
			const courseRow = await db.query.course.findFirst({
				where: eq(course.slug, input.slug),
				with: {
					language: true,
					lessons: {
						orderBy: (l, { asc }) => asc(l.sortOrder),
					},
				},
			});

			if (!courseRow) {
				throw new ORPCError("NOT_FOUND", { message: "Course not found" });
			}

			const userId = context.session?.user.id ?? null;

			let enrollmentRow: { id: string; createdAt: Date } | null = null;
			let completedLessonIds = new Set<string>();

			if (userId) {
				enrollmentRow =
					(await db.query.enrollment.findFirst({
						where: and(
							eq(enrollment.userId, userId),
							eq(enrollment.courseId, courseRow.id)
						),
						columns: { id: true, createdAt: true },
					})) ?? null;

				if (enrollmentRow) {
					const lessonIds = courseRow.lessons.map((l) => l.id);
					const progressRows =
						lessonIds.length > 0
							? await db.query.lessonProgress.findMany({
									where: and(
										eq(lessonProgress.userId, userId),
										inArray(lessonProgress.lessonId, lessonIds)
									),
									columns: { lessonId: true },
								})
							: [];
					completedLessonIds = new Set(progressRows.map((p) => p.lessonId));
				}
			}

			const isEnrolled = enrollmentRow !== null;

			const mappedLessons = courseRow.lessons.map((l, index) => {
				const isCompleted = completedLessonIds.has(l.id);
				let isAccessible = false;

				if (isEnrolled) {
					if (index === 0) {
						isAccessible = true;
					} else {
						const prevLesson = courseRow.lessons[index - 1];
						isAccessible = prevLesson
							? completedLessonIds.has(prevLesson.id)
							: false;
					}
				}

				return {
					id: l.id,
					title: l.title,
					slug: l.slug,
					description: l.description,
					sortOrder: l.sortOrder,
					isCompleted,
					isAccessible,
				};
			});

			return {
				id: courseRow.id,
				title: courseRow.title,
				slug: courseRow.slug,
				description: courseRow.description,
				shortDescription: courseRow.shortDescription,
				difficulty: courseRow.difficulty,
				estimatedHours: courseRow.estimatedHours,
				sortOrder: courseRow.sortOrder,
				language: {
					id: courseRow.language.id,
					name: courseRow.language.name,
					icon: courseRow.language.icon,
					fileExtension: courseRow.language.fileExtension,
					monacoLanguage: courseRow.language.monacoLanguage,
				},
				lessons: mappedLessons,
				isEnrolled,
				enrolledAt: enrollmentRow?.createdAt ?? null,
				completedLessons: completedLessonIds.size,
				totalLessons: courseRow.lessons.length,
			};
		}),

	enroll: protectedProcedure
		.input(enrollInput)
		.handler(async ({ input, context }) => {
			const { courseId } = input;
			const userId = context.session.user.id;

			const courseRow = await db.query.course.findFirst({
				where: and(eq(course.id, courseId), eq(course.isPublished, true)),
				columns: { id: true },
			});

			if (!courseRow) {
				throw new ORPCError("NOT_FOUND", { message: "Course not found" });
			}

			await db
				.insert(enrollment)
				.values({ id: nanoid(), userId, courseId })
				.onConflictDoNothing();

			return { success: true };
		}),

	completeLesson: protectedProcedure
		.input(completeLessonInput)
		.handler(async ({ input, context }) => {
			const { lessonId } = input;
			const userId = context.session.user.id;

			const lessonRow = await db.query.lesson.findFirst({
				where: eq(lesson.id, lessonId),
				with: {
					course: {
						columns: { id: true },
					},
				},
			});

			if (!lessonRow) {
				throw new ORPCError("NOT_FOUND", { message: "Lesson not found" });
			}

			const enrollmentRow = await db.query.enrollment.findFirst({
				where: and(
					eq(enrollment.userId, userId),
					eq(enrollment.courseId, lessonRow.course.id)
				),
				columns: { id: true },
			});

			if (!enrollmentRow) {
				throw new ORPCError("FORBIDDEN", {
					message: "You must enroll in this course first",
				});
			}

			if (lessonRow.sortOrder > 1) {
				const allLessons = await db.query.lesson.findMany({
					where: eq(lesson.courseId, lessonRow.course.id),
					orderBy: (l, { asc }) => asc(l.sortOrder),
					columns: { id: true, sortOrder: true },
				});

				const prevLesson = allLessons.find(
					(l) => l.sortOrder === lessonRow.sortOrder - 1
				);

				if (prevLesson) {
					const prevProgress = await db.query.lessonProgress.findFirst({
						where: and(
							eq(lessonProgress.userId, userId),
							eq(lessonProgress.lessonId, prevLesson.id)
						),
						columns: { id: true },
					});

					if (!prevProgress) {
						throw new ORPCError("FORBIDDEN", {
							message: "Complete the previous lesson first",
						});
					}
				}
			}

			await db
				.insert(lessonProgress)
				.values({
					id: nanoid(),
					userId,
					lessonId,
					completedAt: new Date(),
				})
				.onConflictDoNothing();

			return { success: true };
		}),
};
