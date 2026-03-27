import { Toaster } from "@ctl/ui/components/sonner";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	Scripts,
	useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import type { orpc } from "@/shared/api";
import { ThemeProvider } from "@/shared/providers";
import { DialogRenderer, Header } from "@/shared/ui";

import appCss from "../index.css?url";

// Runs before React hydrates to prevent flash of wrong theme.
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('codelearn-theme')||'system';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d)}catch(e){}})()`;

export interface RouterAppContext {
	orpc: typeof orpc;
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title: "CodeLearn — Master Programming with AI" },
		],
		links: [{ rel: "stylesheet", href: appCss }],
	}),

	component: RootDocument,
});

function RootDocument() {
	const { location } = useRouterState();
	const isAuthRoute = location.pathname.startsWith("/auth");

	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<HeadContent />
				{/* biome-ignore lint/security/noDangerouslySetInnerHtml: theme script must run before paint */}
				<script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
			</head>
			<body>
				<ThemeProvider>
					<div className="flex min-h-svh flex-col">
						{!isAuthRoute && <Header />}
						<Outlet />
					</div>
					<DialogRenderer />
					<Toaster richColors />
				</ThemeProvider>
				<TanStackRouterDevtools position="bottom-left" />
				<ReactQueryDevtools buttonPosition="bottom-right" position="bottom" />
				<Scripts />
			</body>
		</html>
	);
}
