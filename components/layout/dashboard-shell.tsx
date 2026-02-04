"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { BookOpen, Gauge, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Sidebar,
    SidebarContent,
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

const NAV_ITEMS = [
    {
        label: "Overview",
        href: "/",
        icon: Gauge,
        key: "overview",
    },
    {
        label: "Tests",
        href: "/tests/new",
        icon: BookOpen,
        key: "tests",
    },
];

type DashboardShellProps = {
    title: string;
    subtitle?: string;
    active?: string;
    actions?: ReactNode;
    children: ReactNode;
};

export function DashboardShell({
    title,
    subtitle,
    active,
    actions,
    children,
}: DashboardShellProps) {
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
                                {NAV_ITEMS.map((item) => (
                                    <SidebarMenuItem key={item.key}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={active === item.key}
                                        >
                                            <Link href={item.href}>
                                                <item.icon />
                                                <span>{item.label}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>
            <SidebarInset>
                <header className="flex h-14 items-center gap-2 border-b border-border/60 bg-background/80 px-4 backdrop-blur">
                    <SidebarTrigger />
                    <div className="flex flex-col">
                        <span className="text-sm font-medium">{title}</span>
                        {subtitle ? (
                            <span className="text-xs text-muted-foreground">
                                {subtitle}
                            </span>
                        ) : null}
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        {actions ?? (
                            <Button variant="secondary" size="sm" asChild>
                                <Link href="/tests/new">Start a test</Link>
                            </Button>
                        )}
                    </div>
                </header>
                <main className="flex flex-1 flex-col gap-6 p-6">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
