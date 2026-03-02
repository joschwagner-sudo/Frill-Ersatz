import { z } from "zod";

export const AuthCodeSchema = z.object({
    email: z.string().email("Invalid email address").toLowerCase().trim(),
});

export const VerifyCodeSchema = z.object({
    email: z.string().email("Invalid email address").toLowerCase().trim(),
    code: z.string().length(6, "Code must be 6 digits").regex(/^\d+$/, "Code must contain only digits"),
});

export const FeatureRequestSchema = z.object({
    title: z
        .string()
        .min(5, "Title must be at least 5 characters")
        .max(80, "Title must be at most 80 characters")
        .trim(),
    description: z
        .string()
        .min(10, "Description must be at least 10 characters")
        .max(5000, "Description is too long"),
    type: z.enum(["FEATURE", "BUG"]),
    tags: z.string().optional().default(""),
    userId: z.string().min(1, "User ID is required"),
});

export const ReportSchema = z.object({
    type: z.enum(["BUG", "FEATURE"]),
    title: z.string().min(5).max(200).trim(),
    description: z.string().min(10).max(5000),
    userEmail: z.string().email().toLowerCase().trim(),
    pageUrl: z.string().url().optional().or(z.literal("")).nullable(),
});
