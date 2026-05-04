import { Button } from "@ctl/ui/components/button";

import { GoogleIcon } from "./google-icon";

type Props = {
	loading?: boolean;
	onGoogleSignIn: () => void | Promise<void>;
};

export const GoogleOauthButton = ({ loading, onGoogleSignIn }: Props) => (
	<Button
		icon={<GoogleIcon />}
		loading={loading}
		onClick={onGoogleSignIn}
		type="button"
		variant="outline"
	>
		Continue with Google
	</Button>
);
