import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, ChevronRight, Clock, MapPin, Search, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { AvatarStack, BottomNav, Card, Fab, Screen, Segmented, StatusDot, TopBar } from "@/components/mantezo/ui";
import { useStore } from "@/lib/store";
import { dayNum, inr, monthAbbr } from "@/lib/format";

const filters = ["All", "Upcoming", "Completed"] as const;

export const Route = createFileRoute("/bookings")({
  head: () => ({
    meta: [
      { title: "All Bookings — Mantezo" },
      { name: "description", content: "Every event booking your team has taken, with client, venue and budget at a glance." },
      { property: "og:title", content: "All Bookings — Mantezo" },
      { property: "og:description", content: "Every event booking your team has taken, with client, venue and budget at a glance." },
    ],
  }),
  component: BookingsPage,
});

function BookingsPage() {
  const { bookings, team } = useStore();
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    const query = q.trim().toLowerCase();
    return [...bookings]
      .filter((b) => {
        const done = b.status === "completed" || b.date < today;
        if (filter === "Upcoming" && done) return false;
        if (filter === "Completed" && !done) return false;
        if (!query) return true;
        return [b.title, b.clientName, b.venueName, b.venueCity].join(" ").toLowerCase().includes(query);
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [bookings, filter, q]);

  return (
    <Screen>
      <TopBar back="/home" title="All Bookings" subtitle={`${bookings.length} events total`} />
      <div className="space-y-4 px-4 pt-1">
        <label className="flex h-12 items-center gap-2.5 rounded-xl border border-border bg-elevated-2/70 px-3.5 focus-within:border-[color:var(--glow)] focus-within:shadow-glow">
          <Search className="h-4 w-4 shrink-0 text-link" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search client, venue or event"
            className="h-full w-full min-w-0 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
          />
        </label>

        <Segmented options={filters} value={filter} onChange={setFilter} />

        <div className="space-y-3">
          {list.length === 0 && (
            <Card className="py-8 text-center text-[14px] text-muted-foreground">
              <CalendarDays className="mx-auto mb-2 h-7 w-7 text-link" />
              No bookings match this filter.
            </Card>
          )}
          {list.map((b) => {
            const members = team.filter((m) => b.assignedTeamMemberIds.includes(m.id));
            return (
              <Link
                key={b.id}
                to="/booking/$id"
                params={{ id: b.id }}
                className="block rounded-2xl border border-border bg-elevated/80 p-3.5 transition active:bg-elevated-2"
              >
                <div className="flex items-start gap-3">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-badge text-link">
                    <span className="text-[10px] font-semibold leading-none">{monthAbbr(b.date)}</span>
                    <span className="font-heading text-[20px] font-bold leading-none">{dayNum(b.date)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 truncate text-[15px] font-semibold">
                      {b.title}
                      {b.status !== "completed" && <StatusDot kind="live" />}
                    </p>
                    <p className="truncate text-[12px] text-muted-foreground">Client: {b.clientName}</p>
                    <p className="mt-0.5 flex items-center gap-3 truncate text-[12px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{b.timeStart}</span>
                      <span className="inline-flex min-w-0 items-center gap-1 truncate"><MapPin className="h-3 w-3 shrink-0" />{b.venueCity}</span>
                    </p>
                  </div>
                  <ChevronRight className="mt-4 h-5 w-5 shrink-0 text-muted-foreground" />
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                  <AvatarStack members={members} />
                  <span className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
                    <Users className="h-3.5 w-3.5" /> {b.peopleCount} guests · {inr(b.budgetTotal)}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      <Fab />
      <BottomNav />
    </Screen>
  );
}
