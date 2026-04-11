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
import { Input } from "@ctl/ui/components/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { authClient } from "@/shared/lib";

import {
	type UpdateDisplayNameValues,
	updateDisplayNameSchema,
} from "../lib/validation";
import { ProfileImageUpload } from "./profile-image-upload";

export const SettingsProfileSection = () => {
	const { data: session, refetch } = authClient.useSession();
	const user = session?.user;

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<UpdateDisplayNameValues>({
		resolver: zodResolver(updateDisplayNameSchema),
		values: user ? { name: user.name } : { name: "" },
	});

	const onSaveName = async (values: UpdateDisplayNameValues) => {
		await authClient.updateUser(
			{ name: values.name },
			{
				onSuccess: async () => {
					await refetch();
					toast.success("Profile updated");
				},
				onError: (err) => {
					toast.error(err.error.message || "Could not update name");
				},
			}
		);
	};

	const onAvatarUploaded = async () => {
		await refetch();
		toast.success("Profile photo updated");
	};

	if (!user) {
		return null;
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>General</CardTitle>
				<CardDescription className="max-w-md">
					Your display name and profile photo shown across the app.
				</CardDescription>
			</CardHeader>
			<form onSubmit={handleSubmit(onSaveName)}>
				<CardContent>
					<div className="flex w-full max-w-md flex-col gap-6">
						<ProfileImageUpload
							defaultAvatar={user.image}
							onUploaded={onAvatarUploaded}
						/>
						<FieldGroup>
							<Field data-invalid={!!errors.name || undefined}>
								<FieldLabel htmlFor="settings-name">Display name</FieldLabel>
								<Input
									aria-invalid={!!errors.name}
									id="settings-name"
									{...register("name")}
								/>
								<FieldError>{errors.name?.message}</FieldError>
							</Field>
						</FieldGroup>
					</div>
				</CardContent>
				<CardFooter className="mt-4 flex justify-end border-border border-t">
					<div className="flex w-full max-w-md justify-end">
						<Button loading={isSubmitting} type="submit">
							Save changes
						</Button>
					</div>
				</CardFooter>
			</form>
		</Card>
	);
};
