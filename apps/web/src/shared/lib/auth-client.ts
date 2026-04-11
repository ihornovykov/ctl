import { env } from "@ctl/env/web";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	baseURL: env.VITE_SERVER_URL,
});

export const oauthCallbackUrl = (pathname: string) => {
	if (!pathname.startsWith("/")) {
		throw new Error("pathname must start with /");
	}
	return `${window.location.origin}${pathname}`;
};
