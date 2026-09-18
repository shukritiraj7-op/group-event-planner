import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Circle, ClipboardList } from "lucide-react";
import { useMemo, useState } from "react";
import { Avatar, BottomNav, Card, ProgressBar, Screen, Segmented, TopBar } from "@/components/mantezo/ui";
import { useStore } from "@/lib/store";
import { shortDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const filters = ["All", "Mine", "Pending", "Done"] as const;

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks — Mantezo" },
      { name: "description", content: "Track every task across bookings, who owns it and when it is due." },
      { property: "og:title", content: "Tasks — Mantezo" },
      { property: "og:description", content: "Track every task across bookings, who owns it and when it is due." },
    ],
  }),
  component: TasksPage,
});

function TasksPage() {
  const { tasks, team, bookings, toggleTask } = useStore();
  const me = team.find((m) => m.isCurrentUser);
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");

  const list = useMemo(
    () =>
      tasks.filter((t) => {
        if (filter === "Mine") return t.assigneeId === me?.id;
        if (filter === "Pending") return !t.done;
        if (filter === "Done") return t.done;
        return true;
      }),
    [tasks, filter, me],
  );

  const done = tasks.filter((t) => t.done).length;
  const pct = tasks.length ? (done / tasks.length) * 100 : 0;

  return (
    <Screen>
      <TopBar back="/home" title="Tasks" subtitle={`${tasks.length - done} pending · ${done} completed`} />
      <div className="space-y-4 px-4 pt-1">
        <Card glow>
          <div className="mb-2 flex items-center justify-between">
            <p className="font-heading text-[15px] font-semibold">Overall progress</p>
            <span className="text-[13px] text-muted-foreground">{Math.round(pct)}%</span>
          </div>
          <ProgressBar value={pct} />
        </Card>

        <Segmented options={filters} value={filter} onChange={setFilter} />

        <ul className="space-y-3">
          {list.length === 0 && (
            <Card className="py-8 text-center text-[14px] text-muted-foreground">
              <ClipboardList className="mx-auto mb-2 h-7 w-7 text-link" />
              Nothing here yet.
            </Card>
          )}
          {list.map((t) => {
            const a = team.find((m) => m.id === t.assigneeId);
            const b = bookings.find((x) => x.id === t.bookingId);
            return (
              <li key={t.id}>
                <Card className="p-3.5">
                  <div className="flex items-start gap-3">
                    <button type="button" aria-label={t.done ? "Mark as pending" : "Mark as done"} onClick={() => toggleTask(t.id)} className="mt-0.5 shrink-0 active:scale-90">
                      {t.done ? <CheckCircle2 className="h-6 w-6 text-online" /> : <Circle className="h-6 w-6 text-muted-foreground" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-[15px] font-semibold", t.done && "text-muted-foreground line-through")}>{t.title}</p>
                      {b && (
                        <Link to="/booking/$id" params={{ id: b.id }} className="text-[12px] font-medium text-link">
                          {b.title}
                        </Link>
                      )}
                      <p className="mt-1 text-[12px] text-muted-foreground">Due {shortDate(t.dueDate)} · {t.dueTime}</p>
                      <div className="mt-2 flex items-center gap-2">
                        {a && <Avatar member={a} size={24} />}
                        <span className="text-[12px] text-muted-foreground">{a?.name ?? "Unassigned"}</span>
                        <span className={cn("ml-auto rounded-full px-2.5 py-1 text-[11px] font-semibold", t.priority === "High" ? "bg-live/15 text-live" : t.priority === "Medium" ? "bg-badge text-link" : "bg-elevated-2 text-muted-foreground")}>
                          {t.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      </div>
      <BottomNav />
    </Screen>
  );
}
