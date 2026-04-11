import { eventIterator } from "@orpc/server";
import { z } from "zod";
import { protectedProcedure } from "../../index";
import {
	createPlaygroundSession,
	destroyPlaygroundSession,
	ensurePlaygroundSessionOwner,
	playgroundLogPublisher,
	runPlaygroundTests,
	writePlaygroundFile,
} from "../../lib/playground-session";
import {
	createSessionInputSchema,
	createSessionOutputSchema,
	playgroundLogEventSchema,
	playgroundSessionIdInputSchema,
	runTestsOutputSchema,
	writeFileInputSchema,
} from "./validation";

export const playgroundRouter = {
	createSession: protectedProcedure
		.input(createSessionInputSchema)
		.output(createSessionOutputSchema)
		.handler(async ({ context, input }) => {
			const userId = context.session.user.id;
			return await createPlaygroundSession({
				userId,
				framework: input.framework,
				initialFiles: input.initialFiles,
			});
		}),

	writeFile: protectedProcedure
		.input(writeFileInputSchema)
		.output(z.void())
		.handler(async ({ context, input }) => {
			await writePlaygroundFile({
				sessionId: input.sessionId,
				userId: context.session.user.id,
				path: input.path,
				content: input.content,
			});
		}),

	runTests: protectedProcedure
		.input(playgroundSessionIdInputSchema)
		.output(runTestsOutputSchema)
		.handler(async ({ context, input }) => {
			return await runPlaygroundTests({
				sessionId: input.sessionId,
				userId: context.session.user.id,
			});
		}),

	destroySession: protectedProcedure
		.input(playgroundSessionIdInputSchema)
		.output(z.void())
		.handler(async ({ context, input }) => {
			await destroyPlaygroundSession({
				sessionId: input.sessionId,
				userId: context.session.user.id,
			});
		}),

	subscribePlaygroundLogs: protectedProcedure
		.input(playgroundSessionIdInputSchema)
		.output(eventIterator(playgroundLogEventSchema))
		.handler(async function* ({ context, input, signal }) {
			const userId = context.session.user.id;
			ensurePlaygroundSessionOwner(input.sessionId, userId);
			const iterator = playgroundLogPublisher.subscribe(input.sessionId, {
				signal,
			});
			for await (const ev of iterator) {
				yield ev;
			}
		}),
};
