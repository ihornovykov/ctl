import { Button } from "@ctl/ui/components/button";
import { IconBrandGithub } from "@tabler/icons-react";

type Props = {
	loading?: boolean;
	onGithubSignIn: () => void | Promise<void>;
};

export const GithubOauthButton = ({ loading, onGithubSignIn }: Props) => (
	<Button
		className="h-11 w-full"
		icon={<IconBrandGithub className="size-5" />}
		loading={loading}
		onClick={onGithubSignIn}
		type="button"
		variant="outline"
	>
		Continue with GitHub
	</Button>
);
