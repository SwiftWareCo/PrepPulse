import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    categories: defineTable({
        slug: v.string(),
        label: v.string(),
        description: v.optional(v.string()),
        createdAt: v.number(),
    }).index("by_slug", ["slug"]),
    questionTypes: defineTable({
        slug: v.string(),
        name: v.string(),
        section: v.string(),
        description: v.optional(v.string()),
        scoring: v.object({
            method: v.string(),
            partialCredit: v.boolean(),
        }),
        timeLimitSec: v.optional(v.number()),
        traits: v.array(v.string()),
        createdAt: v.number(),
    })
        .index("by_slug", ["slug"])
        .index("by_section", ["section"]),
    questions: defineTable({
        typeSlug: v.string(),
        section: v.string(),
        inputMode: v.string(),
        prompt: v.string(),
        stem: v.optional(v.string()),
        stimulus: v.optional(
            v.object({
                text: v.optional(v.string()),
                imageUrl: v.optional(v.string()),
                audioUrl: v.optional(v.string()),
                transcript: v.optional(v.string()),
            })
        ),
        options: v.optional(
            v.array(
                v.object({
                    id: v.string(),
                    text: v.string(),
                })
            )
        ),
        blanks: v.optional(
            v.array(
                v.object({
                    id: v.string(),
                    answer: v.string(),
                    choices: v.optional(v.array(v.string())),
                })
            )
        ),
        correctAnswer: v.optional(v.any()),
        rubric: v.optional(
            v.object({
                keywords: v.optional(v.array(v.string())),
                keypoints: v.optional(v.array(v.string())),
                minWords: v.optional(v.number()),
                maxWords: v.optional(v.number()),
                maxChars: v.optional(v.number()),
                sampleAnswer: v.optional(v.string()),
            })
        ),
        categories: v.array(
            v.object({
                slug: v.string(),
                weight: v.number(),
            })
        ),
        difficulty: v.string(),
        tags: v.array(v.string()),
        createdAt: v.number(),
    })
        .index("by_type", ["typeSlug"])
        .index("by_section", ["section"]),
    testBlueprints: defineTable({
        slug: v.string(),
        name: v.string(),
        countsByType: v.any(),
        timeBySectionSec: v.any(),
        totalItems: v.number(),
        createdAt: v.number(),
    }).index("by_slug", ["slug"]),
    testSessions: defineTable({
        userId: v.optional(v.string()),
        blueprintSlug: v.string(),
        status: v.string(),
        startedAt: v.number(),
        completedAt: v.optional(v.number()),
        currentIndex: v.number(),
        scoreSummary: v.optional(v.any()),
        seed: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_status", ["status"]),
    testItems: defineTable({
        sessionId: v.id("testSessions"),
        questionId: v.id("questions"),
        order: v.number(),
        timeLimitSec: v.number(),
    })
        .index("by_session", ["sessionId"])
        .index("by_session_order", ["sessionId", "order"]),
    responses: defineTable({
        sessionId: v.id("testSessions"),
        questionId: v.id("questions"),
        answer: v.any(),
        transcript: v.optional(v.string()),
        audioStorageId: v.optional(v.id("_storage")),
        rawScore: v.number(),
        maxScore: v.number(),
        traitScores: v.optional(v.any()),
        createdAt: v.number(),
    })
        .index("by_session", ["sessionId"])
        .index("by_question", ["questionId"])
        .index("by_session_question", ["sessionId", "questionId"]),
});
