import { z } from "zod";

export const registerVoteSchema = z.object({
  pollId: z.string().min(1),
  candidateId: z.string().min(1),
  sentiment: z.enum(["positive", "negative"]).default("positive"),
  fingerprint: z.string().min(1),
  city: z.string().trim().min(1).nullable().optional(),
  province: z.string().trim().min(1).nullable().optional(),
  country: z.string().trim().min(2).max(2).optional().default("EC"),
  latitude: z.number().finite().nullable().optional(),
  longitude: z.number().finite().nullable().optional()
});
