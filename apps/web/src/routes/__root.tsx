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
import { PROJECT_NAME } from "@/shared/constants";
import { ThemeProvider } from "@/shared/providers";
import { DialogRenderer, Header } from "@/shared/ui";
import appCss from "../index.css?url";

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
			{ title: PROJECT_NAME },

			{
				name: "description",
				content: "CodeLearn is a platform for learning programming with AI",
			},
		],
		links: [
			{ rel: "stylesheet", href: appCss },
			{ rel: "icon", href: "/icons/favicon.ico", type: "image/x-icon" },
		],
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
				<script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
			</head>
			<body>
				<ThemeProvider>
					<div className="flex min-h-svh flex-col">
						{!isAuthRoute && <Header />}
						<main className="flex min-h-0 flex-1 flex-col">
							<Outlet />
						</main>
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
