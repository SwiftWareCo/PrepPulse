"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { CATEGORY_LABELS, SECTION_LABELS } from "@/lib/pte-core";

const formatScore = (value: number) => Math.round(value);

type ScoreSummary = {
    overall: { score: number; raw: number; max: number };
    sections: Record<string, { score: number; raw: number; max: number }>;
    categories: Array<{
        slug: string;
        score: number;
        raw: number;
        max: number;
    }>;
};

type TestResultsProps = {
    summary: ScoreSummary;
};

export function TestResults({ summary }: TestResultsProps) {
    const sections = Object.entries(summary.sections ?? {});
    const weakestCategories = [...(summary.categories ?? [])]
        .sort((a, b) => a.score - b.score)
        .slice(0, 4);

    return (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="rounded-2xl border border-border/60 bg-card p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Overall Score
                </p>
                <div className="mt-4 flex items-baseline gap-3">
                    <span className="text-5xl font-semibold">
                        {formatScore(summary.overall.score)}
                    </span>
                    <span className="text-sm text-muted-foreground">/ 90</span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                    This is an estimated score based on automated rubric
                    scoring.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                    <Button asChild>
                        <Link href="/tests/new">Start another test</Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/">Back to dashboard</Link>
                    </Button>
                </div>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Section Scores
                </p>
                <div className="mt-4 flex flex-col gap-3">
                    {sections.map(([key, score]) => (
                        <div
                            key={key}
                            className="rounded-xl border border-border/60 bg-background p-4"
                        >
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold">
                                    {SECTION_LABELS[key] ?? key}
                                </p>
                                <span className="text-sm font-semibold">
                                    {formatScore(score.score)}
                                </span>
                            </div>
                            <div className="mt-2 h-2 w-full rounded-full bg-muted">
                                <div
                                    className="h-2 rounded-full bg-primary"
                                    style={{
                                        width: `${(score.score / 90) * 100}%`,
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card p-6 lg:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Weakest Categories
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {weakestCategories.map((category) => (
                        <div
                            key={category.slug}
                            className="rounded-xl border border-border/60 bg-background p-4"
                        >
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold">
                                    {CATEGORY_LABELS[category.slug] ??
                                        category.slug}
                                </p>
                                <span className="text-sm font-semibold">
                                    {formatScore(category.score)}
                                </span>
                            </div>
                            <div className="mt-2 h-2 w-full rounded-full bg-muted">
                                <div
                                    className="h-2 rounded-full bg-primary"
                                    style={{
                                        width: `${(category.score / 90) * 100}%`,
                                    }}
                                />
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">
                                Focus practice items in this category for faster
                                gains.
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
