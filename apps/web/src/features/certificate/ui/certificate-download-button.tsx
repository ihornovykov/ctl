import { Button } from "@ctl/ui/components/button";
import { Award, Loader2 } from "lucide-react";
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
			onClick={onOpen}
			size={size}
			variant={variant}
		>
			{isLoading ? (
				<Loader2 className="size-4 animate-spin" />
			) : (
				<Award className="size-4" />
			)}
			{isLoading ? "Loading…" : "View Certificate"}
		</Button>
	);
};
