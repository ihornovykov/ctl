import { env } from "@ctl/env/web";
import { useQuery } from "@tanstack/react-query";

import { authClient } from "@/shared/lib";

import type { LinkedAccountRow } from "../lib/account-utils";

const fetchLinkedAccounts = async (): Promise<LinkedAccountRow[]> => {
	const res = await fetch(
		new URL("/api/auth/list-accounts", env.VITE_SERVER_URL),
		{ credentials: "include" }
	);
	if (!res.ok) {
		throw new Error("Failed to load linked accounts");
	}
	return res.json() as Promise<LinkedAccountRow[]>;
};

export const useLinkedAccounts = () => {
	const { data: session } = authClient.useSession();
	return useQuery<LinkedAccountRow[]>({
		queryKey: ["linkedAccounts"],
		queryFn: fetchLinkedAccounts,
		enabled: Boolean(session),
	});
};
