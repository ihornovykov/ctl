import { cn } from "@ctl/ui/lib/utils";
import type { CSSProperties, ReactNode } from "react";
import { match } from "ts-pattern";

import {
	PROJECT_LOGO_MARK_SRC,
	PROJECT_NAME,
	projectNameDisplayParts,
} from "@/shared/constants";

type Props = {
	className?: string;
	iconClassName?: string;
	iconTone?: "original" | "currentColor";
	textClassName?: string;
	variant?: "default" | "onDark";
	showText?: boolean;
};

const iconMaskStyle = (src: string): CSSProperties => ({
	maskImage: `url("${src}")`,
	WebkitMaskImage: `url("${src}")`,
	maskSize: "contain",
	WebkitMaskSize: "contain",
	maskRepeat: "no-repeat",
	WebkitMaskRepeat: "no-repeat",
	maskPosition: "center",
	WebkitMaskPosition: "center",
});

const learnGradient =
	"bg-gradient-to-r bg-clip-text text-transparent from-[#0077B6] to-[#00D4FF] dark:from-[#38BDF8] dark:to-[#22D3EE]";
const learnGradientOnDark =
	"bg-gradient-to-r from-[#38BDF8] to-[#22D3EE] bg-clip-text text-transparent";

export const ProjectLogo = ({
	className,
	iconClassName,
	iconTone = "original",
	textClassName,
	variant = "default",
	showText = true,
}: Props) => {
	const { prefix, suffix } = projectNameDisplayParts;

	const monotoneMarkClassName = cn(
		"inline-block shrink-0 bg-current",
		"h-7 min-h-7 w-10 min-w-7",
		iconClassName
	);
	const monotoneMarkStyle = iconMaskStyle(PROJECT_LOGO_MARK_SRC);

	const mark: ReactNode = match([iconTone, showText] as const)
		.with(["currentColor", true], () => (
			<span
				aria-hidden
				className={monotoneMarkClassName}
				style={monotoneMarkStyle}
			/>
		))
		.with(["currentColor", false], () => (
			<span
				aria-label={PROJECT_NAME}
				className={monotoneMarkClassName}
				role="img"
				style={monotoneMarkStyle}
			/>
		))
		.with(["original", true], () => (
			<img
				alt=""
				className={cn("h-4.5 w-auto shrink-0 object-contain", iconClassName)}
				decoding="async"
				src={PROJECT_LOGO_MARK_SRC}
			/>
		))
		.with(["original", false], () => (
			<img
				alt={PROJECT_NAME}
				className={cn("h-4.5 w-auto shrink-0 object-contain", iconClassName)}
				decoding="async"
				src={PROJECT_LOGO_MARK_SRC}
			/>
		))
		.exhaustive();

	const nameContent = match(suffix)
		.with(null, () => <span>{prefix}</span>)
		.otherwise((s) => (
			<>
				<span>{prefix}</span>
				<span
					className={match(variant)
						.with("default", () => learnGradient)
						.with("onDark", () => learnGradientOnDark)
						.exhaustive()}
				>
					{s}
				</span>
			</>
		));

	const variantTextClass = match(variant)
		.with("default", () => "text-[#1A1E26] dark:text-white" as const)
		.with("onDark", () => "text-white" as const)
		.exhaustive();

	const textBlock = match(showText)
		.with(true, () => (
			<span
				className={cn(
					"pt-0.5 font-bold text-lg tracking-tight",
					variantTextClass,
					textClassName
				)}
			>
				{nameContent}
			</span>
		))
		.with(false, () => null)
		.exhaustive();

	return (
		<span
			className={cn("inline-flex items-center gap-1.5", className)}
			data-slot="project-logo"
		>
			{mark}
			{textBlock}
		</span>
	);
};
