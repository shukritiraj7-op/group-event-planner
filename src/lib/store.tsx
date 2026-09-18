import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { seedBookings, seedNotifications, seedTasks, team } from "./data";
import type { Booking, Notification, Task, TeamMember } from "./types";

const KEY = "mantezo-store-v1";

interface State {
  bookings: Booking[];
  tasks: Task[];
  notifications: Notification[];
}

interface Store extends State {
  team: TeamMember[];
  hydrated: boolean;
  addBooking: (b: Omit<Booking, "id">) => Booking;
  toggleTask: (id: string) => void;
  markAllRead: () => void;
}

const Ctx = createContext<Store | null>(null);

const initial: State = { bookings: seedBookings, tasks: seedTasks, notifications: seedNotifications };

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setState({ ...initial, ...(JSON.parse(raw) as State) });
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const addBooking = useCallback((b: Omit<Booking, "id">) => {
    const booking: Booking = { ...b, id: "b" + Date.now() };
    setState((s) => ({
      ...s,
      bookings: [...s.bookings, booking],
      notifications: [
        {
          id: "n" + Date.now(),
          type: "booking_assigned",
          title: "New booking added",
          description: `${booking.title} for ${booking.clientName} was added by Aryan.`,
          time: "Just now",
          read: false,
        },
        ...s.notifications,
      ],
    }));
    return booking;
  }, []);

  const toggleTask = useCallback((id: string) => {
    setState((s) => ({ ...s, tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) }));
  }, []);

  const markAllRead = useCallback(() => {
    setState((s) => ({ ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })) }));
  }, []);

  const value = useMemo<Store>(
    () => ({ ...state, team, hydrated, addBooking, toggleTask, markAllRead }),
    [state, hydrated, addBooking, toggleTask, markAllRead],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore outside StoreProvider");
  return s;
}
