import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { Briefcase, CalendarDays, CalendarPlus, ChevronRight, IndianRupee, MapPin, Pencil, Phone, Sparkles, User, Users, Wallet } from "lucide-react";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Card, CardHeader, Chip, Field, GradientButton, Screen, TopBar } from "@/components/mantezo/ui";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { eventTypes, extraActivityOptions, savedVenues } from "@/lib/data";
import { useStore } from "@/lib/store";
import { longDate } from "@/lib/format";
import type { LucideIcon } from "lucide-react";

const searchSchema = z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional() });

export const Route = createFileRoute("/booking/new")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Add New Booking — Mantezo" },
      { name: "description", content: "Log a new client booking with venue, budget, hall details and special demands." },
      { property: "og:title", content: "Add New Booking — Mantezo" },
      { property: "og:description", content: "Log a new client booking for your team." },
    ],
  }),
  component: NewBooking,
});

const num = (s: string) => Number(s.replace(/[^\d]/g, "")) || 0;

const schema = z.object({
  clientName: z.string().trim().min(1, "Client name is required").max(100),
  phone: z.string().trim().min(7, "Enter a valid phone number").max(20),
  eventType: z.string().min(1, "Choose an event type"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date"),
  hallName: z.string().trim().min(1, "Place / Hall name is required").max(120),
  hallCost: z.string().trim().min(1, "Cost is required"),
  people: z.string().trim().min(1, "No. of people is required"),
});

function NewBooking() {
  const { date: presetDate } = Route.useSearch();
  const navigate = useNavigate();
  const { addBooking } = useStore();

  const [f, setF] = useState({
    clientName: "",
    contactPerson: "",
    phone: "",
    eventType: "",
    date: presetDate ?? "",
    venue: null as null | (typeof savedVenues)[number],
    budget: "",
    hallName: "",
    hallCost: "",
    people: "",
    demand: "",
    activities: [] as string[],
    activityDetails: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [venueOpen, setVenueOpen] = useState(false);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((s) => ({ ...s, [k]: e.target.value }));

  function submit(e: FormEvent) {
    e.preventDefault();
    const r = schema.safeParse(f);
    if (!r.success) {
      const errs: Record<string, string> = {};
      for (const i of r.error.issues) errs[String(i.path[0])] = i.message;
      setErrors(errs);
      toast.error("Please fill the required fields");
      return;
    }
    setErrors({});
    const hallName = f.hallName.trim();
    const [vName, ...rest] = hallName.split(",");
    const booking = addBooking({
      title: f.eventType,
      clientName: f.clientName.trim(),
      clientType: "Client",
      contactPerson: f.contactPerson.trim() || f.clientName.trim(),
      phone: f.phone.trim(),
      email: "",
      clientQuote: f.demand.trim() || undefined,
      eventType: f.eventType,
      date: f.date,
      timeStart: "10:00 AM",
      timeEnd: "06:00 PM",
      venueName: f.venue?.name ?? vName.trim(),
      venueCity: f.venue?.city ?? rest.join(",").trim(),
      venueAddress: f.venue?.address ?? hallName,
      hallType: "Hall",
      hallCost: num(f.hallCost),
      peopleCount: num(f.people),
      budgetTotal: num(f.budget) || num(f.hallCost),
      budgetSpent: 0,
      specialDemands: f.demand
        .split(/[,\n]/)
        .map((s) => s.trim())
        .filter(Boolean)
        .map((label) => ({ icon: "✨", label })),
      extraActivities: f.activities.map((label) => ({
        icon: extraActivityOptions.find((o) => o.label === label)?.icon ?? "➕",
        label,
        subLabel: f.activityDetails.trim() || undefined,
      })),
      assignedTeamMemberIds: ["aryan"],
      status: "upcoming",
    } as Parameters<typeof addBooking>[0]);
    toast.success("Booking saved ✓");
    navigate({ to: "/day/$date", params: { date: booking.date } });
  }

  const today = format(new Date(), "yyyy-MM-dd");

  return (
    <Screen withNav={false} className="pb-[calc(96px+env(safe-area-inset-bottom))]">
      <TopBar back title="Add New Booking" subtitle={presetDate ? `For ${longDate(presetDate)}` : "Fill in the details to create a new event booking"} />
      <form onSubmit={submit} className="space-y-3 px-4 pt-1" noValidate>
        <Section icon={User} title="Client Details" desc="Enter the client's information">
          <Field label="Client Name" required icon={User} placeholder="e.g. Rohit Sharma" value={f.clientName} onChange={set("clientName")} error={errors.clientName} />
          <Field label="Contact Person" icon={User} placeholder="e.g. Rohit Sharma" value={f.contactPerson} onChange={set("contactPerson")} />
          <Field label="Phone Number" required icon={Phone} type="tel" inputMode="tel" placeholder="e.g. +91 98765 43210" value={f.phone} onChange={set("phone")} error={errors.phone} />
        </Section>

        <Section icon={CalendarDays} title="Event Details" desc="What and when is the event?">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium">Event Type <span className="text-live">*</span></span>
            <span className={`flex h-12 items-center gap-2.5 rounded-xl border bg-elevated-2/70 px-3.5 ${errors.eventType ? "border-live/70" : "border-border"}`}>
              <Sparkles className="h-4 w-4 text-link" />
              <select value={f.eventType} onChange={set("eventType")} className="h-full w-full bg-transparent text-[15px] outline-none [&>option]:bg-elevated">
                <option value="">Select event type</option>
                {eventTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </span>
            {errors.eventType && <span className="mt-1 block text-[12px] text-live">{errors.eventType}</span>}
          </label>
          {!presetDate && <Field label="Date" required icon={CalendarDays} type="date" min={today} value={f.date} onChange={set("date")} error={errors.date} />}
        </Section>

        <Section icon={Briefcase} title="Venue" desc="Where is the event happening?">
          <button type="button" onClick={() => setVenueOpen(true)} className="flex h-14 w-full items-center gap-3 rounded-xl border border-border bg-elevated-2/70 px-3.5 text-left">
            <Briefcase className="h-4 w-4 shrink-0 text-link" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[15px] font-medium">{f.venue ? `${f.venue.name}, ${f.venue.city}` : "Select Venue"}</span>
              <span className="block truncate text-[12px] text-muted-foreground">{f.venue ? f.venue.address : "Choose from saved venues or add new"}</span>
            </span>
            <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
          </button>
        </Section>

        <Section icon={Wallet} title="Budget" desc="Enter the estimated budget for the event">
          <Field label="Estimated Budget" icon={IndianRupee} inputMode="numeric" placeholder="e.g. ₹2,50,000" value={f.budget} onChange={set("budget")} />
        </Section>

        <Section icon={MapPin} title="Hall Details" desc="Details about the venue and capacity">
          <Field label="Place / Hall Name" required icon={MapPin} placeholder="e.g. The Grand Hotel, Delhi" value={f.hallName} onChange={set("hallName")} error={errors.hallName} />
          <Field label="Cost" required icon={IndianRupee} inputMode="numeric" placeholder="e.g. ₹1,50,000" value={f.hallCost} onChange={set("hallCost")} error={errors.hallCost} />
          <Field label="No. of People" required icon={Users} inputMode="numeric" placeholder="e.g. 200" value={f.people} onChange={set("people")} error={errors.people} />
        </Section>

        <Section icon={Pencil} title="Special Demand" desc="Any specific requirements from the client?">
          <label className="block">
            <span className="flex items-start gap-2.5 rounded-xl border border-border bg-elevated-2/70 px-3.5 py-3 focus-within:border-[color:var(--glow)] focus-within:shadow-glow">
              <Pencil className="mt-1 h-4 w-4 shrink-0 text-link" />
              <textarea rows={3} maxLength={600} placeholder="e.g. Balloon decoration, themed setup, specific food arrangement…" value={f.demand} onChange={set("demand")} className="min-h-[72px] w-full resize-y bg-transparent text-[15px] outline-none" />
            </span>
          </label>
        </Section>

        <Section icon={Sparkles} title="Extra Activity" desc="Any additional activity or entertainment?">
          <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
            {extraActivityOptions.map((o) => {
              const active = f.activities.includes(o.label);
              return (
                <Chip key={o.label} active={active} onClick={() => setF((s) => ({ ...s, activities: active ? s.activities.filter((a) => a !== o.label) : [...s.activities, o.label] }))}>
                  <span>{o.icon}</span> {o.label}
                </Chip>
              );
            })}
          </div>
          <Field label="Details" icon={Pencil} placeholder="Add details (e.g. Singer name, time, genre, etc.)" value={f.activityDetails} onChange={set("activityDetails")} />
        </Section>

        <div className="fixed inset-x-0 bottom-0 z-40">
          <div className="mx-auto max-w-[480px] safe-bottom bg-gradient-to-t from-background via-background/95 to-transparent px-4 pb-4 pt-6">
            <GradientButton type="submit">
              <CalendarPlus className="h-4 w-4" /> Save Booking
            </GradientButton>
          </div>
        </div>
      </form>

      <Drawer open={venueOpen} onOpenChange={setVenueOpen}>
        <DrawerContent className="mx-auto max-w-[480px] rounded-t-[20px] border-border bg-elevated">
          <DrawerHeader>
            <DrawerTitle className="font-heading">Select Venue</DrawerTitle>
          </DrawerHeader>
          <ul className="max-h-[60vh] space-y-2 overflow-y-auto px-4 pb-[calc(16px+env(safe-area-inset-bottom))]">
            {savedVenues.map((v) => (
              <li key={v.name}>
                <button
                  type="button"
                  onClick={() => {
                    setF((s) => ({ ...s, venue: v, hallName: s.hallName || `${v.name}, ${v.city}` }));
                    setVenueOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl border border-border bg-elevated-2/60 p-3.5 text-left active:bg-elevated-2"
                >
                  <MapPin className="h-5 w-5 shrink-0 text-link" />
                  <span className="min-w-0">
                    <span className="block text-[15px] font-semibold">{v.name}, {v.city}</span>
                    <span className="block truncate text-[12px] text-muted-foreground">{v.address}</span>
                  </span>
                </button>
              </li>
            ))}
            <li>
              <button type="button" onClick={() => { setF((s) => ({ ...s, venue: null })); setVenueOpen(false); toast("Type the venue in Place / Hall Name below."); }} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-glow/60 text-[14px] font-semibold text-link">
                + Add new venue
              </button>
            </li>
          </ul>
        </DrawerContent>
      </Drawer>
    </Screen>
  );
}

function Section({ icon, title, desc, children }: { icon: LucideIcon; title: string; desc: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader icon={icon} title={title} />
      <p className="-mt-2 mb-3 text-[12px] text-muted-foreground">{desc}</p>
      <div className="space-y-3">{children}</div>
    </Card>
  );
}
