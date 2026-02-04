import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { scoreResponse } from "./scoring";

const QUESTION_TYPE_ORDER = [
    "read_aloud",
    "repeat_sentence",
    "describe_image",
    "respond_situation",
    "answer_short_question",
    "summarize_written_text",
    "write_email",
    "rw_fill_in_blanks",
    "reading_mcq_multiple",
    "reorder_paragraphs",
    "reading_fill_in_blanks",
    "reading_mcq_single",
    "summarize_spoken_text",
    "listening_mcq_multiple",
    "listening_fill_in_blanks",
    "listening_mcq_single",
    "select_missing_word",
    "highlight_incorrect_words",
    "write_from_dictation",
];

const mulberry32 = (seed: number) => {
    return () => {
        let t = (seed += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
};

const sampleWithReplacement = <T>(
    items: T[],
    count: number,
    rand: () => number,
) => {
    if (!items.length) {
        return [];
    }
    const selected: T[] = [];
    for (let i = 0; i < count; i += 1) {
        const index = Math.floor(rand() * items.length);
        selected.push(items[index]);
    }
    return selected;
};

const toScaledScore = (raw: number, max: number) => {
    if (!max) {
        return 10;
    }
    return Math.round(10 + (raw / max) * 80);
};

export const createTestSession = mutation({
    args: {
        blueprintSlug: v.optional(v.string()),
        userId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const blueprintSlug = args.blueprintSlug ?? "pte-core-full";
        const blueprint = await ctx.db
            .query("testBlueprints")
            .withIndex("by_slug", (q) => q.eq("slug", blueprintSlug))
            .unique();

        if (!blueprint) {
            throw new Error(
                "Blueprint not found. Seed the question bank with pteCore:seedPteCore.",
            );
        }

        const typeDocs = await ctx.db.query("questionTypes").collect();
        const typeTimeLimits = new Map(
            typeDocs.map((doc) => [doc.slug, doc.timeLimitSec ?? 60]),
        );

        const seed = Date.now();
        const rand = mulberry32(seed);
        const sessionId = await ctx.db.insert("testSessions", {
            userId: args.userId,
            blueprintSlug,
            status: "in_progress",
            startedAt: Date.now(),
            currentIndex: 0,
            seed,
        });

        let order = 0;
        const itemsToInsert: {
            sessionId: typeof sessionId;
            questionId: any;
            order: number;
            timeLimitSec: number;
        }[] = [];

        for (const typeSlug of QUESTION_TYPE_ORDER) {
            const count = blueprint.countsByType?.[typeSlug] ?? 0;
            if (!count) {
                continue;
            }

            const pool = await ctx.db
                .query("questions")
                .withIndex("by_type", (q) => q.eq("typeSlug", typeSlug))
                .collect();

            const selected = sampleWithReplacement(pool, count, rand);
            const timeLimitSec = typeTimeLimits.get(typeSlug) ?? 60;

            for (const question of selected) {
                itemsToInsert.push({
                    sessionId,
                    questionId: question._id,
                    order,
                    timeLimitSec,
                });
                order += 1;
            }
        }

        for (const item of itemsToInsert) {
            await ctx.db.insert("testItems", item);
        }

        return { sessionId };
    },
});

export const getBlueprintSummary = query({
    args: { slug: v.string() },
    handler: async (ctx, args) => {
        const blueprint = await ctx.db
            .query("testBlueprints")
            .withIndex("by_slug", (q) => q.eq("slug", args.slug))
            .unique();

        if (!blueprint) {
            return null;
        }

        const typeDocs = await ctx.db.query("questionTypes").collect();
        const typeMap = new Map(typeDocs.map((doc) => [doc.slug, doc.section]));
        const countsBySection: Record<string, number> = {
            speaking_writing: 0,
            reading: 0,
            listening: 0,
        };

        for (const [typeSlug, count] of Object.entries(
            blueprint.countsByType ?? {},
        )) {
            const section = typeMap.get(typeSlug);
            if (section) {
                countsBySection[section] =
                    (countsBySection[section] ?? 0) + Number(count ?? 0);
            }
        }

        return { blueprint, countsBySection };
    },
});

export const getTestSessionDetail = query({
    args: { sessionId: v.id("testSessions") },
    handler: async (ctx, args) => {
        const session = await ctx.db.get(args.sessionId);
        if (!session) {
            return null;
        }

        const items = await ctx.db
            .query("testItems")
            .withIndex("by_session_order", (q) =>
                q.eq("sessionId", args.sessionId),
            )
            .order("asc")
            .collect();

        const questions = await Promise.all(
            items.map((item) => ctx.db.get(item.questionId)),
        );
        const responses = await ctx.db
            .query("responses")
            .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
            .collect();

        const responseMap = new Map(
            responses.map((response) => [response.questionId, response]),
        );

        return {
            session,
            total: items.length,
            items: items.map((item, index) => ({
                order: item.order,
                timeLimitSec: item.timeLimitSec,
                question: questions[index],
                response: responseMap.get(item.questionId) ?? null,
            })),
        };
    },
});

export const submitResponse = mutation({
    args: {
        sessionId: v.id("testSessions"),
        questionId: v.id("questions"),
        answer: v.any(),
        transcript: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const session = await ctx.db.get(args.sessionId);
        if (!session) {
            throw new Error("Session not found");
        }

        const question = await ctx.db.get(args.questionId);
        if (!question) {
            throw new Error("Question not found");
        }

        const scored = scoreResponse(question, args.answer, args.transcript);
        const existing = await ctx.db
            .query("responses")
            .withIndex("by_session_question", (q) =>
                q
                    .eq("sessionId", args.sessionId)
                    .eq("questionId", args.questionId),
            )
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, {
                answer: args.answer,
                transcript: args.transcript,
                rawScore: scored.rawScore,
                maxScore: scored.maxScore,
                traitScores: scored.traitScores,
            });
        } else {
            await ctx.db.insert("responses", {
                sessionId: args.sessionId,
                questionId: args.questionId,
                answer: args.answer,
                transcript: args.transcript,
                rawScore: scored.rawScore,
                maxScore: scored.maxScore,
                traitScores: scored.traitScores,
                createdAt: Date.now(),
            });

            await ctx.db.patch(args.sessionId, {
                currentIndex: session.currentIndex + 1,
            });
        }

        return scored;
    },
});

export const finishTestSession = mutation({
    args: { sessionId: v.id("testSessions") },
    handler: async (ctx, args) => {
        const session = await ctx.db.get(args.sessionId);
        if (!session) {
            throw new Error("Session not found");
        }

        const responses = await ctx.db
            .query("responses")
            .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
            .collect();

        const questionIds = responses.map((response) => response.questionId);
        const questions = await Promise.all(
            questionIds.map((id) => ctx.db.get(id)),
        );
        const questionMap = new Map(
            questions
                .filter(Boolean)
                .map((question) => [question!._id, question!]),
        );

        let totalRaw = 0;
        let totalMax = 0;
        const sectionTotals: Record<string, { raw: number; max: number }> = {};
        const categoryTotals: Record<string, { raw: number; max: number }> = {};

        for (const response of responses) {
            const question = questionMap.get(response.questionId);
            if (!question) {
                continue;
            }

            totalRaw += response.rawScore;
            totalMax += response.maxScore;

            const section = question.section;
            if (!sectionTotals[section]) {
                sectionTotals[section] = { raw: 0, max: 0 };
            }
            sectionTotals[section].raw += response.rawScore;
            sectionTotals[section].max += response.maxScore;

            for (const category of question.categories) {
                if (!categoryTotals[category.slug]) {
                    categoryTotals[category.slug] = { raw: 0, max: 0 };
                }
                categoryTotals[category.slug].raw +=
                    response.rawScore * category.weight;
                categoryTotals[category.slug].max +=
                    response.maxScore * category.weight;
            }
        }

        const scoreSummary = {
            overall: {
                score: toScaledScore(totalRaw, totalMax),
                raw: totalRaw,
                max: totalMax,
            },
            sections: Object.fromEntries(
                Object.entries(sectionTotals).map(([section, values]) => [
                    section,
                    {
                        score: toScaledScore(values.raw, values.max),
                        raw: values.raw,
                        max: values.max,
                    },
                ]),
            ),
            categories: Object.entries(categoryTotals).map(
                ([slug, values]) => ({
                    slug,
                    score: toScaledScore(values.raw, values.max),
                    raw: values.raw,
                    max: values.max,
                }),
            ),
        };

        await ctx.db.patch(args.sessionId, {
            status: "completed",
            completedAt: Date.now(),
            scoreSummary,
        });

        return scoreSummary;
    },
});
