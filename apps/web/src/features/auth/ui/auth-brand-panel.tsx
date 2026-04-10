import { cn } from "@ctl/ui/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import { ProjectLogo } from "@/shared/ui/project-logo";

type Props = {
	className?: string;
};

export const AuthBrandPanel = ({ className }: Props) => {
	const navigate = useNavigate();

	return (
		<div className={cn("relative hidden md:block", className)}>
			<img
				alt="Coding workspace"
				className="absolute inset-0 size-full object-cover"
				src="/images/coding.jpg"
			/>
			<div className="absolute inset-0 bg-black/60" />
			<div className="absolute top-8 right-8 size-56 rounded-full bg-primary/60 blur-3xl" />
			<div className="absolute bottom-8 left-8 size-48 rounded-full bg-primary/45 blur-3xl" />
			<div className="absolute inset-0 flex flex-col items-center justify-center">
				<div className="relative z-10 flex flex-col items-center gap-5 text-center">
					<button
						className="flex size-14 cursor-pointer items-center justify-center rounded-2xl border border-primary/40 bg-primary/25 backdrop-blur-sm"
						onClick={() => navigate({ to: "/" })}
						type="button"
					>
						<ProjectLogo
							iconClassName="h-6 w-8 text-primary-foreground"
							iconTone="currentColor"
							showText={false}
							variant="onDark"
						/>
					</button>
					<div>
						<p className="mt-2 max-w-[180px] text-balance text-sm text-zinc-300">
							Master programming with AI‑powered learning
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};
