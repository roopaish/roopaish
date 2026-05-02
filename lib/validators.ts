import * as z from "zod";

export const contactSchema = z.object({
  email: z.string().email(),
  body: z
    .string()
    .min(20, "Message must be at least 20 characters long")
    .max(1000, "Message must be at most 1000 characters long"),
});
