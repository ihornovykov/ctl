export type Theme = "light" | "dark" | "system";

export const THEME_KEY = "codelearn-theme";

export const getStoredTheme = (): Theme => {
	try {
		return (localStorage.getItem(THEME_KEY) as Theme) ?? "system";
	} catch {
		return "system";
	}
};

export const applyTheme = (theme: Theme) => {
	const isDark =
		theme === "dark" ||
		(theme === "system" &&
			window.matchMedia("(prefers-color-scheme: dark)").matches);
	document.documentElement.classList.toggle("dark", isDark);
};
