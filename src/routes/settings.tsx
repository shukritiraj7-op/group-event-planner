import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Bell, CalendarDays, ClipboardList, HelpCircle, Lock, LogOut, Moon, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, BottomNav, Card, ListRow, Screen, SectionTitle, TopBar } from "@/components/mantezo/ui";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Profile & Settings — Mantezo" },
      { name: "description", content: "Your profile, notification preferences and team account settings." },
      { property: "og:title", content: "Profile & Settings — Mantezo" },
      { property: "og:description", content: "Your profile, notification preferences and team account settings." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { team, bookings, tasks } = useStore();
  const me = team.find((m) => m.isCurrentUser)!;
  const navigate = useNavigate();
  const [push, setPush] = useState(true);

  return (
    <Screen>
      <TopBar back="/home" title="Profile & Settings" />
      <div className="space-y-5 px-4 pt-1">
        <Card glow className="flex items-center gap-4">
          <Avatar member={me} size={64} />
          <div className="min-w-0">
            <p className="truncate font-heading text-[19px] font-bold">{me.name}</p>
            <p className="truncate text-[13px] text-muted-foreground">{me.role}</p>
            <p className="mt-1 inline-block rounded-full bg-badge px-2.5 py-1 text-[11px] font-semibold text-link">Team Mantezo</p>
          </div>
        </Card>

        <div className="grid grid-cols-3 gap-3">
          <Stat label="Events" value={bookings.length} />
          <Stat label="Tasks" value={tasks.filter((t) => !t.done).length} />
          <Stat label="Members" value={team.length} />
        </div>

        <section>
          <SectionTitle>Preferences</SectionTitle>
          <div className="space-y-3">
            <Card className="flex items-center gap-3 p-3.5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-badge text-link"><Bell className="h-5 w-5" /></span>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold">Push notifications</p>
                <p className="text-[13px] text-muted-foreground">Booking and task alerts</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={push}
                aria-label="Push notifications"
                onClick={() => setPush((v) => !v)}
                className={`relative h-7 w-12 shrink-0 rounded-full transition ${push ? "bg-gradient-primary" : "bg-elevated-2"}`}
              >
                <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${push ? "left-6" : "left-1"}`} />
              </button>
            </Card>
            <Card className="flex items-center gap-3 p-3.5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-badge text-link"><Moon className="h-5 w-5" /></span>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold">Dark theme</p>
                <p className="text-[13px] text-muted-foreground">Always on for Mantezo</p>
              </div>
              <span className="rounded-full bg-badge px-2.5 py-1 text-[11px] font-semibold text-link">ON</span>
            </Card>
          </div>
        </section>

        <section>
          <SectionTitle>Workspace</SectionTitle>
          <div className="space-y-3">
            <ListRow icon={Users} title="Team Members" subtitle={`${team.length} people`} to="/team" />
            <ListRow icon={CalendarDays} title="All Bookings" subtitle={`${bookings.length} events`} to="/bookings" />
            <ListRow icon={ClipboardList} title="Tasks" subtitle={`${tasks.filter((t) => !t.done).length} pending`} to="/tasks" />
            <ListRow icon={Lock} title="Privacy & Security" subtitle="Password and access" onClick={() => toast("Security settings coming soon.")} />
            <ListRow icon={HelpCircle} title="Help & Support" subtitle="Contact the Mantezo team" onClick={() => toast("Write to support@mantezo.app")} />
          </div>
        </section>

        <button
          type="button"
          onClick={() => {
            toast("Signed out");
            navigate({ to: "/login" });
          }}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-[14px] border border-live/50 text-[15px] font-semibold text-live active:scale-[0.98]"
        >
          <LogOut className="h-4 w-4" /> Log Out
        </button>
      </div>
      <BottomNav />
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-elevated/80 px-3 py-3 text-center">
      <p className="font-heading text-[20px] font-bold">{value}</p>
      <p className="text-[12px] text-muted-foreground">{label}</p>
    </div>
  );
}
