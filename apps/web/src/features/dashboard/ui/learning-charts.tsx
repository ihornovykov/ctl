import type {
	EnrollmentSummary,
	WeeklyLanguageActivity,
} from "@ctl/api/routers/dashboard/validation";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@ctl/ui/components/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@ctl/ui/components/chart";
import { Skeleton } from "@ctl/ui/components/skeleton";
import {
	Area,
	AreaChart,
	CartesianGrid,
	Cell,
	Pie,
	PieChart,
	XAxis,
	YAxis,
} from "recharts";

import { getDashboardChartLangColor } from "../lib/utils";

type LanguageActivityProps = { data: WeeklyLanguageActivity };

const LanguageStackedActivityChart = ({ data }: LanguageActivityProps) => {
	const { rows, languages } = data;
	const chartData = rows.map((r) => ({ week: r.week, ...r.counts }));
	const totalInPeriod = rows.reduce(
		(sum, row) => sum + Object.values(row.counts).reduce((a, b) => a + b, 0),
		0
	);

	const chartConfig = Object.fromEntries(
		languages.map((l) => [
			l.id,
			{ label: l.name, color: getDashboardChartLangColor(l.id) },
		])
	) satisfies ChartConfig;

	if (languages.length === 0) {
		return (
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="font-semibold">Weekly Activity</CardTitle>
					<CardDescription>
						Lessons completed by language over the last 8 weeks
					</CardDescription>
				</CardHeader>
				<CardContent className="flex min-h-[180px] items-center justify-center px-2 sm:px-4">
					<p className="text-muted-foreground text-sm">No courses yet</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader className="flex flex-row items-start justify-between pb-2">
				<div>
					<CardTitle className="font-semibold">Weekly Activity</CardTitle>
					<CardDescription>
						Lessons completed by language over the last 8 weeks
					</CardDescription>
				</div>
				<div className="text-right">
					<p className="font-bold text-2xl tabular-nums">{totalInPeriod}</p>
					<p className="text-muted-foreground text-xs">lessons in period</p>
				</div>
			</CardHeader>
			<CardContent className="px-2 pt-0 sm:px-4">
				<ChartContainer className="h-[220px] w-full" config={chartConfig}>
					<AreaChart
						accessibilityLayer
						data={chartData}
						margin={{ left: 4, right: 8, top: 8, bottom: 0 }}
					>
						<CartesianGrid strokeDasharray="3 3" vertical={false} />
						<XAxis
							axisLine={false}
							dataKey="week"
							tick={{ fontSize: 11 }}
							tickLine={false}
							tickMargin={8}
						/>
						<YAxis
							allowDecimals={false}
							axisLine={false}
							tick={{ fontSize: 11 }}
							tickLine={false}
							tickMargin={4}
							width={28}
						/>
						<ChartTooltip
							content={
								<ChartTooltipContent
									indicator="dot"
									labelFormatter={(label) => `Week of ${label}`}
								/>
							}
							cursor={false}
						/>
						{languages.map((lang) => (
							<Area
								dataKey={lang.id}
								fill={`var(--color-${lang.id})`}
								fillOpacity={0.4}
								key={lang.id}
								stackId="a"
								stroke={`var(--color-${lang.id})`}
								type="natural"
							/>
						))}
					</AreaChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
};

type LangProps = { enrollments: EnrollmentSummary[] };

const LanguageDonut = ({ enrollments }: LangProps) => {
	const byLang = new Map<string, { id: string; name: string; count: number }>();
	for (const e of enrollments) {
		const entry = byLang.get(e.languageId) ?? {
			id: e.languageId,
			name: e.languageName,
			count: 0,
		};
		entry.count += e.completedLessons;
		byLang.set(e.languageId, entry);
	}

	const data = [...byLang.values()]
		.filter((l) => l.count > 0)
		.map((l) => ({
			...l,
			fill: `var(--color-${l.id})`,
		}));

	const chartConfig = Object.fromEntries(
		data.map((l) => [
			l.id,
			{ label: l.name, color: getDashboardChartLangColor(l.id) },
		])
	) satisfies ChartConfig;

	if (enrollments.length === 0) {
		return (
			<Card className="flex flex-col">
				<CardHeader className="pb-2">
					<CardTitle className="font-semibold">Languages</CardTitle>
					<CardDescription>Completed lessons by language</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-1 items-center justify-center">
					<p className="text-muted-foreground text-sm">No courses yet</p>
				</CardContent>
			</Card>
		);
	}

	if (data.length === 0) {
		return (
			<Card className="flex flex-col">
				<CardHeader className="pb-2">
					<CardTitle className="font-semibold">Languages</CardTitle>
					<CardDescription>Completed lessons by language</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-1 items-center justify-center">
					<p className="text-muted-foreground text-sm">
						No completed lessons yet
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="flex flex-col">
			<CardHeader className="pb-0">
				<CardTitle className="font-semibold">Languages</CardTitle>
				<CardDescription>Completed lessons by language</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-1 flex-col items-center gap-4 pt-2 pb-4">
				<ChartContainer
					className="mx-auto h-[160px] w-full max-w-[200px]"
					config={chartConfig}
				>
					<PieChart>
						<ChartTooltip
							content={<ChartTooltipContent hideLabel nameKey="name" />}
						/>
						<Pie
							cx="50%"
							cy="50%"
							data={data}
							dataKey="count"
							innerRadius={48}
							nameKey="name"
							outerRadius={72}
							paddingAngle={3}
							strokeWidth={2}
						>
							{data.map((entry) => (
								<Cell fill={entry.fill} key={entry.id} />
							))}
						</Pie>
					</PieChart>
				</ChartContainer>

				<ul className="flex w-full flex-col gap-2">
					{data.map((l) => (
						<li
							className="flex items-center justify-between text-xs"
							key={l.id}
						>
							<div className="flex items-center gap-2">
								<span
									className="inline-block size-2.5 shrink-0 rounded-full"
									style={{ background: getDashboardChartLangColor(l.id) }}
								/>
								<span className="font-medium">{l.name}</span>
							</div>
							<span className="text-muted-foreground tabular-nums">
								{l.count} {l.count === 1 ? "lesson" : "lessons"}
							</span>
						</li>
					))}
				</ul>
			</CardContent>
		</Card>
	);
};

type ProgressProps = { enrollments: EnrollmentSummary[] };

const CourseProgressBars = ({ enrollments }: ProgressProps) => {
	if (enrollments.length === 0) {
		return (
			<Card className="flex flex-col">
				<CardHeader className="pb-2">
					<CardTitle className="font-semibold">Course Progress</CardTitle>
					<CardDescription>Lessons completed per course</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-1 items-center justify-center">
					<p className="text-muted-foreground text-sm">No courses enrolled</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader className="pb-4">
				<CardTitle className="font-semibold">Course Progress</CardTitle>
				<CardDescription>Lessons completed per course</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				{enrollments.map((e) => {
					const pct =
						e.totalLessons > 0
							? Math.round((e.completedLessons / e.totalLessons) * 100)
							: 0;
					const color = getDashboardChartLangColor(e.languageId);
					return (
						<div key={e.courseId}>
							<div className="mb-1.5 flex items-center justify-between gap-3">
								<span
									className="max-w-[70%] truncate font-medium text-sm"
									title={e.courseTitle}
								>
									{e.courseTitle}
								</span>
								<div className="flex shrink-0 items-center gap-2">
									<span
										className="font-semibold text-xs tabular-nums"
										style={{ color }}
									>
										{pct}%
									</span>
									<span className="text-muted-foreground text-xs">
										{e.completedLessons}/{e.totalLessons}
									</span>
								</div>
							</div>
							<div className="h-2 overflow-hidden rounded-full bg-muted">
								<div
									className="h-full rounded-full transition-all duration-700"
									style={{ width: `${pct}%`, background: color }}
								/>
							</div>
						</div>
					);
				})}
			</CardContent>
		</Card>
	);
};

type Props = {
	weeklyLanguageActivity: WeeklyLanguageActivity;
	enrollments: EnrollmentSummary[];
};

export const LearningCharts = ({
	weeklyLanguageActivity,
	enrollments,
}: Props) => (
	<div className="grid gap-4 lg:grid-cols-3">
		<div className="lg:col-span-3">
			<LanguageStackedActivityChart data={weeklyLanguageActivity} />
		</div>
		<LanguageDonut enrollments={enrollments} />
		<div className="lg:col-span-2">
			<CourseProgressBars enrollments={enrollments} />
		</div>
	</div>
);

export const LearningChartsSkeleton = () => (
	<div className="grid gap-4 lg:grid-cols-3">
		<Card className="lg:col-span-3">
			<CardHeader className="flex flex-row items-start justify-between pb-2">
				<div className="flex flex-col gap-2">
					<Skeleton className="h-4 w-32" />
					<Skeleton className="h-3 w-48" />
				</div>
				<div className="flex flex-col items-end gap-1">
					<Skeleton className="h-7 w-12" />
					<Skeleton className="h-3 w-20" />
				</div>
			</CardHeader>
			<CardContent className="px-4 pt-0">
				<Skeleton className="h-[220px] w-full rounded-lg" />
			</CardContent>
		</Card>

		<Card>
			<CardHeader className="pb-2">
				<Skeleton className="h-4 w-20" />
				<Skeleton className="h-3 w-32" />
			</CardHeader>
			<CardContent className="flex flex-col items-center gap-4">
				<Skeleton className="size-[160px] rounded-full" />
				<div className="flex w-full flex-col gap-2">
					{[1, 2, 3].map((i) => (
						<div className="flex items-center justify-between" key={i}>
							<div className="flex items-center gap-2">
								<Skeleton className="size-2.5 rounded-full" />
								<Skeleton className="h-3 w-20" />
							</div>
							<Skeleton className="h-3 w-14" />
						</div>
					))}
				</div>
			</CardContent>
		</Card>

		<Card className="lg:col-span-2">
			<CardHeader className="pb-4">
				<Skeleton className="h-4 w-28" />
				<Skeleton className="h-3 w-44" />
			</CardHeader>
			<CardContent className="flex flex-col gap-5">
				{[1, 2, 3].map((i) => (
					<div className="flex flex-col gap-1.5" key={i}>
						<div className="flex items-center justify-between">
							<Skeleton className="h-3.5 w-40" />
							<div className="flex gap-2">
								<Skeleton className="h-3 w-8" />
								<Skeleton className="h-3 w-10" />
							</div>
						</div>
						<Skeleton className="h-2 w-full rounded-full" />
					</div>
				))}
			</CardContent>
		</Card>
	</div>
);
