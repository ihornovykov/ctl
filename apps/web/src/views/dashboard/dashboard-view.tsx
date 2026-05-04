import { Skeleton } from "@ctl/ui/components/skeleton";
import { Award, BookOpen, type LucideIcon } from "lucide-react";

import {
	CompletedCoursesList,
	EnrolledCoursesList,
	LearningCharts,
	LearningChartsSkeleton,
	ProfileHeader,
	ProfileHeaderSkeleton,
	StatsGrid,
	StatsGridSkeleton,
	shouldShowLearningActivitySection,
	useProfile,
} from "@/features/dashboard";
import { range } from "@/shared/lib/arrays";

type Props = {
	icon: LucideIcon;
	title: string;
};

const SectionTitle = ({ icon: Icon, title }: Props) => (
	<div className="flex items-center gap-2.5">
		<div className="flex size-7 items-center justify-center rounded-lg bg-muted">
			<Icon className="size-4 text-muted-foreground" />
		</div>
		<h2 className="font-semibold text-lg">{title}</h2>
	</div>
);

const CompletedSkeleton = () => (
	<div className="grid gap-4 sm:grid-cols-2">
		{range(2).map((i) => (
			<div
				className="flex flex-col gap-4 rounded-xl border border-border/60 p-5"
				key={i}
			>
				<div className="flex items-start gap-4">
					<Skeleton className="size-12 rounded-xl" />
					<div className="flex flex-col gap-2">
						<Skeleton className="h-5 w-40" />
						<Skeleton className="h-4 w-28" />
					</div>
				</div>
				<div className="flex items-center justify-between border-border/40 border-t pt-3">
					<Skeleton className="h-4 w-24" />
					<Skeleton className="h-8 w-36" />
				</div>
			</div>
		))}
	</div>
);

const InProgressSkeleton = () => (
	<div className="grid gap-4 sm:grid-cols-2">
		{range(2).map((i) => (
			<div
				className="flex flex-col gap-4 rounded-xl border border-border/60 p-5"
				key={i}
			>
				<div className="flex items-start gap-4">
					<Skeleton className="size-12 rounded-xl" />
					<div className="flex flex-col gap-2">
						<Skeleton className="h-5 w-40" />
						<Skeleton className="h-4 w-28" />
					</div>
				</div>
				<Skeleton className="h-1.5 w-full rounded-full" />
				<Skeleton className="h-8 w-full" />
			</div>
		))}
	</div>
);

export const DashboardView = () => {
	const { data, isPending } = useProfile();
	const showLearningActivity =
		isPending || (data != null && shouldShowLearningActivitySection(data));

	return (
		<div className="flex flex-1 flex-col">
			{isPending && <ProfileHeaderSkeleton />}
			{!isPending && data && (
				<ProfileHeader stats={data.stats} user={data.user} />
			)}

			<div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
				<div className="flex flex-col gap-10">
					<section className="flex flex-col gap-4">
						<div
							className="fade-in slide-in-from-bottom-2 animate-in fill-mode-backwards duration-500"
							style={{ animationDelay: "60ms" }}
						>
							<h2 className="font-semibold text-lg">Your Progress</h2>
						</div>
						{isPending && <StatsGridSkeleton />}
						{!isPending && data && <StatsGrid stats={data.stats} />}
					</section>

					{showLearningActivity ? (
						<section className="flex flex-col gap-4">
							<div
								className="fade-in slide-in-from-bottom-2 animate-in fill-mode-backwards duration-500"
								style={{ animationDelay: "80ms" }}
							>
								<h2 className="font-semibold text-lg">Learning Activity</h2>
							</div>
							{isPending && <LearningChartsSkeleton />}
							{!isPending && data && (
								<LearningCharts
									enrollments={data.enrollments}
									weeklyLanguageActivity={data.weeklyLanguageActivity}
								/>
							)}
						</section>
					) : null}

					<section className="flex flex-col gap-4">
						<div
							className="fade-in slide-in-from-bottom-2 animate-in fill-mode-backwards duration-500"
							style={{ animationDelay: "100ms" }}
						>
							<SectionTitle icon={Award} title="Completed Courses" />
						</div>
						{isPending && <CompletedSkeleton />}
						{!isPending && data && (
							<CompletedCoursesList enrollments={data.enrollments} />
						)}
					</section>

					<section className="flex flex-col gap-4">
						<div
							className="fade-in slide-in-from-bottom-2 animate-in fill-mode-backwards duration-500"
							style={{ animationDelay: "140ms" }}
						>
							<SectionTitle icon={BookOpen} title="In Progress" />
						</div>
						{isPending && <InProgressSkeleton />}
						{!isPending && data && (
							<EnrolledCoursesList enrollments={data.enrollments} />
						)}
					</section>
				</div>
			</div>
		</div>
	);
};
