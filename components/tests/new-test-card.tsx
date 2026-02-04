"use client";

import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";

export function NewTestCard() {
    const router = useRouter();
    const createSession = useMutation(api.tests.createTestSession);
    const seedPteCore = useMutation(api.pteCore.seedPteCore);
    const blueprintSummary = useQuery(api.tests.getBlueprintSummary, {
        slug: "pte-core-full",
    });
    const [isSeeding, setIsSeeding] = useState(false);

    const handleStart = async () => {
        const result = await createSession({ blueprintSlug: "pte-core-full" });
        router.push(`/tests/${result.sessionId}`);
    };

    const handleSeed = async () => {
        setIsSeeding(true);
        try {
            await seedPteCore({});
        } finally {
            setIsSeeding(false);
        }
    };

    const isLoading = blueprintSummary === undefined;
    const hasBlueprint = Boolean(blueprintSummary?.blueprint);

    const totalItems = blueprintSummary?.blueprint?.totalItems ?? 0;
    const totalTimeMinutes = blueprintSummary?.blueprint?.timeBySectionSec
        ? Math.round(
              (blueprintSummary.blueprint.timeBySectionSec.speaking_writing +
                  blueprintSummary.blueprint.timeBySectionSec.reading +
                  blueprintSummary.blueprint.timeBySectionSec.listening) /
                  60,
          )
        : 0;

    return (
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
                <div className="flex flex-col gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Full Test Mode
                    </p>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        PTE Core Full Mock
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        One continuous test covering Speaking & Writing,
                        Reading, and Listening with automated scoring and a
                        category breakdown at the end.
                    </p>
                    {!isLoading && !hasBlueprint ? (
                        <div className="rounded-xl border border-amber-200/70 bg-amber-50/80 p-3 text-xs text-amber-900">
                            The question bank has not been seeded yet. Run the
                            seed to enable the full test.
                        </div>
                    ) : null}
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-border/60 bg-background p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            Tasks
                        </p>
                        <p className="mt-3 text-2xl font-semibold">
                            {totalItems || "52"}
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                            Across 19 item types
                        </p>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-background p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            Timing
                        </p>
                        <p className="mt-3 text-2xl font-semibold">
                            {totalTimeMinutes
                                ? `${totalTimeMinutes} min`
                                : "~120 min"}
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                            Official-style timing
                        </p>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-background p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            Scoring
                        </p>
                        <p className="mt-3 text-2xl font-semibold">Auto</p>
                        <p className="mt-2 text-xs text-muted-foreground">
                            AI estimate + rubric
                        </p>
                    </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                    <Button onClick={handleStart} disabled={!hasBlueprint}>
                        Start full test
                    </Button>
                    {!hasBlueprint ? (
                        <Button
                            variant="outline"
                            onClick={handleSeed}
                            disabled={isSeeding}
                        >
                            {isSeeding ? "Seeding..." : "Seed question bank"}
                        </Button>
                    ) : null}
                </div>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Section Mix
                </p>
                <div className="mt-4 flex flex-col gap-4">
                    {(
                        [
                            {
                                label: "Speaking & Writing",
                                key: "speaking_writing",
                                time: "46–67 min",
                            },
                            {
                                label: "Reading",
                                key: "reading",
                                time: "27–38 min",
                            },
                            {
                                label: "Listening",
                                key: "listening",
                                time: "30–37 min",
                            },
                        ] as const
                    ).map((section) => {
                        const count =
                            blueprintSummary?.countsBySection?.[section.key] ??
                            "—";
                        return (
                            <div
                                key={section.key}
                                className="rounded-xl border border-border/60 bg-background p-4"
                            >
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold">
                                        {section.label}
                                    </p>
                                    <span className="text-xs text-muted-foreground">
                                        {section.time}
                                    </span>
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {count} tasks
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
