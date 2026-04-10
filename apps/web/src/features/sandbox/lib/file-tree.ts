export const SANDBOX_TREE_ROOT_ID = "__sandbox_root__";

export type SandboxTreeLeafType =
	| "folder"
	| "ts"
	| "tsx"
	| "jsx"
	| "js"
	| "css"
	| "json"
	| "md"
	| "html"
	| "config";

export type SandboxTreeItemData = {
	name: string;
	children?: string[];
	type?: SandboxTreeLeafType;
	filePath?: string;
};

const dirKey = (dirPath: string) => `dir:${dirPath}`;

const inferLeafType = (fileName: string): SandboxTreeLeafType => {
	if (fileName.endsWith(".tsx")) {
		return "tsx";
	}
	if (fileName.endsWith(".jsx")) {
		return "jsx";
	}
	if (fileName.endsWith(".ts")) {
		return "ts";
	}
	if (fileName.endsWith(".js")) {
		return "js";
	}
	if (fileName.endsWith(".css") || fileName.endsWith(".scss")) {
		return "css";
	}
	if (fileName.endsWith(".json")) {
		return "json";
	}
	if (fileName.endsWith(".md")) {
		return "md";
	}
	if (fileName.endsWith(".html")) {
		return "html";
	}
	return "config";
};

const sortChildIds = (
	items: Record<string, SandboxTreeItemData>,
	ids: string[]
): string[] =>
	[...ids].sort((a, b) => {
		const aFolder = a.startsWith("dir:");
		const bFolder = b.startsWith("dir:");
		if (aFolder !== bFolder) {
			return aFolder ? -1 : 1;
		}
		const na = items[a]?.name ?? a;
		const nb = items[b]?.name ?? b;
		return na.localeCompare(nb);
	});

const sortTreeRecursive = (
	items: Record<string, SandboxTreeItemData>,
	id: string
) => {
	const node = items[id];
	if (!node?.children) {
		return;
	}
	node.children = sortChildIds(items, node.children);
	for (const c of node.children) {
		if (c.startsWith("dir:")) {
			sortTreeRecursive(items, c);
		}
	}
};

export const buildSandboxTreeItems = (
	files: Record<string, unknown>
): {
	items: Record<string, SandboxTreeItemData>;
	rootId: string;
} => {
	const items: Record<string, SandboxTreeItemData> = {
		[SANDBOX_TREE_ROOT_ID]: {
			name: "workspace",
			children: [],
			type: "folder",
		},
	};

	const ensureDir = (dirPath: string): string => {
		const id = dirKey(dirPath);
		if (items[id]) {
			return id;
		}

		const name = dirPath.includes("/")
			? (dirPath.split("/").pop() ?? dirPath)
			: dirPath;
		items[id] = { name, children: [], type: "folder" };

		const parentPath = dirPath.split("/").slice(0, -1).join("/");
		if (parentPath) {
			const pid = ensureDir(parentPath);
			const parent = items[pid];
			parent.children ??= [];
			parent.children.push(id);
		} else {
			const root = items[SANDBOX_TREE_ROOT_ID];
			root.children ??= [];
			root.children.push(id);
		}
		return id;
	};

	const sortedPaths = Object.keys(files).sort((a, b) => {
		const aIsNested = a.includes("/", 1);
		const bIsNested = b.includes("/", 1);
		if (aIsNested !== bIsNested) {
			return aIsNested ? -1 : 1;
		}
		return a.localeCompare(b);
	});

	for (const path of sortedPaths) {
		const norm = path.startsWith("/") ? path.slice(1) : path;
		const parts = norm.split("/").filter(Boolean);
		const fileName = parts.at(-1) ?? path;
		const dirPath = parts.slice(0, -1).join("/");

		items[path] = {
			name: fileName,
			type: inferLeafType(fileName),
			filePath: path,
		};

		if (dirPath) {
			const pid = ensureDir(dirPath);
			const parent = items[pid];
			parent.children ??= [];
			parent.children.push(path);
		} else {
			const root = items[SANDBOX_TREE_ROOT_ID];
			root.children ??= [];
			root.children.push(path);
		}
	}

	sortTreeRecursive(items, SANDBOX_TREE_ROOT_ID);

	return { items, rootId: SANDBOX_TREE_ROOT_ID };
};

export const listSandboxDirIds = (
	items: Record<string, SandboxTreeItemData>
): string[] => Object.keys(items).filter((k) => k.startsWith("dir:"));

export const getSandboxShikiGrammarId = (path: string): string => {
	const lower = path.toLowerCase();
	if (lower.endsWith(".vue")) {
		return "vue";
	}
	if (lower.endsWith(".tsx")) {
		return "tsx";
	}
	if (lower.endsWith(".jsx")) {
		return "jsx";
	}
	if (
		lower.endsWith(".ts") ||
		lower.endsWith(".mts") ||
		lower.endsWith(".cts")
	) {
		return "typescript";
	}
	if (
		lower.endsWith(".js") ||
		lower.endsWith(".mjs") ||
		lower.endsWith(".cjs")
	) {
		return "javascript";
	}
	if (lower.endsWith(".scss") || lower.endsWith(".sass")) {
		return "scss";
	}
	if (lower.endsWith(".css")) {
		return "css";
	}
	if (lower.endsWith(".jsonc")) {
		return "jsonc";
	}
	if (lower.endsWith(".json")) {
		return "json";
	}
	if (lower.endsWith(".html")) {
		return "html";
	}
	if (lower.endsWith(".mdx")) {
		return "mdx";
	}
	if (lower.endsWith(".md")) {
		return "markdown";
	}
	return "typescript";
};

export const getMonacoLanguage = (path: string): string => {
	if (path.endsWith(".tsx") || path.endsWith(".ts")) {
		return "typescript";
	}
	if (path.endsWith(".jsx") || path.endsWith(".js")) {
		return "javascript";
	}
	if (path.endsWith(".css") || path.endsWith(".scss")) {
		return "css";
	}
	if (path.endsWith(".json")) {
		return "json";
	}
	if (path.endsWith(".html")) {
		return "html";
	}
	if (path.endsWith(".md")) {
		return "markdown";
	}
	return "typescript";
};
