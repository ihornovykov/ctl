import { Dialog as SheetPrimitive } from "@base-ui/react/dialog";
import { Button } from "@ctl/ui/components/button";

import { cn } from "@ctl/ui/lib/utils";
import { IconX } from "@tabler/icons-react";
import type * as React from "react";

function Sheet({ ...props }: SheetPrimitive.Root.Props) {
	return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({ ...props }: SheetPrimitive.Trigger.Props) {
	return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({ ...props }: SheetPrimitive.Close.Props) {
	return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({ ...props }: SheetPrimitive.Portal.Props) {
	return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({ className, ...props }: SheetPrimitive.Backdrop.Props) {
	return (
		<SheetPrimitive.Backdrop
			className={cn(
				"fixed inset-0 z-50 bg-black/40 transition-[opacity,backdrop-filter] duration-300 ease-out data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-sm",
				className
			)}
			data-slot="sheet-overlay"
			{...props}
		/>
	);
}

function SheetContent({
	className,
	children,
	side = "right",
	showCloseButton = true,
	...props
}: SheetPrimitive.Popup.Props & {
	side?: "top" | "right" | "bottom" | "left";
	showCloseButton?: boolean;
}) {
	return (
		<SheetPortal>
			<SheetOverlay />
			<SheetPrimitive.Popup
				className={cn(
					"fixed z-50 flex flex-col gap-0 overflow-hidden border-border/60 bg-background text-popover-foreground text-sm shadow-2xl ring-1 ring-black/5 transition-[transform,opacity] duration-300 ease-out data-[side=left]:data-ending-style:-translate-x-full data-[side=left]:data-starting-style:-translate-x-full data-[side=right]:data-ending-style:translate-x-full data-[side=right]:data-starting-style:translate-x-full data-[side=bottom]:data-ending-style:translate-y-full data-[side=bottom]:data-starting-style:translate-y-full data-[side=top]:data-ending-style:-translate-y-full data-[side=top]:data-starting-style:-translate-y-full data-[side=bottom]:inset-x-0 data-[side=top]:inset-x-0 data-[side=left]:inset-y-0 data-[side=right]:inset-y-0 data-[side=top]:top-0 data-[side=right]:right-0 data-[side=bottom]:bottom-0 data-[side=left]:left-0 data-[side=bottom]:h-auto data-[side=left]:h-full data-[side=right]:h-full data-[side=top]:h-auto data-[side=left]:w-[min(100%,20rem)] data-[side=right]:w-[min(100%,20rem)] data-[side=bottom]:rounded-t-2xl data-[side=left]:rounded-r-2xl data-[side=top]:rounded-b-2xl data-[side=right]:rounded-l-2xl data-[side=bottom]:border-t data-[side=left]:border-r data-[side=top]:border-b data-[side=right]:border-l data-ending-style:opacity-0 data-starting-style:opacity-0 data-[side=left]:sm:max-w-sm data-[side=right]:sm:max-w-sm dark:ring-white/10",
					className
				)}
				data-side={side}
				data-slot="sheet-content"
				{...props}
			>
				{children}
				{showCloseButton && (
					<SheetPrimitive.Close
						data-slot="sheet-close"
						render={
							<Button
								className="absolute top-4 right-4"
								size="icon-sm"
								variant="ghost"
							/>
						}
					>
						<IconX />
						<span className="sr-only">Close</span>
					</SheetPrimitive.Close>
				)}
			</SheetPrimitive.Popup>
		</SheetPortal>
	);
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			className={cn("flex flex-col gap-1.5 p-4", className)}
			data-slot="sheet-header"
			{...props}
		/>
	);
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			className={cn("mt-auto flex flex-col gap-2 p-4", className)}
			data-slot="sheet-footer"
			{...props}
		/>
	);
}

function SheetTitle({ className, ...props }: SheetPrimitive.Title.Props) {
	return (
		<SheetPrimitive.Title
			className={cn("font-heading font-medium text-foreground", className)}
			data-slot="sheet-title"
			{...props}
		/>
	);
}

function SheetDescription({
	className,
	...props
}: SheetPrimitive.Description.Props) {
	return (
		<SheetPrimitive.Description
			className={cn("text-muted-foreground text-sm", className)}
			data-slot="sheet-description"
			{...props}
		/>
	);
}

export {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
};
