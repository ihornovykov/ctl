import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";

import type { Theme } from "@/shared/lib";
import { applyTheme, getStoredTheme, THEME_KEY } from "@/shared/lib";

interface ThemeContextValue {
	setTheme: (theme: Theme) => void;
	theme: Theme;
}

const ThemeContext = createContext<ThemeContextValue>({
	theme: "system",
	setTheme: (_theme: Theme) => _theme,
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
	const [theme, setThemeState] = useState<Theme>("system");

	useEffect(() => {
		const stored = getStoredTheme();
		setThemeState(stored);
		applyTheme(stored);
	}, []);

	useEffect(() => {
		if (theme !== "system") {
			return;
		}
		const mql = window.matchMedia("(prefers-color-scheme: dark)");
		const handler = () => applyTheme("system");
		mql.addEventListener("change", handler);
		return () => mql.removeEventListener("change", handler);
	}, [theme]);

	const setTheme = (next: Theme) => {
		try {
			localStorage.setItem(THEME_KEY, next);
		} catch (e) {
			console.error(e);
		}
		setThemeState(next);
		applyTheme(next);
	};

	return (
		<ThemeContext.Provider value={{ theme, setTheme }}>
			{children}
		</ThemeContext.Provider>
	);
};
