import { Input } from "@ctl/ui/components/input";
import { cn } from "@ctl/ui/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import type { ComponentProps } from "react";
import { forwardRef, useState } from "react";

export const PasswordInput = forwardRef<
	HTMLInputElement,
	ComponentProps<"input">
>(({ className, ...props }, ref) => {
	const [visible, setVisible] = useState(false);

	return (
		<div className="relative">
			<Input
				className={cn("h-10 pr-10", className)}
				ref={ref}
				type={visible ? "text" : "password"}
				{...props}
			/>
			<button
				aria-label={visible ? "Hide password" : "Show password"}
				className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
				onClick={() => setVisible((v) => !v)}
				tabIndex={-1}
				type="button"
			>
				{visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
			</button>
		</div>
	);
});

PasswordInput.displayName = "PasswordInput";
