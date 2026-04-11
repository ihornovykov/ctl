import { Alert, AlertDescription, AlertTitle } from "@ctl/ui/components/alert";
import { Button } from "@ctl/ui/components/button";
import { cn } from "@ctl/ui/lib/utils";
import { IconAlertCircle, IconUser, IconX } from "@tabler/icons-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

import {
	type FileWithPreview,
	formatBytes,
	useFileUpload,
} from "@/hooks/use-file-upload";
import { client } from "@/shared/api/orpc";

const MAX_BYTES = 4 * 1024 * 1024;

type Props = {
	defaultAvatar?: string | null;
	className?: string;
	onUploaded: () => Promise<void>;
};

export const ProfileImageUpload = ({
	defaultAvatar,
	className,
	onUploaded,
}: Props) => {
	const clearFilesRef = useRef<(() => void) | null>(null);
	const [isUploading, setIsUploading] = useState(false);

	const onFilesAdded = useCallback(
		async (added: FileWithPreview[]) => {
			const raw = added[0]?.file;
			if (!(raw instanceof File)) {
				return;
			}
			setIsUploading(true);
			try {
				const iterator = await client.upload.profileAvatar(raw);
				for await (const ev of iterator) {
					if (ev.stage === "done") {
						break;
					}
				}
				clearFilesRef.current?.();
				await onUploaded();
			} catch (e) {
				const msg = e instanceof Error ? e.message : "Upload failed";
				toast.error(msg);
			} finally {
				setIsUploading(false);
			}
		},
		[onUploaded]
	);

	const [
		{ files, isDragging, errors },
		{
			removeFile,
			handleDragEnter,
			handleDragLeave,
			handleDragOver,
			handleDrop,
			openFileDialog,
			getInputProps,
			clearFiles,
		},
	] = useFileUpload({
		maxFiles: 1,
		maxSize: MAX_BYTES,
		accept: "image/*",
		multiple: false,
		onFilesAdded,
		onError: (errs) => {
			toast.error(errs[0] ?? "Invalid file");
		},
	});

	clearFilesRef.current = clearFiles;

	const currentFile = files[0];
	const previewUrl = currentFile?.preview ?? defaultAvatar ?? undefined;

	const handleRemove = () => {
		if (currentFile) {
			removeFile(currentFile.id);
		}
	};

	return (
		<div
			className={cn(
				"flex flex-col items-start gap-4 sm:flex-row sm:items-start",
				className
			)}
		>
			<div className="relative shrink-0">
				<button
					aria-label={previewUrl ? "Change profile photo" : "Add profile photo"}
					className={cn(
						"group/avatar relative size-20 cursor-pointer overflow-hidden rounded-full border-2 border-dashed transition-[border-color,box-shadow,background-color]",
						isDragging
							? "border-primary bg-primary/10 ring-2 ring-primary/30"
							: "border-muted-foreground/30 hover:border-muted-foreground/50 hover:ring-2 hover:ring-ring/40",
						previewUrl && "border-border border-solid",
						(isUploading || isDragging) && "pointer-events-none",
						isUploading && "opacity-60"
					)}
					disabled={isUploading}
					onClick={openFileDialog}
					onDragEnter={handleDragEnter}
					onDragLeave={handleDragLeave}
					onDragOver={handleDragOver}
					onDrop={handleDrop}
					type="button"
				>
					<input {...getInputProps()} className="sr-only" />

					{previewUrl ? (
						<img alt="" className="size-full object-cover" src={previewUrl} />
					) : (
						<div className="flex size-full items-center justify-center bg-muted/40">
							<IconUser className="text-muted-foreground" />
						</div>
					)}
				</button>

				{currentFile ? (
					<Button
						aria-label="Remove selected photo"
						className="absolute inset-e-0 top-0 z-10 translate-x-1/4 -translate-y-1/4"
						onClick={(e) => {
							e.stopPropagation();
							handleRemove();
						}}
						size="icon-xs"
						type="button"
						variant="outline"
					>
						<IconX data-icon="inline-start" />
					</Button>
				) : null}
			</div>

			<div className="flex w-full min-w-0 flex-col items-start gap-2 sm:max-w-sm sm:flex-1">
				<div className="flex w-full flex-col gap-0.5">
					<p className="font-medium text-sm">Profile photo</p>
					<p className="text-pretty text-muted-foreground text-xs leading-relaxed">
						{isUploading
							? "Uploading…"
							: `Drop an image on the avatar or use the button. PNG, JPG, or WebP up to ${formatBytes(MAX_BYTES)}.`}
					</p>
				</div>
				<Button
					className="shrink-0"
					disabled={isUploading}
					onClick={openFileDialog}
					size="sm"
					type="button"
					variant="outline"
				>
					{previewUrl ? "Change photo" : "Choose photo"}
				</Button>

				{errors.length > 0 ? (
					<Alert className="w-full max-w-full" variant="destructive">
						<IconAlertCircle />
						<AlertTitle>Could not add file</AlertTitle>
						<AlertDescription className="flex flex-col gap-1">
							{errors.map((error) => (
								<p key={error}>{error}</p>
							))}
						</AlertDescription>
					</Alert>
				) : null}
			</div>
		</div>
	);
};
