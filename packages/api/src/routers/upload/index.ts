import { db, eq, user } from "@ctl/db";
import { env } from "@ctl/env/server";
import { eventIterator, ORPCError } from "@orpc/server";
import { UTApi, UTFile } from "uploadthing/server";
import { protectedProcedure } from "../../index";
import {
	profileAvatarEventSchema,
	profileAvatarInputSchema,
} from "./validation";

const safeNameExtRe = /^[a-z0-9]+$/i;

const extFromMime: Record<string, string> = {
	"image/jpeg": "jpg",
	"image/jpg": "jpg",
	"image/png": "png",
	"image/webp": "webp",
};

const avatarExtension = (mime: string, fileName: string) => {
	const fromMime = extFromMime[mime.toLowerCase()];
	if (fromMime) {
		return fromMime;
	}
	const ext = fileName.split(".").pop()?.toLowerCase();
	if (ext && safeNameExtRe.test(ext) && ext.length <= 5) {
		return ext;
	}
	return "jpg";
};

const avatarStorageExts = ["jpg", "png", "webp"] as const;

export const uploadRouter = {
	profileAvatar: protectedProcedure
		.input(profileAvatarInputSchema)
		.output(eventIterator(profileAvatarEventSchema))
		.handler(async function* ({ context, input: file, signal }) {
			yield { stage: "validating" as const };

			const userId = context.session.user.id;
			const buffer = Buffer.from(await file.arrayBuffer());

			const ext = avatarExtension(file.type, file.name);
			const objectName = `${userId}.${ext}`;
			const customId = objectName;

			yield { progress: 10, stage: "uploading" as const };

			const utapi = new UTApi({ token: env.UPLOADTHING_TOKEN });
			await utapi.deleteFiles(
				avatarStorageExts.map((e) => `${userId}.${e}`),
				{ keyType: "customId" }
			);

			yield { progress: 20, stage: "uploading" as const };

			const utFile = new UTFile([buffer], objectName, {
				customId,
				lastModified: file.lastModified,
			});

			const results = await utapi.uploadFiles(utFile, { signal });

			const row = Array.isArray(results) ? results[0] : results;
			if (!row || row.error) {
				const msg =
					row && "error" in row && row.error
						? String(
								(row.error as { message?: string }).message ?? "Upload failed"
							)
						: "Upload failed";
				throw new ORPCError("BAD_REQUEST", { message: msg });
			}

			const ufsUrl = row.data?.ufsUrl;
			if (typeof ufsUrl !== "string") {
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "UploadThing returned no file URL.",
				});
			}

			yield { progress: 85, stage: "uploading" as const };

			const updated = await db
				.update(user)
				.set({ image: ufsUrl, updatedAt: new Date() })
				.where(eq(user.id, userId))
				.returning({ id: user.id });

			if (updated.length === 0) {
				throw new ORPCError("NOT_FOUND", { message: "User not found." });
			}

			yield { stage: "done" as const, ufsUrl };
		}),
};
