import Link from "next/link";

import { Button } from "@/components/ui/button";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function Home() {
    return (
        <DashboardShell
            title="Overview"
            subtitle="Your PTE Core focus dashboard"
            active="overview"
            actions={
                <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm" asChild>
                        <Link href="/tests/new">Start a test</Link>
                    </Button>
                </div>
            }
        >
            <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-8">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(76,196,186,0.16),_transparent_55%)]" />
                <div className="relative flex flex-col gap-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Chatsian Theme
                    </p>
                    <h1 className="text-3xl font-semibold tracking-tight">
                        A calm command center for high-stakes practice.
                    </h1>
                    <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                        Launch the full PTE Core mock, complete all tasks, and
                        receive a scored breakdown of your strengths and
                        weaknesses.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <Button asChild>
                            <Link href="/tests/new">Start full test</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </DashboardShell>
    );
}
