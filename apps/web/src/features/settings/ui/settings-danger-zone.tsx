import { Button } from "@ctl/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@ctl/ui/components/card";
import { Input } from "@ctl/ui/components/input";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { authClient } from "@/shared/lib";
import { dialogs } from "@/shared/stores";
import { PasswordInput } from "@/shared/ui";

import { useLinkedAccounts } from "../hooks/use-linked-accounts";
import { hasCredentialAccount } from "../lib/account-utils";
import { ACCOUNT_DELETE_CONFIRM_PHRASE } from "../lib/constants";

const DeleteAccountDialogBody = ({
	close,
	hasPassword,
}: {
	close: () => void;
	hasPassword: boolean;
}) => {
	const navigate = useNavigate();
	const [phrase, setPhrase] = useState("");
	const [password, setPassword] = useState("");
	const [isDeleting, setIsDeleting] = useState(false);

	const phraseMatches = phrase === ACCOUNT_DELETE_CONFIRM_PHRASE;
	const canSubmit =
		phraseMatches && (!hasPassword || password.length > 0) && !isDeleting;

	const onDelete = async () => {
		if (!canSubmit) {
			return;
		}
		setIsDeleting(true);
		await authClient.deleteUser(
			{
				...(hasPassword ? { password } : {}),
				callbackURL: "/",
			},
			{
				onSuccess: () => {
					close();
					navigate({ to: "/" });
					toast.success("Your account was deleted");
				},
				onError: (err) => {
					setIsDeleting(false);
					const msg = err.error.message || "Could not delete account";
					toast.error(msg);
				},
			}
		);
	};

	return (
		<div className="flex flex-col gap-4 py-1">
			<p className="text-muted-foreground text-sm">
				This permanently removes your profile and sign-in access. Type{" "}
				<span className="font-mono font-semibold text-foreground">
					{ACCOUNT_DELETE_CONFIRM_PHRASE}
				</span>{" "}
				to confirm.
			</p>
			{hasPassword ? null : (
				<p className="text-muted-foreground text-sm">
					If you use Google or GitHub only, you may need a recent sign-in. If
					deletion fails, sign out and sign in again, then retry.
				</p>
			)}
			<Input
				autoComplete="off"
				onChange={(e) => setPhrase(e.target.value)}
				placeholder={ACCOUNT_DELETE_CONFIRM_PHRASE}
				value={phrase}
			/>
			{hasPassword ? (
				<div className="flex flex-col gap-1.5">
					<span className="font-medium text-sm">Current password</span>
					<PasswordInput
						autoComplete="current-password"
						onChange={(e) => setPassword(e.target.value)}
						value={password}
					/>
				</div>
			) : null}
			<div className="flex justify-end gap-2 pt-2">
				<Button onClick={close} type="button" variant="outline">
					Cancel
				</Button>
				<Button
					disabled={!canSubmit}
					onClick={onDelete}
					type="button"
					variant="destructive"
				>
					Delete my account
				</Button>
			</div>
		</div>
	);
};

export const SettingsDangerZone = () => {
	const { data: accounts = [] } = useLinkedAccounts();
	const hasPassword = hasCredentialAccount(accounts);

	const openDeleteDialog = () => {
		dialogs.open({
			title: "Delete account",
			description:
				"You will lose access immediately and your data will be removed.",
			content: ({ close }) => (
				<DeleteAccountDialogBody close={close} hasPassword={hasPassword} />
			),
		});
	};

	return (
		<Card className="border-destructive/40">
			<CardHeader>
				<CardTitle className="text-destructive">Danger zone</CardTitle>
				<CardDescription>
					Irreversible actions for your account.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<p className="text-muted-foreground text-sm">
					Deleting your account removes your profile and access immediately.
					This cannot be undone.
				</p>
			</CardContent>
			<CardFooter className="justify-end border-border/60 border-t">
				<Button onClick={openDeleteDialog} type="button" variant="destructive">
					Delete account…
				</Button>
			</CardFooter>
		</Card>
	);
};
