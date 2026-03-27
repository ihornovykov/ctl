import { Button } from "@ctl/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@ctl/ui/components/dialog";

import { useDialogsStore } from "@/shared/stores";

export const DialogRenderer = () => {
	const { stack, close } = useDialogsStore();

	return (
		<>
			{stack.map((dialog) => {
				const hasIcon = !!dialog.titleIcon;
				const hasButtons = !!dialog.buttons?.length;

				return (
					<Dialog
						key={dialog.id}
						onOpenChange={(open) => {
							if (!open) {
								close();
							}
						}}
						open={dialog.visible}
					>
						<DialogContent
							className={hasIcon ? "text-center" : undefined}
							showCloseButton={!hasButtons}
						>
							<div className="flex flex-row gap-4">
								{hasIcon && (
									<div className="flex justify-center">
										<div className="flex size-12 items-center justify-center rounded-xl border border-border/40 bg-muted/60 *:[svg]:size-5">
											{dialog.titleIcon}
										</div>
									</div>
								)}

								{(dialog.title || dialog.description) && (
									<DialogHeader className={hasIcon ? "gap-1" : undefined}>
										{dialog.title && (
											<DialogTitle className="text-start font-semibold text-base">
												{dialog.title}
											</DialogTitle>
										)}
										{dialog.description && (
											<DialogDescription className="text-start text-sm leading-relaxed">
												{dialog.description}
											</DialogDescription>
										)}
									</DialogHeader>
								)}
							</div>

							{dialog.content && (
								<div>
									{typeof dialog.content === "function"
										? dialog.content({ close })
										: dialog.content}
								</div>
							)}

							{hasButtons && (
								<DialogFooter className={hasIcon ? "gap-2" : undefined}>
									{dialog.buttons?.map((btn) => (
										<Button
											icon={btn.icon}
											key={btn.text}
											loading={btn.loading}
											onClick={async () => {
												await btn.onClick();
											}}
											variant={
												btn.variant === "primary" ? "default" : "outline"
											}
										>
											{btn.text}
										</Button>
									))}
								</DialogFooter>
							)}
						</DialogContent>
					</Dialog>
				);
			})}
		</>
	);
};
