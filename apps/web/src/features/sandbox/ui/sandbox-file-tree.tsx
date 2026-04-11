import { Tree, TreeItem, TreeItemLabel } from "@ctl/ui/components/tree";
import {
	hotkeysCoreFeature,
	selectionFeature,
	syncDataLoaderFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import {
	IconBraces,
	IconFile,
	IconFileCode,
	IconFileText,
	IconFolder,
	IconFolderOpen,
	IconHtml,
	IconPalette,
} from "@tabler/icons-react";
import { useEffect, useMemo } from "react";
import type { SandboxTreeItemData } from "../lib/constants";
import { listSandboxDirIds } from "../lib/utils";

type TreeIconData = Pick<SandboxTreeItemData, "children" | "type">;

type Props = {
	items: Record<string, SandboxTreeItemData>;
	rootId: string;
	activeFile: string;
	onSelectFile: (path: string) => void;
};

const indent = 14;

const getTreeFileIcon = (data: TreeIconData, isExpanded: boolean) => {
	const isFolder = (data.children?.length ?? 0) > 0;
	if (isFolder) {
		return isExpanded ? (
			<IconFolderOpen className="pointer-events-none size-4 text-amber-500" />
		) : (
			<IconFolder className="pointer-events-none size-4 text-amber-500" />
		);
	}

	const t = data.type;
	if (t === "tsx" || t === "ts" || t === "jsx" || t === "js") {
		return (
			<IconFileCode className="pointer-events-none size-4 text-blue-500" />
		);
	}
	if (t === "css") {
		return (
			<IconPalette className="pointer-events-none size-4 text-purple-500" />
		);
	}
	if (t === "json") {
		return (
			<IconBraces className="pointer-events-none size-4 text-yellow-500" />
		);
	}
	if (t === "md") {
		return (
			<IconFileText className="pointer-events-none size-4 text-muted-foreground" />
		);
	}
	if (t === "html") {
		return <IconHtml className="pointer-events-none size-4 text-orange-500" />;
	}
	return (
		<IconFile className="pointer-events-none size-4 text-muted-foreground" />
	);
};

export const SandboxFileTree = ({
	items,
	rootId,
	activeFile,
	onSelectFile,
}: Props) => {
	const expandedItems = useMemo(() => listSandboxDirIds(items), [items]);

	const tree = useTree<SandboxTreeItemData>({
		initialState: {
			expandedItems,
			selectedItems:
				activeFile && items[activeFile]?.filePath ? [activeFile] : [],
		},
		indent,
		rootItemId: rootId,
		getItemName: (item) => item.getItemData().name,
		isItemFolder: (item) => (item.getItemData()?.children?.length ?? 0) > 0,
		dataLoader: {
			getItem: (itemId) => items[itemId],
			getChildren: (itemId) => items[itemId]?.children ?? [],
		},
		onPrimaryAction: (item) => {
			const path = item.getItemData().filePath;
			if (path) {
				onSelectFile(path);
			}
		},
		features: [syncDataLoaderFeature, selectionFeature, hotkeysCoreFeature],
	});

	useEffect(() => {
		if (activeFile && items[activeFile]?.filePath) {
			tree.setSelectedItems([activeFile]);
		} else {
			tree.setSelectedItems([]);
		}
	}, [activeFile, items, tree]);

	return (
		<Tree className="w-full" indent={indent} tree={tree}>
			{tree.getItems().map((item) => (
				<TreeItem item={item} key={item.getId()}>
					<TreeItemLabel className="relative w-full min-w-0 max-w-full before:absolute before:inset-x-0 before:-inset-y-0.5 before:-z-10 before:bg-background">
						<span className="flex min-w-0 items-center gap-2">
							{getTreeFileIcon(item.getItemData(), item.isExpanded())}
							<span className="truncate">{item.getItemName()}</span>
						</span>
					</TreeItemLabel>
				</TreeItem>
			))}
		</Tree>
	);
};

const patternDemoItems: Record<string, SandboxTreeItemData> = {
	root: {
		name: "my-project",
		children: ["src", "public", "package-json", "readme", "tsconfig"],
		type: "folder",
	},
	src: {
		name: "src",
		children: ["app", "components", "lib", "globals-css"],
		type: "folder",
	},
	app: {
		name: "app",
		children: ["page-tsx", "layout-tsx", "loading-tsx"],
		type: "folder",
	},
	"page-tsx": { name: "page.tsx", type: "tsx" },
	"layout-tsx": { name: "layout.tsx", type: "tsx" },
	"loading-tsx": { name: "loading.tsx", type: "tsx" },
	components: {
		name: "components",
		children: ["button-tsx", "card-tsx", "dialog-tsx"],
		type: "folder",
	},
	"button-tsx": { name: "button.tsx", type: "tsx" },
	"card-tsx": { name: "card.tsx", type: "tsx" },
	"dialog-tsx": { name: "dialog.tsx", type: "tsx" },
	lib: { name: "lib", children: ["utils-ts", "api-ts"], type: "folder" },
	"utils-ts": { name: "utils.ts", type: "ts" },
	"api-ts": { name: "api.ts", type: "ts" },
	"globals-css": { name: "globals.css", type: "css" },
	public: { name: "public", children: ["favicon"], type: "folder" },
	favicon: { name: "favicon.ico", type: "config" },
	"package-json": { name: "package.json", type: "json" },
	readme: { name: "README.md", type: "md" },
	tsconfig: { name: "tsconfig.json", type: "json" },
};

const patternIndent = 20;

export const Pattern = () => {
	const tree = useTree<SandboxTreeItemData>({
		initialState: {
			expandedItems: ["src", "app", "components"],
		},
		indent: patternIndent,
		rootItemId: "root",
		getItemName: (item) => item.getItemData().name,
		isItemFolder: (item) => (item.getItemData()?.children?.length ?? 0) > 0,
		dataLoader: {
			getItem: (itemId) => patternDemoItems[itemId],
			getChildren: (itemId) => patternDemoItems[itemId].children ?? [],
		},
		features: [syncDataLoaderFeature, hotkeysCoreFeature],
	});

	return (
		<div className="mx-auto w-full grow place-self-start lg:w-xs">
			<Tree indent={patternIndent} tree={tree}>
				{tree.getItems().map((item) => (
					<TreeItem item={item} key={item.getId()}>
						<TreeItemLabel className="relative before:absolute before:inset-x-0 before:-inset-y-0.5 before:-z-10 before:bg-background">
							<span className="flex items-center gap-2">
								{getTreeFileIcon(item.getItemData(), item.isExpanded())}
								{item.getItemName()}
							</span>
						</TreeItemLabel>
					</TreeItem>
				))}
			</Tree>
		</div>
	);
};
