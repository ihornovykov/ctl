import type {
	EnrollmentSummary,
	WeeklyLanguageActivity,
} from "@ctl/api/routers/dashboard/validation";

const hasWeeklyLessonActivity = (w: WeeklyLanguageActivity) =>
	w.rows.some((row) => Object.values(row.counts).some((count) => count > 0));

export const shouldShowLearningActivitySection = (input: {
	enrollments: EnrollmentSummary[];
	weeklyLanguageActivity: WeeklyLanguageActivity;
}) =>
	input.enrollments.length > 0 ||
	hasWeeklyLessonActivity(input.weeklyLanguageActivity);
