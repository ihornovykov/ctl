import { OAUTH_PROVIDER_IDS } from "./constants";

export type LinkedAccountRow = {
	id: string;
	providerId: string;
	accountId: string;
};

export const providerLabel = (providerId: string) => {
	if (providerId === "google") {
		return "Google";
	}
	if (providerId === "github") {
		return "GitHub";
	}
	if (providerId === "credential") {
		return "Email and password";
	}
	return providerId;
};

export const hasCredentialAccount = (accounts: LinkedAccountRow[]) =>
	accounts.some((a) => !OAUTH_PROVIDER_IDS.has(a.providerId));

export const hasOAuthProvider = (
	accounts: LinkedAccountRow[],
	providerId: string
) => accounts.some((a) => a.providerId === providerId);
