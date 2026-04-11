import { z } from "zod";

export const landingCtaEmailSchema = z.string().email().optional();

export type LandingCtaEmailInput = z.infer<typeof landingCtaEmailSchema>;
