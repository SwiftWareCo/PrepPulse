"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { QuestionView } from "@/components/tests/question-view";
import { TestResults } from "@/components/tests/test-results";

const getDefaultAnswer = (question: Doc<"questions">) => {
    switch (question.inputMode) {
        case "mcq_multi":
        case "highlight_words":
            return [];
        case "reorder_paragraphs":
            return (question.options ?? []).map((option) => option.id);
        case "fill_blanks_dropdown":
        case "fill_blanks_text":
            return (question.blanks ?? []).map(() => "");
        default:
            return "";
    }
};

type TestSessionClientProps = {
    sessionId: string;
};

export function TestSessionClient({ sessionId }: TestSessionClientProps) {
    const sessionIdTyped = sessionId as Id<"testSessions">;
    const detail = useQuery(api.tests.getTestSessionDetail, {
        sessionId: sessionIdTyped,
    });
    const submitResponse = useMutation(api.tests.submitResponse);
    const finishSession = useMutation(api.tests.finishTestSession);
    const [answer, setAnswer] = useState<any>("");
    const [isSaving, setIsSaving] = useState(false);

    const items = detail?.items ?? [];
    const firstIncompleteIndex = items.findIndex((item) => !item.response);
    const activeIndex =
        firstIncompleteIndex === -1
            ? Math.max(items.length - 1, 0)
            : firstIncompleteIndex;
    const activeItem = items[activeIndex];
    const activeQuestion = activeItem?.question as Doc<"questions"> | undefined;

    useEffect(() => {
        if (!activeQuestion) {
            return;
        }
        if (activeItem?.response?.answer !== undefined) {
            setAnswer(activeItem.response.answer);
            return;
        }
        setAnswer(getDefaultAnswer(activeQuestion));
    }, [activeQuestion?._id, activeItem?.response?._id]);

    const progress = items.length
        ? Math.round(((activeIndex + 1) / items.length) * 100)
        : 0;

    const isLast = activeIndex === items.length - 1;

    const handleSubmit = async () => {
        if (!activeQuestion || !activeItem) {
            return;
        }
        setIsSaving(true);
        try {
            await submitResponse({
                sessionId: sessionIdTyped,
                questionId: activeQuestion._id,
                answer,
            });
            if (isLast) {
                await finishSession({ sessionId: sessionIdTyped });
            }
        } finally {
            setIsSaving(false);
        }
    };

    if (detail === undefined) {
        return (
            <div className="rounded-2xl border border-border/60 bg-card p-6">
                <p className="text-sm text-muted-foreground">Loading test...</p>
            </div>
        );
    }

    if (detail === null) {
        return (
            <div className="rounded-2xl border border-border/60 bg-card p-6">
                <p className="text-sm text-muted-foreground">
                    This test session could not be found.
                </p>
            </div>
        );
    }

    if (detail.session?.status === "completed" && detail.session.scoreSummary) {
        return <TestResults summary={detail.session.scoreSummary} />;
    }

    if (!activeQuestion) {
        return (
            <div className="rounded-2xl border border-border/60 bg-card p-6">
                <p className="text-sm text-muted-foreground">
                    No questions available for this test yet.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-border/60 bg-card p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-sm font-semibold">
                            Question {activeIndex + 1} of {items.length}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Time limit: {activeItem.timeLimitSec}s
                        </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {progress}% complete
                    </p>
                </div>
                <div className="mt-3 h-2 w-full rounded-full bg-muted">
                    <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <QuestionView
                question={activeQuestion}
                value={answer}
                onChange={setAnswer}
            />

            <div className="flex flex-wrap items-center justify-end gap-3">
                <Button variant="outline" disabled>
                    Skip
                </Button>
                <Button onClick={handleSubmit} disabled={isSaving}>
                    {isLast ? "Finish test" : "Save & Next"}
                </Button>
            </div>
        </div>
    );
}
