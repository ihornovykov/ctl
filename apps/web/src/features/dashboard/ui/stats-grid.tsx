import type { ProfileStats } from "@ctl/api/routers/dashboard/validation";
import { Card } from "@ctl/ui/components/card";
import { Skeleton } from "@ctl/ui/components/skeleton";
import {
	BookOpen,
	CheckCircle2,
	Clock,
	Flame,
	GraduationCap,
	type LucideIcon,
	Zap,
} from "lucide-react";
import { range } from "@/shared/lib/arrays";

type StatCardProps = {
	icon: LucideIcon;
	label: string;
	value: string | number;
	description?: string;
	iconClassName?: string;
	delay?: number;
};

const StatCard = ({
	icon: Icon,
	label,
	value,
	description,
	iconClassName = "text-primary",
	delay = 0,
}: StatCardProps) => (
	<div
		className="fade-in slide-in-from-bottom-4 animate-in fill-mode-backwards duration-500"
		style={{ animationDelay: `${delay}ms` }}
	>
		<Card className="group relative overflow-hidden border-border/60 p-5 transition-all hover:border-primary/30 hover:shadow-sm">
			<div className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/[0.03] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
			<div className="flex items-start justify-between gap-3">
				<div className="flex flex-col gap-1">
					<span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
						{label}
					</span>
					<span className="font-bold text-3xl tracking-tight">{value}</span>
					{description && (
						<span className="text-muted-foreground text-xs">{description}</span>
					)}
				</div>
				<div className="rounded-lg bg-muted/60 p-2.5">
					<Icon className={`size-5 ${iconClassName}`} />
				</div>
			</div>
		</Card>
	</div>
);

type Props = {
	stats: ProfileStats;
};

export const StatsGrid = ({ stats }: Props) => (
	<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
		<StatCard
			delay={80}
			description="Total enrolled"
			icon={BookOpen}
			iconClassName="text-primary"
			label="Courses"
			value={stats.coursesEnrolled}
		/>
		<StatCard
			delay={120}
			description="All lessons done"
			icon={GraduationCap}
			iconClassName="text-emerald-500"
			label="Completed"
			value={stats.coursesCompleted}
		/>
		<StatCard
			delay={160}
			description="Lessons finished"
			icon={CheckCircle2}
			iconClassName="text-sky-500"
			label="Lessons"
			value={stats.lessonsCompleted}
		/>
		<StatCard
			delay={200}
			description="Based on progress"
			icon={Clock}
			iconClassName="text-amber-500"
			label="Hours"
			value={`${stats.totalLearningHours}h`}
		/>
		<StatCard
			delay={240}
			description={
				stats.longestStreak > 0
					? `Best: ${stats.longestStreak} days`
					: "Keep going!"
			}
			icon={stats.currentStreak > 2 ? Flame : Zap}
			iconClassName={
				stats.currentStreak > 2 ? "text-orange-500" : "text-yellow-500"
			}
			label="Streak"
			value={`${stats.currentStreak}d`}
		/>
	</div>
);

export const StatsGridSkeleton = () => (
	<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
		{range(5).map((i) => (
			<Card className="border-border/60 p-5" key={i}>
				<div className="flex items-start justify-between gap-3">
					<div className="flex flex-col gap-2">
						<Skeleton className="h-3 w-16" />
						<Skeleton className="h-8 w-12" />
					</div>
					<Skeleton className="size-10 rounded-lg" />
				</div>
			</Card>
		))}
	</div>
);
