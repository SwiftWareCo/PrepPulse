import {
    BookOpen,
    Gauge,
    MessageSquare,
    Settings,
    Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarSeparator,
    SidebarTrigger,
} from "@/components/ui/sidebar";

export default function Home() {
    return (
        <SidebarProvider defaultOpen>
            <Sidebar variant="inset">
                <SidebarHeader className="gap-1">
                    <div className="flex items-center gap-2 px-2 pt-2">
                        <div className="flex size-9 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
                            <Sparkles className="size-4" />
                        </div>
                        <div className="flex flex-col leading-tight">
                            <span className="text-sm font-semibold">
                                Chatsian
                            </span>
                            <span className="text-xs text-sidebar-foreground/70">
                                PTE Core Prep
                            </span>
                        </div>
                    </div>
                </SidebarHeader>
                <SidebarSeparator />
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>Workspace</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton isActive>
                                        <Gauge />
                                        <span>Overview</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton>
                                        <BookOpen />
                                        <span>Tests</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton>
                                        <MessageSquare />
                                        <span>AI Tutor</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton>
                                        <Sparkles />
                                        <span>Insights</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton>
                                        <Settings />
                                        <span>Settings</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarFooter>
                    <div className="flex items-center gap-2 rounded-lg bg-sidebar-accent px-3 py-2 text-xs text-sidebar-accent-foreground">
                        Daily streak: <span className="font-semibold">6</span>
                    </div>
                </SidebarFooter>
            </Sidebar>
            <SidebarInset>
                <header className="flex h-14 items-center gap-2 border-b border-border/60 bg-background/80 px-4 backdrop-blur">
                    <SidebarTrigger />
                    <div className="flex flex-col">
                        <span className="text-sm font-medium">Overview</span>
                        <span className="text-xs text-muted-foreground">
                            Your PTE Core focus dashboard
                        </span>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <Button variant="secondary" size="sm">
                            Start a test
                        </Button>
                        <Button size="sm">Resume</Button>
                    </div>
                </header>
                <main className="flex flex-1 flex-col gap-6 p-6">
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
                                Focus on consistent progress with AI feedback,
                                adaptive practice, and clear visibility into
                                your weakest skills.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <Button>Continue last test</Button>
                                <Button variant="outline">
                                    Review insights
                                </Button>
                            </div>
                        </div>
                    </section>
                    <section className="grid gap-4 md:grid-cols-3">
                        {[
                            {
                                title: "Accuracy trend",
                                value: "82%",
                                detail: "+6% from last week",
                            },
                            {
                                title: "Words to review",
                                value: "28",
                                detail: "Focus: Listening + Writing",
                            },
                            {
                                title: "AI feedback queue",
                                value: "3",
                                detail: "Ready for review",
                            },
                        ].map((card) => (
                            <div
                                key={card.title}
                                className="rounded-2xl border border-border/60 bg-card p-5"
                            >
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                    {card.title}
                                </p>
                                <p className="mt-3 text-2xl font-semibold">
                                    {card.value}
                                </p>
                                <p className="mt-2 text-xs text-muted-foreground">
                                    {card.detail}
                                </p>
                            </div>
                        ))}
                    </section>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
