import { DashboardShell } from "@/components/layout/dashboard-shell";
import { TestSessionClient } from "@/components/tests/test-session-client";

export default async function TestSessionPage({
    params,
}: {
    params: Promise<{ sessionId: string }>;
}) {
    const { sessionId } = await params;
    return (
        <DashboardShell
            title="PTE Core Mock"
            subtitle="Complete the full test in one sitting"
            active="tests"
        >
            <TestSessionClient sessionId={sessionId} />
        </DashboardShell>
    );
}
