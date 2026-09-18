import { createFileRoute, Link } from "@tanstack/react-router";
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, isToday, parseISO, startOfMonth, startOfWeek, subMonths } from "date-fns";
import { Bell, ChevronLeft, ChevronRight, Clock, MapPin, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Avatar, BottomNav, Card, Fab, Screen, SectionTitle, StatusDot, TextLink } from "@/components/mantezo/ui";
import { useStore } from "@/lib/store";
import { dayNum, greeting, monthAbbr } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Home — Mantezo" },
      { name: "description", content: "Your team's shared booking calendar and upcoming events." },
      { property: "og:title", content: "Home — Mantezo" },
      { property: "og:description", content: "Your team's shared booking calendar and upcoming events." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { bookings, notifications, team } = useStore();
  const me = team.find((m) => m.isCurrentUser)!;
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const unread = notifications.some((n) => !n.read);

  const days = useMemo(
    () => eachDayOfInterval({ start: startOfWeek(startOfMonth(month)), end: endOfWeek(endOfMonth(month)) }),
    [month],
  );
  const bookingDates = useMemo(() => new Set(bookings.map((b) => b.date)), [bookings]);

  const upcoming = useMemo(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    return [...bookings].filter((b) => b.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);
  }, [bookings]);

  return (
    <Screen>
      <header className="sticky top-0 z-30 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 bg-background/80 px-4 py-3 backdrop-blur-md">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-badge text-link">
            <Users className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-[12px] text-muted-foreground">{greeting()}</p>
            <h1 className="truncate font-heading text-[18px] font-bold leading-tight">Team Mantezo</h1>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link to="/notifications" aria-label="Notifications" className="tap relative grid h-11 w-11 place-items-center rounded-full border border-border bg-elevated/70">
            <Bell className="h-5 w-5" />
            {unread && <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-live shadow-[0_0_8px_var(--live)]" />}
          </Link>
          <Link to="/settings" aria-label="Profile" className="tap grid place-items-center">
            <Avatar member={me} size={40} />
          </Link>
        </div>
      </header>

      <div className="space-y-5 px-4 pt-1">
        <Card glow className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <button type="button" aria-label="Previous month" onClick={() => setMonth((m) => subMonths(m, 1))} className="tap grid place-items-center rounded-full text-foreground/80">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="font-heading text-[16px] font-semibold">{format(month, "MMMM yyyy")}</h2>
            <button type="button" aria-label="Next month" onClick={() => setMonth((m) => addMonths(m, 1))} className="tap grid place-items-center rounded-full text-foreground/80">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <div className="grid grid-cols-7 text-center text-[11px] font-medium text-muted-foreground">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <span key={d} className="py-1">{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((d) => {
              const iso = format(d, "yyyy-MM-dd");
              const inMonth = isSameMonth(d, month);
              const has = bookingDates.has(iso);
              const today = isToday(d);
              return (
                <Link
                  key={iso}
                  to="/day/$date"
                  params={{ date: iso }}
                  aria-label={format(d, "MMMM d")}
                  className={cn("flex h-11 flex-col items-center justify-center", !inMonth && "opacity-30")}
                >
                  <span className={cn("grid h-8 w-8 place-items-center rounded-full text-[13px] font-medium", today && "bg-gradient-primary font-bold text-primary-foreground shadow-glow")}>
                    {format(d, "d")}
                  </span>
                  <span className={cn("mt-0.5 h-1 w-1 rounded-full", has ? (isSameDay(d, new Date()) ? "bg-live" : "bg-live") : "bg-transparent")} />
                </Link>
              );
            })}
          </div>
        </Card>

        <section>
          <SectionTitle action={<TextLink to="/bookings">View All <ChevronRight className="h-4 w-4" /></TextLink>}>Upcoming Events</SectionTitle>
          <div className="space-y-3">
            {upcoming.length === 0 && <Card className="text-center text-[13px] text-muted-foreground">No upcoming events. Tap + to add a booking.</Card>}
            {upcoming.map((b) => (
              <Link key={b.id} to="/booking/$id" params={{ id: b.id }} className="flex items-center gap-3 rounded-2xl border border-border bg-elevated/80 p-3 transition active:bg-elevated-2">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-badge text-link">
                  <span className="text-[10px] font-semibold leading-none">{monthAbbr(b.date)}</span>
                  <span className="font-heading text-[20px] font-bold leading-none">{dayNum(b.date)}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 truncate text-[15px] font-semibold">
                    {b.title} <StatusDot kind="live" />
                  </p>
                  <p className="truncate text-[12px] text-muted-foreground">Client: {b.clientName}</p>
                  <p className="mt-0.5 flex items-center gap-3 truncate text-[12px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{b.timeStart}</span>
                    <span className="inline-flex min-w-0 items-center gap-1 truncate"><MapPin className="h-3 w-3 shrink-0" />{b.venueName}, {b.venueCity}</span>
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </section>
      </div>

      <Fab />
      <BottomNav />
    </Screen>
  );
}

export { parseISO };
