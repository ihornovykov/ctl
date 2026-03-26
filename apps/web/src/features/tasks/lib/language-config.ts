type LanguageConfig = {
	monacoLanguage: string;
	label: string;
};

const languageConfigs: Record<string, LanguageConfig> = {
	javascript: { monacoLanguage: "javascript", label: "JavaScript" },
	typescript: { monacoLanguage: "typescript", label: "TypeScript" },
	python: { monacoLanguage: "python", label: "Python" },
	go: { monacoLanguage: "go", label: "Go" },
	c: { monacoLanguage: "c", label: "C" },
	cpp: { monacoLanguage: "cpp", label: "C++" },
};

export const getLanguageConfig = (languageId: string): LanguageConfig =>
	languageConfigs[languageId] ?? {
		monacoLanguage: "plaintext",
		label: languageId,
	};
