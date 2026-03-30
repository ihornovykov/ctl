import { Button } from "@ctl/ui/components/button";
import { Award } from "lucide-react";
import { useState } from "react";

import { client } from "@/shared/api";

import { buildCertificateHtml } from "../lib/utils";

type Props = {
	courseSlug: string;
	variant?: "default" | "outline" | "ghost";
	size?: "default" | "sm" | "lg";
	className?: string;
};

export const CertificateDownloadButton = ({
	courseSlug,
	variant = "default",
	size = "default",
	className,
}: Props) => {
	const [isLoading, setIsLoading] = useState(false);

	const onOpen = async () => {
		if (isLoading) {
			return;
		}
		setIsLoading(true);
		try {
			const cert = await client.courses.getCertificate({ slug: courseSlug });
			const html = buildCertificateHtml(cert);
			const blob = new Blob([html], { type: "text/html;charset=utf-8" });
			const url = URL.createObjectURL(blob);
			const tab = window.open(url, "_blank");
			if (tab) {
				tab.addEventListener("load", () => URL.revokeObjectURL(url), {
					once: true,
				});
			} else {
				setTimeout(() => URL.revokeObjectURL(url), 10_000);
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Button
			className={className}
			disabled={isLoading}
			icon={<Award className="size-4" />}
			loading={isLoading}
			onClick={onOpen}
			size={size}
			variant={variant}
		>
			View Certificate
		</Button>
	);
};
