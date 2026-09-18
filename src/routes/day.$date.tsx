import { createFileRoute, Link } from "@tanstack/react-router";
import { Briefcase, CalendarCheck, CalendarDays, CalendarPlus, ChevronDown, ChevronRight, ClipboardList, Clock, Mail, MapPin, Pencil, Phone, Play, Plus, Quote, Sparkles, User, Users, Wallet } from "lucide-react";
import venueHero from "@/assets/venue-hero.jpg";
import emptyCal from "@/assets/empty-calendar.png";
import { Avatar, Card, CardHeader, Fab, GradientLink, IconBadge, ListRow, OutlineLink, ProgressBar, Screen, TagChip, TextLink, TopBar } from "@/components/mantezo/ui";
import { useStore } from "@/lib/store";
import { inr, longDate, shortDate, weekday } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/day/$date")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.date} — Team Calendar — Mantezo` },
      { name: "description", content: "Booking details, client info, budget and tasks for this day." },
      { property: "og:title", content: `${params.date} — Team Calendar — Mantezo` },
      { property: "og:description", content: "Booking details, client info, budget and tasks for this day." },
    ],
  }),
  component: DayPage,
});

function DayPage() {
  const { date } = Route.useParams();
  const { bookings } = useStore();
  const booking = bookings.find((b) => b.date === date);
  if (!booking) return <EmptyDay date={date} />;
  return <BookingDay id={booking.id} />;
}

function EmptyDay({ date }: { date: string }) {
  let title = "Team Day";
  try {
    title = longDate(date);
  } catch {
    /* keep default */
  }
  return (
    <Screen withNav={false} className="pb-28">
      <TopBar
        back="/home"
        title={title}
        subtitle="No Bookings Scheduled"
        right={
          <button type="button" className="flex h-11 items-center gap-2 rounded-full border border-border bg-elevated/70 px-3.5 text-[13px] font-medium" onClick={() => toast("Showing the whole team")}>
            <Users className="h-4 w-4 text-link" /> Team <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
        }
      />
      <div className="space-y-3 px-4 pt-1">
        <Card glow className="flex flex-col items-center px-6 pb-8 pt-6 text-center">
          <div className="relative">
            <Sparkles className="absolute -left-6 top-10 h-4 w-4 text-link/80" />
            <Sparkles className="absolute -right-4 top-4 h-3 w-3 text-link/60" />
            <img src={emptyCal} alt="" width={816} height={816} className="h-48 w-48 animate-float-glow" />
          </div>
          <h2 className="mt-2 font-heading text-[24px] font-bold">No Booking for this Day</h2>
          <p className="mt-2 max-w-[280px] text-[15px] leading-relaxed text-muted-foreground">Looks like there are no bookings scheduled for this day.</p>
          <OutlineLink to="/booking/new" search={{ date }} className="mt-6">
            <CalendarPlus className="h-5 w-5 text-link" /> Add New Booking <ChevronRight className="h-4 w-4" />
          </OutlineLink>
        </Card>
        <ListRow icon={CalendarDays} title="Day Overview" subtitle="No events or tasks for this day" onClick={() => toast("Nothing planned for this day yet.")} />
        <ListRow icon={Users} title="Team Members" subtitle="View and assign tasks to your team" to="/team" />
        <ListRow icon={ClipboardList} title="Upcoming Tasks" subtitle="No tasks scheduled" to="/tasks" />
      </div>
      <Fab date={date} />
    </Screen>
  );
}

function BookingDay({ id }: { id: string }) {
  const { bookings, tasks, team, toggleTask } = useStore();
  const b = bookings.find((x) => x.id === id)!;
  const bTasks = tasks.filter((t) => t.bookingId === b.id);
  const spentPct = b.budgetTotal ? (b.budgetSpent / b.budgetTotal) * 100 : 0;
  const editToast = () => toast("Editing comes with team sync — coming soon.");

  return (
    <Screen withNav={false} className="pb-[calc(96px+env(safe-area-inset-bottom))]">
      <TopBar
        back="/home"
        title={longDate(b.date)}
        subtitle="Team Calendar"
        right={
          <button type="button" className="flex h-11 items-center gap-2 rounded-full border border-border bg-elevated/70 px-3.5 text-[13px] font-medium" onClick={() => toast("Week & month views coming soon.")}>
            <CalendarDays className="h-4 w-4 text-link" /> Day View <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
        }
      />

      <div className="space-y-3 px-4 pt-1">
        {/* Hero */}
        <div className="overflow-hidden rounded-2xl border-glow">
          <div className="relative aspect-[16/10] min-h-[210px] w-full">
            <img src={venueHero} alt={b.venueName} width={1280} height={720} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/75 to-background/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-background/30" />
            <div className="relative flex h-full flex-col justify-between p-4">
              <div className="flex items-start justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-live/25 px-3 py-1.5 text-[11px] font-bold tracking-wider text-foreground ring-1 ring-live/50">
                  <span className="h-2 w-2 rounded-full bg-live" /> BOOKING
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-elevated/80 px-3 py-1.5 text-[12px] font-medium backdrop-blur">
                  <Clock className="h-3.5 w-3.5 text-link" /> {b.timeStart} – {b.timeEnd}
                </span>
              </div>
              <div className="flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="flex items-center gap-2 font-heading text-[26px] font-bold leading-tight">
                    <span className="truncate">{b.title}</span>
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-live shadow-[0_0_10px_var(--live)]" />
                  </h2>
                  <p className="truncate text-[14px] text-link">Client: {b.clientName}</p>
                </div>
                <Link to="/booking/$id" params={{ id: b.id }} className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-border bg-elevated/80 px-3 text-[12px] font-semibold backdrop-blur active:scale-95">
                  View Full Details <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 divide-x divide-border bg-elevated/80">
            <QuickInfo icon={CalendarDays} a={shortDate(b.date)} b={weekday(b.date)} />
            <QuickInfo icon={MapPin} a={b.venueName} b={b.venueCity} />
            <QuickInfo icon={Users} a={`${b.peopleCount}`} b="People" />
          </div>
        </div>

        {/* Client Details */}
        <Card>
          <CardHeader icon={Briefcase} title="Client Details" action={<EditButton onClick={editToast} />} />
          <div className="flex items-start gap-3">
            <IconBadge icon={Briefcase} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="font-heading text-[17px] font-semibold">{b.clientName}</p>
              <span className="mt-1 inline-block rounded-full border border-glow/40 bg-badge px-3 py-1 text-[12px] text-link">{b.clientType}</span>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            <InfoRow icon={User} value={b.contactPerson} label="Contact Person" />
            <InfoRow icon={Phone} value={b.phone} label="Phone" />
            <InfoRow icon={Mail} value={b.email} label="Email" />
          </div>
          {b.clientQuote && (
            <div className="mt-4 rounded-xl border border-border bg-elevated-2/50 p-4">
              <Quote className="h-4 w-4 text-link" />
              <p className="mt-2 text-[14px] italic leading-relaxed text-foreground/85">“{b.clientQuote}”</p>
              <p className="mt-2 text-[13px] text-muted-foreground">— {b.contactPerson}</p>
            </div>
          )}
        </Card>

        {/* Venue */}
        <Card>
          <CardHeader
            icon={MapPin}
            title="Venue Details"
            action={
              <a href={`https://maps.google.com/?q=${encodeURIComponent(b.venueName + " " + b.venueAddress)}`} target="_blank" rel="noreferrer" className="tap inline-flex items-center gap-1 text-[13px] font-medium text-link">
                View Location <ChevronRight className="h-4 w-4" />
              </a>
            }
          />
          <div className="flex gap-3">
            <img src={venueHero} alt="" width={1280} height={720} loading="lazy" className="h-[72px] w-[96px] shrink-0 rounded-xl object-cover" />
            <div className="min-w-0">
              <p className="text-[15px] font-semibold">{b.venueName}</p>
              <p className="text-[13px] leading-snug text-link/90">{b.venueAddress}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 divide-x divide-border border-t border-border pt-3">
            <Meta label="Hall / Venue Cost" value={inr(b.hallCost)} />
            <Meta label="No. of People" value={`${b.peopleCount}`} />
            <Meta label="Hall Type" value={b.hallType} />
          </div>
        </Card>

        {/* Budget */}
        <Card>
          <CardHeader icon={Wallet} title="Budget" />
          <div className="flex items-center gap-3">
            <IconBadge icon={Wallet} size="lg" />
            <div>
              <p className="font-heading text-[24px] font-bold leading-tight">{inr(b.budgetTotal)}</p>
              <p className="text-[13px] text-link/90">Total Estimated Budget</p>
            </div>
          </div>
          <div className="mt-4">
            <ProgressBar value={spentPct} />
          </div>
          <div className="mt-3 flex justify-between text-[13px]">
            <div>
              <p className="text-muted-foreground">Spent</p>
              <p className="text-[15px] font-semibold">{inr(b.budgetSpent)}</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground">Remaining</p>
              <p className="text-[15px] font-semibold">{inr(b.budgetTotal - b.budgetSpent)}</p>
            </div>
          </div>
        </Card>

        {/* Special demands */}
        <Card>
          <CardHeader icon={Sparkles} title="Special Demands" action={<EditButton onClick={editToast} />} />
          <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
            {b.specialDemands.length === 0 && <p className="text-[13px] text-muted-foreground">No special demands noted.</p>}
            {b.specialDemands.map((t) => (
              <TagChip key={t.label} {...t} />
            ))}
          </div>
        </Card>

        {/* Extra activity */}
        <Card>
          <CardHeader icon={Play} title="Extra Activity" action={<EditButton onClick={editToast} />} />
          <div className="flex items-center gap-2">
            <div className="scrollbar-none flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1">
              {b.extraActivities.length === 0 && <p className="text-[13px] text-muted-foreground">No extra activities.</p>}
              {b.extraActivities.map((t) => (
                <TagChip key={t.label} {...t} />
              ))}
            </div>
            <button type="button" aria-label="Add activity" onClick={editToast} className="tap grid h-11 w-11 shrink-0 place-items-center rounded-full border border-border bg-elevated-2/60">
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </Card>

        {/* Tasks */}
        <Card>
          <CardHeader icon={CalendarCheck} title={`Tasks (${bTasks.length})`} action={<TextLink to="/tasks">View All <ChevronRight className="h-4 w-4" /></TextLink>} />
          <div className="space-y-2">
            {bTasks.length === 0 && <p className="text-[13px] text-muted-foreground">No tasks yet for this booking.</p>}
            {bTasks.map((t) => {
              const who = team.find((m) => m.id === t.assigneeId)!;
              return (
                <div key={t.id} className="flex items-center gap-3 rounded-xl border border-border bg-elevated-2/40 p-3">
                  <button
                    type="button"
                    aria-label={t.done ? "Mark incomplete" : "Mark complete"}
                    onClick={() => {
                      toggleTask(t.id);
                      if (!t.done) toast.success("Task marked complete ✓");
                    }}
                    className={cn("tap -m-2 grid place-items-center")}
                  >
                    <span className={cn("grid h-6 w-6 place-items-center rounded-full border-2 transition", t.done ? "border-online bg-online/20 text-online" : "border-muted-foreground/60")}>
                      {t.done && <CalendarCheck className="h-3.5 w-3.5" />}
                    </span>
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className={cn("truncate text-[14px] font-semibold", t.done && "text-muted-foreground line-through")}>{t.title}</p>
                    <p className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                      <Avatar member={who} size={16} /> {who.name}
                    </p>
                  </div>
                  <span className="text-[12px] text-link">{t.dueTime}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40">
        <div className="mx-auto max-w-[480px] safe-bottom bg-gradient-to-t from-background via-background/95 to-transparent px-4 pb-4 pt-6">
          <GradientLink to="/tasks">
            <Play className="h-4 w-4" /> Manage Tasks
          </GradientLink>
        </div>
      </div>
    </Screen>
  );
}

function QuickInfo({ icon: Icon, a, b }: { icon: typeof MapPin; a: string; b: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2 px-3 py-3">
      <IconBadge icon={Icon} size="sm" />
      <div className="min-w-0">
        <p className="truncate text-[13px] font-semibold">{a}</p>
        <p className="truncate text-[11px] text-link/90">{b}</p>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, value, label }: { icon: typeof User; value: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <IconBadge icon={Icon} size="sm" />
      <div className="min-w-0">
        <p className="truncate text-[14px] font-medium">{value}</p>
        <p className="text-[12px] text-link/80">{label}</p>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 px-2 first:pl-0 last:pr-0">
      <p className="truncate text-[11px] text-link/80">{label}</p>
      <p className="truncate text-[14px] font-semibold">{value}</p>
    </div>
  );
}

function EditButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="tap inline-flex h-9 min-w-0 items-center gap-1.5 rounded-full border border-border bg-elevated-2/60 px-3.5 text-[12px] font-medium">
      <Pencil className="h-3.5 w-3.5 text-link" /> Edit
    </button>
  );
}
