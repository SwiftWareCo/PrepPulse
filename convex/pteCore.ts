import { mutation } from "./_generated/server";
import {
    categories,
    questionTypes,
    testBlueprints,
    questions,
} from "./data/pteCoreSeed";

export const seedPteCore = mutation({
    args: {},
    handler: async (ctx) => {
        const existing = await ctx.db.query("questionTypes").first();
        if (existing) {
            return { status: "skipped", reason: "already_seeded" };
        }

        const timestamp = Date.now();

        for (const category of categories) {
            await ctx.db.insert("categories", {
                ...category,
                createdAt: timestamp,
            });
        }

        for (const type of questionTypes) {
            await ctx.db.insert("questionTypes", {
                ...type,
                createdAt: timestamp,
            });
        }

        for (const blueprint of testBlueprints) {
            await ctx.db.insert("testBlueprints", {
                ...blueprint,
                createdAt: timestamp,
            });
        }

        for (const question of questions) {
            await ctx.db.insert("questions", {
                ...question,
                createdAt: timestamp,
            });
        }

        return { status: "seeded" };
    },
});
