import { Button } from "@ctl/ui/components/button";
import { Card, CardContent } from "@ctl/ui/components/card";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldSeparator,
} from "@ctl/ui/components/field";
import { Input } from "@ctl/ui/components/input";
import { cn } from "@ctl/ui/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { authClient, oauthCallbackUrl } from "@/shared/lib";
import { PasswordInput } from "@/shared/ui";
import { AuthBrandPanel } from "./auth-brand-panel";
import { GoogleOauthButton } from "./google-oauth-button";

const signInSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
	password: z.string().min(8, "Password must be at least 8 characters"),
});

type SignInValues = z.infer<typeof signInSchema>;

type Props = {
	className?: string;
};

export const SignInForm = ({ className }: Props) => {
	const navigate = useNavigate();
	const [isGoogleLoading, setIsGoogleLoading] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<SignInValues>({
		resolver: zodResolver(signInSchema),
		defaultValues: { email: "", password: "" },
	});

	const onSubmit = async (values: SignInValues) => {
		await authClient.signIn.email(
			{ email: values.email, password: values.password },
			{
				onSuccess: () => {
					navigate({ to: "/dashboard" });
					toast.success("Welcome back!");
				},
				onError: (error) => {
					toast.error(error.error.message || "Failed to sign in");
				},
			}
		);
	};

	const onGoogleSignIn = async () => {
		setIsGoogleLoading(true);
		await authClient.signIn.social({
			provider: "google",
			callbackURL: oauthCallbackUrl("/dashboard"),
		});
	};

	return (
		<div className={cn("flex flex-col gap-6", className)}>
			<Card className="overflow-hidden p-0">
				<CardContent className="grid p-0 md:grid-cols-2">
					<form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
						<FieldGroup>
							<div className="flex flex-col items-center gap-2 text-center">
								<h1 className="font-bold text-2xl">Welcome back</h1>
								<p className="text-balance text-muted-foreground">
									Sign in to your CodeLearn account
								</p>
							</div>

							<Field data-invalid={!!errors.email || undefined}>
								<FieldLabel htmlFor="email">Email</FieldLabel>
								<Input
									aria-invalid={!!errors.email}
									id="email"
									placeholder="m@example.com"
									type="email"
									{...register("email")}
								/>
								<FieldError>{errors.email?.message}</FieldError>
							</Field>

							<Field data-invalid={!!errors.password || undefined}>
								<div className="flex items-center">
									<FieldLabel htmlFor="password">Password</FieldLabel>
									<span className="ml-auto cursor-pointer text-sm underline-offset-2 hover:underline">
										Forgot your password?
									</span>
								</div>
								<PasswordInput
									aria-invalid={!!errors.password}
									id="password"
									{...register("password")}
								/>
								<FieldError>{errors.password?.message}</FieldError>
							</Field>

							<Field>
								<Button
									className="h-11 w-full"
									loading={isSubmitting}
									type="submit"
								>
									Sign In
								</Button>
							</Field>

							<FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
								Or continue with
							</FieldSeparator>

							<Field>
								<GoogleOauthButton
									loading={isGoogleLoading}
									onGoogleSignIn={onGoogleSignIn}
								/>
							</Field>

							<FieldDescription className="text-center">
								Don&apos;t have an account?{" "}
								<Link
									className="underline underline-offset-4"
									to="/auth/sign-up"
								>
									Sign up
								</Link>
							</FieldDescription>
						</FieldGroup>
					</form>

					<AuthBrandPanel />
				</CardContent>
			</Card>

			<FieldDescription className="px-6 text-center">
				By clicking continue, you agree to our{" "}
				<span className="cursor-pointer underline underline-offset-4 hover:text-primary">
					Terms of Service
				</span>{" "}
				and{" "}
				<span className="cursor-pointer underline underline-offset-4 hover:text-primary">
					Privacy Policy
				</span>
				.
			</FieldDescription>
		</div>
	);
};
