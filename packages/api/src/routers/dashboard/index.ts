import { db } from "@ctl/db";
import { ORPCError } from "@orpc/server";

import { protectedProcedure } from "../../index";
import {
	type EnrollmentSummary,
	type ProfileOutput,
	profileOutputSchema,
	type WeeklyLanguageActivity,
	type WeeklyLanguageRef,
} from "./validation";

const SHORT_MONTHS = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec",
];

const getWeekBuckets = (): Array<{
	weekStart: Date;
	weekEnd: Date;
	label: string;
}> => {
	const now = new Date();
	const buckets: Array<{ weekStart: Date; weekEnd: Date; label: string }> = [];

	for (let w = 7; w >= 0; w--) {
		const weekEnd = new Date(now);
		weekEnd.setDate(now.getDate() - w * 7);
		weekEnd.setHours(23, 59, 59, 999);

		const weekStart = new Date(weekEnd);
		weekStart.setDate(weekEnd.getDate() - 6);
		weekStart.setHours(0, 0, 0, 0);

		const label = `${SHORT_MONTHS[weekStart.getMonth()]} ${weekStart.getDate()}`;
		buckets.push({ weekStart, weekEnd, label });
	}

	return buckets;
};

const buildWeeklyLanguageActivity = (
	completions: { completedAt: Date; languageId: string }[],
	languageCatalog: WeeklyLanguageRef[]
): WeeklyLanguageActivity => {
	const buckets = getWeekBuckets();
	const rows = buckets.map(({ weekStart, weekEnd, label }) => {
		const counts: Record<string, number> = {};
		for (const lang of languageCatalog) {
			counts[lang.id] = 0;
		}
		for (const c of completions) {
			if (c.completedAt >= weekStart && c.completedAt <= weekEnd) {
				counts[c.languageId] = (counts[c.languageId] ?? 0) + 1;
			}
		}
		return { week: label, counts };
	});

	const totals = new Map<string, number>();
	for (const lang of languageCatalog) {
		totals.set(lang.id, 0);
	}
	for (const row of rows) {
		for (const [id, n] of Object.entries(row.counts)) {
			totals.set(id, (totals.get(id) ?? 0) + n);
		}
	}

	const languages = [...languageCatalog].sort(
		(a, b) => (totals.get(b.id) ?? 0) - (totals.get(a.id) ?? 0)
	);

	return { rows, languages };
};

const computeStreaks = (
	dates: Date[]
): { current: number; longest: number } => {
	if (dates.length === 0) {
		return { current: 0, longest: 0 };
	}

	const daySet = new Set(
		dates.map((d) => {
			const day = new Date(d);
			day.setHours(0, 0, 0, 0);
			return day.getTime();
		})
	);

	const sortedDays = [...daySet].sort((a, b) => b - a);
	const ONE_DAY = 86_400_000;

	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const todayTime = today.getTime();

	let current = 0;
	let longest = 1;
	let runLength = 1;

	if (sortedDays[0] === todayTime || sortedDays[0] === todayTime - ONE_DAY) {
		current = 1;
		for (let i = 1; i < sortedDays.length; i++) {
			const prev = sortedDays[i - 1] ?? 0;
			const curr = sortedDays[i] ?? 0;
			if (prev - curr === ONE_DAY) {
				current++;
			} else {
				break;
			}
		}
	}

	for (let i = 1; i < sortedDays.length; i++) {
		const prev = sortedDays[i - 1] ?? 0;
		const curr = sortedDays[i] ?? 0;
		if (prev - curr === ONE_DAY) {
			runLength++;
			if (runLength > longest) {
				longest = runLength;
			}
		} else {
			runLength = 1;
		}
	}

	return { current, longest };
};

export const dashboardRouter = {
	getProfile: protectedProcedure
		.output(profileOutputSchema)
		.handler(async ({ context }): Promise<ProfileOutput> => {
			const userId = context.session.user.id;

			const userRow = await db.query.user.findFirst({
				where: (u, { eq: eqFn }) => eqFn(u.id, userId),
				columns: {
					id: true,
					name: true,
					email: true,
					image: true,
					createdAt: true,
				},
			});

			if (!userRow) {
				throw new ORPCError("NOT_FOUND", { message: "User not found" });
			}

			const enrollmentRows = await db.query.enrollment.findMany({
				where: (e, { eq: eqFn }) => eqFn(e.userId, userId),
				columns: { id: true, courseId: true, createdAt: true },
				orderBy: (e, { desc }) => desc(e.createdAt),
			});

			if (enrollmentRows.length === 0) {
				return {
					user: {
						name: userRow.name,
						email: userRow.email,
						image: userRow.image,
						createdAt: userRow.createdAt,
					},
					stats: {
						coursesEnrolled: 0,
						coursesCompleted: 0,
						lessonsCompleted: 0,
						totalLearningHours: 0,
						currentStreak: 0,
						longestStreak: 0,
					},
					enrollments: [],
					weeklyLanguageActivity: buildWeeklyLanguageActivity([], []),
				};
			}

			const courseIds = enrollmentRows.map((e) => e.courseId);

			const courseRows = await db.query.course.findMany({
				where: (c, { inArray: inArrayFn }) => inArrayFn(c.id, courseIds),
				with: { language: true },
			});

			const courseMap = new Map(courseRows.map((c) => [c.id, c]));

			const lessonRows =
				courseIds.length > 0
					? await db.query.lesson.findMany({
							where: (l, { inArray: inArrayFn }) =>
								inArrayFn(l.courseId, courseIds),
							columns: { id: true, courseId: true },
						})
					: [];

			const lessonsByCourse = new Map<string, string[]>();
			for (const l of lessonRows) {
				const list = lessonsByCourse.get(l.courseId) ?? [];
				list.push(l.id);
				lessonsByCourse.set(l.courseId, list);
			}

			const allLessonIds = lessonRows.map((l) => l.id);

			const allProgressRows =
				allLessonIds.length > 0
					? await db.query.lessonProgress.findMany({
							where: (lp, { and: andFn, eq: eqFn, inArray: inArrayFn }) =>
								andFn(
									eqFn(lp.userId, userId),
									inArrayFn(lp.lessonId, allLessonIds)
								),
						})
					: [];

			const progressByLesson = new Map(
				allProgressRows.map((p) => [p.lessonId, p])
			);

			const lessonById = new Map(lessonRows.map((l) => [l.id, l]));

			const seenLang = new Set<string>();
			const languageCatalog: WeeklyLanguageRef[] = [];
			for (const c of courseRows) {
				if (!seenLang.has(c.language.id)) {
					seenLang.add(c.language.id);
					languageCatalog.push({
						id: c.language.id,
						name: c.language.name,
					});
				}
			}

			const completions = allProgressRows
				.map((p) => {
					const lesson = lessonById.get(p.lessonId);
					if (!lesson) {
						return null;
					}
					const courseRow = courseMap.get(lesson.courseId);
					if (!courseRow) {
						return null;
					}
					return {
						completedAt: p.completedAt,
						languageId: courseRow.language.id,
					};
				})
				.filter(
					(x): x is { completedAt: Date; languageId: string } => x !== null
				);

			const { current: currentStreak, longest: longestStreak } = computeStreaks(
				allProgressRows.map((p) => p.completedAt)
			);

			let coursesCompleted = 0;
			let totalLearningHours = 0;

			const enrollments: EnrollmentSummary[] = enrollmentRows.flatMap((e) => {
				const courseRow = courseMap.get(e.courseId);
				if (!courseRow) {
					return [];
				}

				const lessonIds = lessonsByCourse.get(e.courseId) ?? [];
				const totalLessons = lessonIds.length;
				const completedLessonIds = lessonIds.filter((id) =>
					progressByLesson.has(id)
				);
				const completedLessons = completedLessonIds.length;
				const isCompleted =
					totalLessons > 0 && completedLessons === totalLessons;

				if (isCompleted) {
					coursesCompleted++;
				}

				const ratio = totalLessons > 0 ? completedLessons / totalLessons : 0;
				totalLearningHours += Math.round(courseRow.estimatedHours * ratio);

				let completedAt: Date | null = null;
				if (isCompleted) {
					const progressDates = completedLessonIds
						.map((id) => progressByLesson.get(id)?.completedAt)
						.filter((d): d is Date => d !== undefined);
					completedAt =
						progressDates.length > 0
							? progressDates.reduce((latest, d) => (d > latest ? d : latest))
							: null;
				}

				const certificateId = isCompleted
					? Buffer.from(`${userId}:${e.courseId}`)
							.toString("base64")
							.replace(/[^a-zA-Z0-9]/g, "")
							.slice(0, 16)
							.toUpperCase()
					: null;

				return [
					{
						courseId: e.courseId,
						courseTitle: courseRow.title,
						courseSlug: courseRow.slug,
						difficulty: courseRow.difficulty,
						estimatedHours: courseRow.estimatedHours,
						languageId: courseRow.language.id,
						languageName: courseRow.language.name,
						languageIcon: courseRow.language.icon,
						enrolledAt: e.createdAt,
						completedLessons,
						totalLessons,
						isCompleted,
						completedAt,
						certificateId,
					},
				];
			});

			return {
				user: {
					name: userRow.name,
					email: userRow.email,
					image: userRow.image,
					createdAt: userRow.createdAt,
				},
				stats: {
					coursesEnrolled: enrollmentRows.length,
					coursesCompleted,
					lessonsCompleted: allProgressRows.length,
					totalLearningHours,
					currentStreak,
					longestStreak,
				},
				enrollments,
				weeklyLanguageActivity: buildWeeklyLanguageActivity(
					completions,
					languageCatalog
				),
			};
		}),
};
