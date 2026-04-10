import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "@ctl/ui/lib/utils";
import type { ItemInstance, TreeInstance } from "@headless-tree/core";
import { IconChevronDown, IconMinus, IconPlus } from "@tabler/icons-react";
import {
	type CSSProperties,
	createContext,
	type HTMLAttributes,
	type ReactNode,
	useContext,
} from "react";

type ToggleIconType = "chevron" | "plus-minus";

type TreeContextValue = {
	currentItem?: ItemInstance<unknown>;
	indent: number;
	toggleIconType?: ToggleIconType;
	tree?: TreeInstance<unknown>;
};

const TreeContext = createContext<TreeContextValue>({
	indent: 20,
	currentItem: undefined,
	tree: undefined,
	toggleIconType: "plus-minus",
});

const useTreeContext = () => useContext(TreeContext);

type TreeProps<T = unknown> = HTMLAttributes<HTMLDivElement> & {
	indent?: number;
	toggleIconType?: ToggleIconType;
	tree?: TreeInstance<T>;
};

function Tree<T = unknown>({
	indent = 20,
	tree,
	className,
	toggleIconType = "chevron",
	...props
}: TreeProps<T>) {
	const containerProps =
		tree && typeof tree.getContainerProps === "function"
			? tree.getContainerProps()
			: {};
	const mergedProps = { ...props, ...containerProps };

	const { style: propStyle, ...otherProps } = mergedProps;

	const mergedStyle = {
		...propStyle,
		"--tree-indent": `${indent}px`,
	} as CSSProperties & Record<`--${string}`, string | number>;

	return (
		<TreeContext.Provider
			value={{
				indent,
				tree: tree as TreeInstance<unknown> | undefined,
				toggleIconType,
			}}
		>
			<div
				className={cn("flex flex-col", className)}
				data-slot="tree"
				style={mergedStyle}
				{...otherProps}
			/>
		</TreeContext.Provider>
	);
}

type TreeItemProps<T = unknown> = Omit<
	useRender.ComponentProps<"button">,
	"indent"
> & {
	indent?: number;
	item: ItemInstance<T>;
};

function TreeItem<T = unknown>({
	item,
	className,
	render,
	children,
	...props
}: TreeItemProps<T>) {
	const parentContext = useTreeContext();
	const { indent } = parentContext;

	const itemProps = typeof item.getProps === "function" ? item.getProps() : {};
	const mergedProps = { ...props, children, ...itemProps };

	const { style: propStyle, ...otherProps } = mergedProps;

	const mergedStyle = {
		...propStyle,
		"--tree-padding": `${item.getItemMeta().level * indent}px`,
	} as CSSProperties & Record<`--${string}`, string | number>;

	const defaultProps = {
		"data-slot": "tree-item",
		style: mergedStyle,
		className: cn(
			"z-10 select-none ps-(--tree-padding) not-last:pb-0.5 outline-hidden focus:z-20 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
			className
		),
		"data-focus":
			typeof item.isFocused === "function" ? item.isFocused() : undefined,
		"data-folder":
			typeof item.isFolder === "function" ? item.isFolder() : undefined,
		"data-selected":
			typeof item.isSelected === "function" ? item.isSelected() : undefined,
		"data-drag-target":
			typeof item.isDragTarget === "function" ? item.isDragTarget() : undefined,
		"data-search-match":
			typeof item.isMatchingSearch === "function"
				? item.isMatchingSearch()
				: undefined,
		"aria-expanded": item.isExpanded(),
	};

	return (
		<TreeContext.Provider
			value={{
				...parentContext,
				currentItem: item as ItemInstance<unknown>,
			}}
		>
			{useRender({
				defaultTagName: "button",
				render,
				props: mergeProps<"button">(defaultProps, otherProps),
			})}
		</TreeContext.Provider>
	);
}

type TreeItemLabelProps<T = unknown> = HTMLAttributes<HTMLSpanElement> & {
	item?: ItemInstance<T>;
};

function renderFolderToggle(
	item: ItemInstance<unknown>,
	toggleIconType: ToggleIconType | undefined
): ReactNode {
	if (!item.isFolder()) {
		return null;
	}
	if (toggleIconType === "plus-minus") {
		if (item.isExpanded()) {
			return (
				<IconMinus
					className="size-3.5 text-muted-foreground"
					stroke="currentColor"
					strokeWidth={1}
				/>
			);
		}
		return (
			<IconPlus
				className="size-3.5 text-muted-foreground"
				stroke="currentColor"
				strokeWidth={1}
			/>
		);
	}
	return (
		<IconChevronDown className="size-4 in-aria-[expanded=false]:-rotate-90 text-muted-foreground" />
	);
}

function TreeItemLabel<T = unknown>({
	item: propItem,
	children,
	className,
	...props
}: TreeItemLabelProps<T>) {
	const { currentItem, toggleIconType } = useTreeContext();
	const item = (propItem ?? currentItem) as ItemInstance<unknown> | undefined;

	if (!item) {
		return null;
	}

	return (
		<span
			className={cn(
				"flex items-center gap-1 bg-background in-data-[drag-target=true]:bg-accent in-data-[search-match=true]:bg-blue-50! in-data-[selected=true]:bg-accent not-in-data-[folder=true]:ps-7 in-data-[selected=true]:text-accent-foreground in-focus-visible:ring-[3px] in-focus-visible:ring-ring/50 transition-colors hover:bg-accent [&_svg]:pointer-events-none [&_svg]:shrink-0",
				"rounded-sm",
				"py-1.5",
				"px-2",
				"text-sm",
				className
			)}
			data-slot="tree-item-label"
			{...props}
		>
			{renderFolderToggle(item, toggleIconType)}
			{children ??
				(typeof item.getItemName === "function" ? item.getItemName() : null)}
		</span>
	);
}

type TreeDragLineProps = HTMLAttributes<HTMLDivElement>;

const TreeDragLine = ({ className, ...props }: TreeDragLineProps) => {
	const { tree } = useTreeContext();

	if (!tree || typeof tree.getDragLineStyle !== "function") {
		return null;
	}

	const dragLine = tree.getDragLineStyle();
	return (
		<div
			className={cn(
				"absolute z-30 -mt-px h-0.5 w-[unset] bg-primary before:absolute before:-top-[3px] before:left-0 before:size-2 before:border-2 before:border-primary before:bg-background",
				"before:rounded-full",
				className
			)}
			style={dragLine}
			{...props}
		/>
	);
};

export { Tree, TreeDragLine, TreeItem, TreeItemLabel };
