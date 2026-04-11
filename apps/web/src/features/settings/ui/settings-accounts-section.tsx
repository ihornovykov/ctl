import { Button } from "@ctl/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@ctl/ui/components/card";
import { IconBrandGithub } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { GoogleIcon } from "@/features/auth";
import { authClient, oauthCallbackUrl } from "@/shared/lib";
import { useLinkedAccounts } from "../hooks/use-linked-accounts";
import { hasOAuthProvider, providerLabel } from "../lib/account-utils";
import { OAUTH_PROVIDER_IDS } from "../lib/constants";

const GoogleProviderMark = () => (
	<span className="inline-flex size-5 shrink-0 items-center justify-center text-xl leading-none">
		<GoogleIcon />
	</span>
);

const linkableOauthProviders = [
	{
		label: "Google",
		provider: "google" as const,
		renderIcon: () => <GoogleProviderMark />,
	},
	{
		label: "GitHub",
		provider: "github" as const,
		renderIcon: () => <IconBrandGithub className="size-5 shrink-0" />,
	},
] as const;

export const SettingsAccountsSection = () => {
	const queryClient = useQueryClient();
	const { data: accounts = [], isPending, refetch } = useLinkedAccounts();

	const invalidateAccounts = async () => {
		await queryClient.invalidateQueries({ queryKey: ["linkedAccounts"] });
		await refetch();
	};

	const onLinkSocial = async (provider: "google" | "github") => {
		await authClient.linkSocial({
			callbackURL: oauthCallbackUrl("/settings"),
			provider,
		});
	};

	const onUnlink = async (providerId: string, accountId: string) => {
		await authClient.unlinkAccount(
			{ providerId, accountId },
			{
				onSuccess: async () => {
					await invalidateAccounts();
					toast.success("Account disconnected");
				},
				onError: (err) => {
					toast.error(err.error.message || "Could not disconnect account");
				},
			}
		);
	};

	const canUnlink = accounts.length > 1;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Connected accounts</CardTitle>
				<CardDescription>
					Sign-in methods for your account. Keep at least one way to sign in.
				</CardDescription>
			</CardHeader>
			<CardContent className="w-full">
				{isPending ? (
					<p className="text-muted-foreground text-sm">Loading…</p>
				) : (
					<ul className="flex flex-col gap-2">
						{[...accounts]
							.sort((a, b) => a.providerId.localeCompare(b.providerId))
							.map((account) => (
								<li
									className="flex min-h-11 items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5"
									key={account.id}
								>
									<div className="flex items-center gap-2.5">
										{linkableOauthProviders
											.find((p) => p.provider === account.providerId)
											?.renderIcon()}
										<span className="font-medium text-sm">
											{providerLabel(account.providerId)}
										</span>
									</div>
									{canUnlink && OAUTH_PROVIDER_IDS.has(account.providerId) ? (
										<Button
											onClick={() =>
												onUnlink(account.providerId, account.accountId)
											}
											size="sm"
											type="button"
											variant="outline"
										>
											Disconnect
										</Button>
									) : null}
								</li>
							))}
						{linkableOauthProviders.map(({ label, provider, renderIcon }) =>
							hasOAuthProvider(accounts, provider) ? null : (
								<li
									className="flex min-h-11 items-center justify-between gap-3 rounded-lg border border-border/60 border-dashed bg-muted/10 px-3 py-2.5"
									key={provider}
								>
									<div className="flex items-center gap-2.5">
										{renderIcon()}
										<div className="flex flex-col gap-0.5">
											<span className="font-medium text-sm">{label}</span>
											<span className="text-muted-foreground text-xs">
												Not connected
											</span>
										</div>
									</div>
									<Button
										onClick={() => onLinkSocial(provider)}
										size="sm"
										type="button"
										variant="outline"
									>
										Connect
									</Button>
								</li>
							)
						)}
					</ul>
				)}
			</CardContent>
		</Card>
	);
};
