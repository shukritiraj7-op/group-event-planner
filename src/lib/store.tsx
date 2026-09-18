import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { savedVenues, seedBookings, seedNotifications, seedTasks, team } from "./data";
import type { Booking, Notification, SavedVenue, Task, TeamMember } from "./types";

const KEY = "mantezo-store-v1";

interface State {
  bookings: Booking[];
  tasks: Task[];
  notifications: Notification[];
  venues: SavedVenue[];
}

interface Store extends State {
  team: TeamMember[];
  hydrated: boolean;
  addBooking: (b: Omit<Booking, "id">) => Booking;
  addVenue: (v: Omit<SavedVenue, "id">) => void;
  toggleTask: (id: string) => void;
  markAllRead: () => void;
}

const Ctx = createContext<Store | null>(null);

const initial: State = { bookings: seedBookings, tasks: seedTasks, notifications: seedNotifications, venues: savedVenues };

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<State>;
        setState({
          ...initial,
          ...parsed,
          venues: parsed.venues && parsed.venues.length > 0 ? parsed.venues : savedVenues,
        });
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const addVenue = useCallback((v: Omit<SavedVenue, "id">) => {
    setState((s) => {
      const exists = s.venues.some(
        (x) => x.name.toLowerCase() === v.name.toLowerCase() || (v.address && x.address.toLowerCase() === v.address.toLowerCase())
      );
      if (exists) return s;
      return {
        ...s,
        venues: [...s.venues, { ...v, id: "v" + Date.now() }],
      };
    });
  }, []);

  const addBooking = useCallback((b: Omit<Booking, "id">) => {
    const booking: Booking = { ...b, id: "b" + Date.now() };
    setState((s) => {
      const vName = booking.venueName?.trim();
      const vAddress = booking.venueAddress?.trim() || vName;
      const vCity = booking.venueCity?.trim() || "";

      let updatedVenues = s.venues;
      if (vName) {
        const exists = s.venues.some(
          (x) => x.name.toLowerCase() === vName.toLowerCase() || (vAddress && x.address.toLowerCase() === vAddress.toLowerCase())
        );
        if (!exists) {
          updatedVenues = [
            ...s.venues,
            {
              id: "v" + Date.now(),
              name: vName,
              city: vCity || "Local",
              address: vAddress,
            },
          ];
        }
      }

      return {
        ...s,
        bookings: [...s.bookings, booking],
        venues: updatedVenues,
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
      };
    });
    return booking;
  }, []);

  const toggleTask = useCallback((id: string) => {
    setState((s) => ({ ...s, tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) }));
  }, []);

  const markAllRead = useCallback(() => {
    setState((s) => ({ ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })) }));
  }, []);

  const value = useMemo<Store>(
    () => ({ ...state, team, hydrated, addBooking, addVenue, toggleTask, markAllRead }),
    [state, hydrated, addBooking, addVenue, toggleTask, markAllRead],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore outside StoreProvider");
  return s;
}
