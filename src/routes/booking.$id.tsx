import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Briefcase, CalendarDays, CheckCircle2, ClipboardList, Clock, Mail, MapPin, Phone, Quote, Sparkles, User, Users, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Avatar, Card, CardHeader, GradientButton, IconBadge, ProgressBar, Screen, TagChip, TopBar } from "@/components/mantezo/ui";
import { useStore } from "@/lib/store";
import { inr, longDate, weekday } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/booking/$id")({
  head: () => ({
    meta: [
      { title: "Booking Details — Mantezo" },
      { name: "description", content: "Client, venue, budget, special demands and team tasks for this booking." },
      { property: "og:title", content: "Booking Details — Mantezo" },
      { property: "og:description", content: "Client, venue, budget, special demands and team tasks for this booking." },
    ],
  }),
  component: BookingDetailPage,
  notFoundComponent: () => (
    <Screen withNav={false}>
      <TopBar back="/bookings" title="Booking not found" />
      <Card className="mx-4 text-center text-[14px] text-muted-foreground">This booking no longer exists.</Card>
    </Screen>
  ),
});

function BookingDetailPage() {
  const { id } = Route.useParams();
  const { bookings, tasks, team, toggleTask } = useStore();
  const b = bookings.find((x) => x.id === id);
  if (!b) throw notFound();

  const members = team.filter((m) => b.assignedTeamMemberIds.includes(m.id));
  const bTasks = tasks.filter((t) => t.bookingId === b.id);
  const spentPct = b.budgetTotal ? (b.budgetSpent / b.budgetTotal) * 100 : 0;

  return (
    <Screen withNav={false} className="pb-[calc(96px+env(safe-area-inset-bottom))]">
      <TopBar back="/bookings" title={b.title} subtitle={`${weekday(b.date)}, ${longDate(b.date)}`} />

      <div className="space-y-4 px-4 pt-1">
        <Card glow>
          <div className="flex items-start gap-3">
            <IconBadge icon={Briefcase} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="font-heading text-[17px] font-bold">{b.clientName}</p>
              <p className="text-[13px] text-muted-foreground">{b.clientType}</p>
              <p className="mt-1 inline-flex items-center gap-1.5 text-[13px] text-link">
                <User className="h-3.5 w-3.5" /> {b.contactPerson}
              </p>
            </div>
          </div>
          <div className="mt-3 grid gap-2">
            <a href={`tel:${b.phone}`} className="flex items-center gap-2 rounded-xl border border-border bg-elevated-2/60 px-3.5 py-2.5 text-[14px]">
              <Phone className="h-4 w-4 text-link" /> {b.phone}
            </a>
            <a href={`mailto:${b.email}`} className="flex items-center gap-2 truncate rounded-xl border border-border bg-elevated-2/60 px-3.5 py-2.5 text-[14px]">
              <Mail className="h-4 w-4 shrink-0 text-link" /> <span className="truncate">{b.email}</span>
            </a>
          </div>
          {b.clientQuote && (
            <p className="mt-3 flex gap-2 rounded-xl bg-badge/60 p-3 text-[13px] leading-relaxed text-foreground/90">
              <Quote className="h-4 w-4 shrink-0 text-link" /> {b.clientQuote}
            </p>
          )}
        </Card>

        <Card>
          <CardHeader icon={CalendarDays} title="Event Details" />
          <div className="grid grid-cols-2 gap-3 text-[13px]">
            <Info label="Event Type" value={b.eventType} />
            <Info label="Guests" value={`${b.peopleCount} people`} />
            <Info label="Start" value={b.timeStart} />
            <Info label="End" value={b.timeEnd} />
          </div>
        </Card>

        <Card>
          <CardHeader icon={MapPin} title="Venue" />
          <p className="text-[15px] font-semibold">{b.venueName}</p>
          <p className="text-[13px] text-muted-foreground">{b.venueAddress}</p>
          <div className="mt-3 flex items-center justify-between rounded-xl border border-border bg-elevated-2/60 px-3.5 py-2.5 text-[13px]">
            <span className="text-muted-foreground">{b.hallType}</span>
            <span className="font-semibold">{inr(b.hallCost)}</span>
          </div>
        </Card>

        <Card>
          <CardHeader icon={Wallet} title="Budget" />
          <div className="mb-2 flex items-end justify-between">
            <span className="font-heading text-[22px] font-bold">{inr(b.budgetSpent)}</span>
            <span className="text-[13px] text-muted-foreground">of {inr(b.budgetTotal)}</span>
          </div>
          <ProgressBar value={spentPct} />
          <p className="mt-2 text-[12px] text-muted-foreground">{Math.round(spentPct)}% spent · {inr(Math.max(0, b.budgetTotal - b.budgetSpent))} remaining</p>
        </Card>

        {b.specialDemands.length > 0 && (
          <Card>
            <CardHeader icon={Sparkles} title="Special Demands" />
            <div className="flex flex-wrap gap-2">
              {b.specialDemands.map((t) => (
                <TagChip key={t.label} icon={t.icon} label={t.label} subLabel={t.subLabel} />
              ))}
            </div>
          </Card>
        )}

        {b.extraActivities.length > 0 && (
          <Card>
            <CardHeader icon={Sparkles} title="Extra Activities" />
            <div className="flex flex-wrap gap-2">
              {b.extraActivities.map((t) => (
                <TagChip key={t.label} icon={t.icon} label={t.label} subLabel={t.subLabel} />
              ))}
            </div>
          </Card>
        )}

        <Card>
          <CardHeader icon={Users} title="Assigned Team" action={<Link to="/team" className="text-[13px] font-medium text-link">Manage</Link>} />
          <ul className="space-y-2.5">
            {members.map((m) => (
              <li key={m.id} className="flex items-center gap-3">
                <Avatar member={m} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold">{m.name}{m.isCurrentUser && " (You)"}</p>
                  <p className="truncate text-[12px] text-muted-foreground">{m.role}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader icon={ClipboardList} title="Tasks" action={<Link to="/tasks" className="text-[13px] font-medium text-link">All tasks</Link>} />
          {bTasks.length === 0 && <p className="text-[13px] text-muted-foreground">No tasks yet for this booking.</p>}
          <ul className="space-y-2">
            {bTasks.map((t) => {
              const a = team.find((m) => m.id === t.assigneeId);
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => toggleTask(t.id)}
                    className="flex w-full items-center gap-3 rounded-xl border border-border bg-elevated-2/60 p-3 text-left transition active:scale-[0.99]"
                  >
                    <CheckCircle2 className={cn("h-5 w-5 shrink-0", t.done ? "text-online" : "text-muted-foreground")} />
                    <div className="min-w-0 flex-1">
                      <p className={cn("truncate text-[14px] font-medium", t.done && "text-muted-foreground line-through")}>{t.title}</p>
                      <p className="truncate text-[12px] text-muted-foreground">
                        {a?.name ?? "Unassigned"} · <Clock className="inline h-3 w-3" /> {t.dueTime}
                      </p>
                    </div>
                    <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold", t.priority === "High" ? "bg-live/15 text-live" : t.priority === "Medium" ? "bg-badge text-link" : "bg-elevated text-muted-foreground")}>
                      {t.priority}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>

        <GradientButton onClick={() => toast.success("Team notified about this booking")}>Notify Team</GradientButton>
      </div>
    </Screen>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-elevated-2/60 px-3.5 py-2.5">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="truncate text-[14px] font-semibold">{value}</p>
    </div>
  );
}
