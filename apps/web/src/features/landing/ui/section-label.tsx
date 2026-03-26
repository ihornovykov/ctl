import type { ReactNode } from "react";

export const SectionLabel = ({ children }: { children: ReactNode }) => (
	<div className="flex items-center gap-2">
		<div className="h-px w-6 bg-primary" />
		<span className="font-medium text-primary text-sm uppercase tracking-widest">
			{children}
		</span>
	</div>
);
