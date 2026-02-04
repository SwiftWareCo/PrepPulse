import { DashboardShell } from "@/components/layout/dashboard-shell";
import { NewTestCard } from "@/components/tests/new-test-card";

export default function NewTestPage() {
    return (
        <DashboardShell
            title="Start Test"
            subtitle="Launch a full-length PTE Core mock"
            active="tests"
        >
            <NewTestCard />
        </DashboardShell>
    );
}
