import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Mail, Phone, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Avatar, BottomNav, Card, GradientButton, Screen, SectionTitle, StatusDot, TopBar } from "@/components/mantezo/ui";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "Team — Mantezo" },
      { name: "description", content: "See who is online, their role and how many events each member is running." },
      { property: "og:title", content: "Team — Mantezo" },
      { property: "og:description", content: "See who is online, their role and how many events each member is running." },
    ],
  }),
  component: TeamPage,
});

function TeamPage() {
  const { team, bookings, tasks } = useStore();
  const online = team.filter((m) => m.presence === "online");

  return (
    <Screen>
      <TopBar back="/home" title="Team Members" subtitle={`${online.length} of ${team.length} online`} />
      <div className="space-y-4 px-4 pt-1">
        <Card glow className="flex items-center justify-between">
          <div>
            <p className="font-heading text-[16px] font-semibold">Team Mantezo</p>
            <p className="text-[13px] text-muted-foreground">{bookings.length} events · {tasks.filter((t) => !t.done).length} open tasks</p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-badge px-3 py-1.5 text-[12px] font-semibold text-link">
            <StatusDot kind="online" /> {online.length} online
          </div>
        </Card>

        <section>
          <SectionTitle>Members</SectionTitle>
          <ul className="space-y-3">
            {team.map((m) => {
              const events = bookings.filter((b) => b.assignedTeamMemberIds.includes(m.id)).length;
              const open = tasks.filter((t) => t.assigneeId === m.id && !t.done).length;
              return (
                <li key={m.id}>
                  <Card className="p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar member={m} size={46} />
                        <span className="absolute -bottom-0.5 -right-0.5">
                          <StatusDot kind={m.presence} className="h-3 w-3 ring-2 ring-elevated" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-semibold">
                          {m.name}{m.isCurrentUser && " (You)"}
                          {m.isAdmin && <span className="ml-2 rounded-full bg-badge px-2 py-0.5 text-[10px] font-bold text-link">ADMIN</span>}
                        </p>
                        <p className="truncate text-[12px] text-muted-foreground">{m.role}</p>
                        <p className="mt-0.5 text-[12px] text-muted-foreground">{events} events · {open} open tasks</p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button type="button" aria-label={`Call ${m.name}`} onClick={() => toast(`Calling ${m.name}…`)} className="grid h-10 w-10 place-items-center rounded-full border border-border bg-elevated-2/70 text-link active:scale-95">
                          <Phone className="h-4 w-4" />
                        </button>
                        <button type="button" aria-label={`Message ${m.name}`} onClick={() => toast(`Message sent to ${m.name}`)} className="grid h-10 w-10 place-items-center rounded-full border border-border bg-elevated-2/70 text-link active:scale-95">
                          <Mail className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        </section>

        <Link to="/tasks" className="flex items-center justify-between rounded-2xl border border-border bg-elevated/80 p-3.5">
          <span className="text-[14px] font-semibold">Assign tasks to the team</span>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </Link>

        <GradientButton arrow={false} onClick={() => toast("Invite link copied — share it with your teammate.")}>
          <UserPlus className="h-4 w-4" /> Invite Member
        </GradientButton>
      </div>
      <BottomNav />
    </Screen>
  );
}
