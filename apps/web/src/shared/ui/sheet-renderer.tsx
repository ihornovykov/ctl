import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@ctl/ui/components/sheet";

import { useSheetsStore } from "@/shared/stores";

export const SheetRenderer = () => {
	const { stack, close } = useSheetsStore();

	return (
		<>
			{stack.map((item) => (
				<Sheet
					key={item.id}
					onOpenChange={(open) => {
						if (!open) {
							close();
						}
					}}
					open={item.visible}
				>
					<SheetContent className="gap-0 p-0" side="right">
						<div className="flex max-h-[85dvh] min-h-0 flex-1 flex-col overflow-y-auto">
							<SheetHeader className="border-border/60 border-b bg-muted/30 px-4 pt-4 pb-4 text-start">
								<SheetTitle className="pt-0.5 font-heading font-semibold text-foreground text-lg tracking-tight">
									{item.title}
								</SheetTitle>
							</SheetHeader>
							{item.content}
						</div>
					</SheetContent>
				</Sheet>
			))}
		</>
	);
};
