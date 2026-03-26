import { cn } from "@ctl/ui/lib/utils";
import { Code2 } from "lucide-react";

type Props = {
	className?: string;
};

export const AuthBrandPanel = ({ className }: Props) => (
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
				<div className="flex size-14 items-center justify-center rounded-2xl border border-primary/40 bg-primary/25 backdrop-blur-sm">
					<Code2 className="size-7 text-primary-foreground" />
				</div>
				<div>
					<p className="font-bold text-white text-xl">CodeLearn</p>
					<p className="mt-2 max-w-[180px] text-balance text-sm text-zinc-300">
						Master programming with AI‑powered learning
					</p>
				</div>
			</div>
		</div>
	</div>
);
