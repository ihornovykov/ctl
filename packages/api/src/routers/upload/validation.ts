import { z } from "zod";

const maxAvatarBytes = 4 * 1024 * 1024;

const imageMimeList = [
	"image/jpeg",
	"image/jpg",
	"image/png",
	"image/webp",
] as const;

export const profileAvatarInputSchema = z
	.file()
	.min(1, { message: "Image is empty." })
	.max(maxAvatarBytes, {
		message: `Image must be at most ${maxAvatarBytes / (1024 * 1024)}MB.`,
	})
	.mime([...imageMimeList], {
		message: "Only image files are allowed.",
	});

export const profileAvatarEventSchema = z.discriminatedUnion("stage", [
	z.object({ stage: z.literal("validating") }),
	z.object({
		progress: z.number().min(0).max(100),
		stage: z.literal("uploading"),
	}),
	z.object({
		stage: z.literal("done"),
		ufsUrl: z.string().min(1),
	}),
]);

export type ProfileAvatarInput = z.infer<typeof profileAvatarInputSchema>;
export type ProfileAvatarEvent = z.infer<typeof profileAvatarEventSchema>;
