import { createFileRoute } from "@tanstack/react-router";
import { BellRing, CalendarCheck, CheckCheck, ClipboardList, MessageSquare, Users, type LucideIcon } from "lucide-react";
import { BottomNav, Card, IconBadge, Screen, TopBar } from "@/components/mantezo/ui";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Notification } from "@/lib/types";

const iconFor: Record<Notification["type"], LucideIcon> = {
  booking_assigned: BellRing,
  task_reminder: ClipboardList,
  client_message: MessageSquare,
  team_update: Users,
  event_completed: CalendarCheck,
};

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Mantezo" },
      { name: "description", content: "Booking assignments, task reminders and client messages for your team." },
      { property: "og:title", content: "Notifications — Mantezo" },
      { property: "og:description", content: "Booking assignments, task reminders and client messages for your team." },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { notifications, markAllRead } = useStore();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <Screen>
      <TopBar
        back="/home"
        title="Notifications"
        subtitle={unread ? `${unread} unread` : "You're all caught up"}
        right={
          unread ? (
            <button type="button" onClick={markAllRead} className="flex h-11 items-center gap-1.5 rounded-full border border-border bg-elevated/70 px-3.5 text-[13px] font-medium text-link">
              <CheckCheck className="h-4 w-4" /> Read all
            </button>
          ) : undefined
        }
      />
      <div className="space-y-3 px-4 pt-1">
        {notifications.length === 0 && (
          <Card className="py-10 text-center text-[14px] text-muted-foreground">
            <BellRing className="mx-auto mb-2 h-7 w-7 text-link" />
            No notifications yet.
          </Card>
        )}
        {notifications.map((n) => (
          <Card key={n.id} glow={!n.read} className={cn("flex items-start gap-3 p-3.5", n.read && "opacity-75")}>
            <IconBadge icon={iconFor[n.type]} />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-[15px] font-semibold">
                {n.title}
                {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-live shadow-[0_0_8px_var(--live)]" />}
              </p>
              <p className="text-[13px] leading-relaxed text-muted-foreground">{n.description}</p>
              <p className="mt-1 text-[12px] text-muted-foreground/80">{n.time}</p>
            </div>
          </Card>
        ))}
      </div>
      <BottomNav />
    </Screen>
  );
}
