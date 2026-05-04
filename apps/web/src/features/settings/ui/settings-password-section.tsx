import { Button } from "@ctl/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@ctl/ui/components/card";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@ctl/ui/components/field";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { client } from "@/shared/api";
import { authClient } from "@/shared/lib";
import { PasswordInput } from "@/shared/ui";

import { useLinkedAccounts } from "../hooks/use-linked-accounts";
import { hasCredentialAccount } from "../lib/account-utils";
import {
	type ChangePasswordValues,
	changePasswordSchema,
	type SetPasswordValues,
	setPasswordSchema,
} from "../lib/validation";

export const SettingsPasswordSection = () => {
	const queryClient = useQueryClient();
	const { data: accounts = [] } = useLinkedAccounts();
	const hasPassword = hasCredentialAccount(accounts);

	const changeForm = useForm<ChangePasswordValues>({
		resolver: zodResolver(changePasswordSchema),
		defaultValues: {
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		},
	});

	const setForm = useForm<SetPasswordValues>({
		resolver: zodResolver(setPasswordSchema),
		defaultValues: { newPassword: "", confirmPassword: "" },
	});

	const setPasswordMutation = useMutation({
		mutationFn: (newPassword: string) =>
			client.auth.setPassword({ newPassword }),
		onSuccess: async () => {
			setForm.reset();
			await queryClient.invalidateQueries({ queryKey: ["linkedAccounts"] });
			toast.success("Password saved. You can sign in with email and password.");
		},
		onError: (err: Error) => {
			toast.error(err.message || "Could not set password");
		},
	});

	const onChangePassword = async (values: ChangePasswordValues) => {
		await authClient.changePassword(
			{
				currentPassword: values.currentPassword,
				newPassword: values.newPassword,
				revokeOtherSessions: true,
			},
			{
				onSuccess: () => {
					changeForm.reset();
					toast.success("Password updated");
				},
				onError: (err) => {
					toast.error(err.error.message || "Could not change password");
				},
			}
		);
	};

	const onSetPassword = (values: SetPasswordValues) => {
		setPasswordMutation.mutate(values.newPassword);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Password</CardTitle>
				<CardDescription>
					{hasPassword
						? "Change the password for your email sign-in."
						: "Add a password so you can sign in with email as well as social login."}
				</CardDescription>
			</CardHeader>
			{hasPassword ? (
				<form onSubmit={changeForm.handleSubmit(onChangePassword)}>
					<CardContent>
						<FieldGroup>
							<Field
								data-invalid={
									!!changeForm.formState.errors.currentPassword || undefined
								}
							>
								<FieldLabel htmlFor="current-password">
									Current password
								</FieldLabel>
								<PasswordInput
									aria-invalid={!!changeForm.formState.errors.currentPassword}
									className="w-full"
									id="current-password"
									placeholder="Current password"
									{...changeForm.register("currentPassword")}
								/>
								<FieldError>
									{changeForm.formState.errors.currentPassword?.message}
								</FieldError>
							</Field>
							<Field
								data-invalid={
									!!changeForm.formState.errors.newPassword || undefined
								}
							>
								<FieldLabel htmlFor="new-password">New password</FieldLabel>
								<PasswordInput
									aria-invalid={!!changeForm.formState.errors.newPassword}
									className="w-full"
									id="new-password"
									placeholder="New password"
									{...changeForm.register("newPassword")}
								/>
								<FieldError>
									{changeForm.formState.errors.newPassword?.message}
								</FieldError>
							</Field>
							<Field
								data-invalid={
									!!changeForm.formState.errors.confirmPassword || undefined
								}
							>
								<FieldLabel htmlFor="confirm-new-password">
									Confirm new password
								</FieldLabel>
								<PasswordInput
									aria-invalid={!!changeForm.formState.errors.confirmPassword}
									className="w-full"
									id="confirm-new-password"
									placeholder="Confirm new password"
									{...changeForm.register("confirmPassword")}
								/>
								<FieldError>
									{changeForm.formState.errors.confirmPassword?.message}
								</FieldError>
							</Field>
						</FieldGroup>
					</CardContent>
					<CardFooter className="mt-4 justify-end">
						<Button loading={changeForm.formState.isSubmitting} type="submit">
							Save changes
						</Button>
					</CardFooter>
				</form>
			) : (
				<form onSubmit={setForm.handleSubmit(onSetPassword)}>
					<CardContent>
						<FieldGroup>
							<Field
								data-invalid={
									!!setForm.formState.errors.newPassword || undefined
								}
							>
								<FieldLabel htmlFor="set-new-password">New password</FieldLabel>
								<PasswordInput
									aria-invalid={!!setForm.formState.errors.newPassword}
									className="w-full"
									id="set-new-password"
									placeholder="New password"
									{...setForm.register("newPassword")}
								/>
								<FieldError>
									{setForm.formState.errors.newPassword?.message}
								</FieldError>
							</Field>
							<Field
								data-invalid={
									!!setForm.formState.errors.confirmPassword || undefined
								}
							>
								<FieldLabel htmlFor="set-confirm-password">
									Confirm password
								</FieldLabel>
								<PasswordInput
									aria-invalid={!!setForm.formState.errors.confirmPassword}
									className="w-full"
									id="set-confirm-password"
									placeholder="Confirm password"
									{...setForm.register("confirmPassword")}
								/>
								<FieldError>
									{setForm.formState.errors.confirmPassword?.message}
								</FieldError>
							</Field>
						</FieldGroup>
					</CardContent>
					<CardFooter className="mt-4 justify-end">
						<Button loading={setPasswordMutation.isPending} type="submit">
							Save changes
						</Button>
					</CardFooter>
				</form>
			)}
		</Card>
	);
};
