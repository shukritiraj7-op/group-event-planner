import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { Briefcase, CalendarDays, CalendarPlus, IndianRupee, MapPin, Pencil, Phone, Sparkles, User, Users, Wallet } from "lucide-react";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Card, CardHeader, Chip, Field, GradientButton, Screen, TopBar } from "@/components/mantezo/ui";
import { eventTypes, extraActivityOptions } from "@/lib/data";
import { useStore } from "@/lib/store";
import { inr, longDate } from "@/lib/format";
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
  venueText: z.string().trim().min(1, "Venue is required").max(300),
  hallName: z.string().trim().min(1, "Place / Hall name is required").max(120),
  hallCost: z.string().trim().min(1, "Cost is required"),
  people: z.string().trim().min(1, "No. of people is required"),
});

function NewBooking() {
  const { date: presetDate } = Route.useSearch();
  const navigate = useNavigate();
  const { addBooking, venues } = useStore();

  const [f, setF] = useState({
    clientName: "",
    contactPerson: "",
    phone: "",
    eventType: "",
    date: presetDate ?? "",
    venueText: "",
    advancePayment: "",
    totalBudget: "",
    hallName: "",
    hallCost: "",
    people: "",
    demand: "",
    activities: [] as string[],
    activityDetails: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDropdown, setShowDropdown] = useState(false);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((s) => ({ ...s, [k]: e.target.value }));

  function selectVenue(v: { name: string; city: string; address: string }) {
    const fullText = v.address || `${v.name}, ${v.city}`;
    setF((s) => ({
      ...s,
      venueText: fullText,
      hallName: s.hallName || v.name,
    }));
    setShowDropdown(false);
    toast.success(`Selected "${v.name}"`);
  }

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
    const venueText = f.venueText.trim();
    const parts = venueText.split(",").map((s) => s.trim()).filter(Boolean);
    const vName = parts[0] || venueText;
    const vCity = parts.length > 1 ? parts[parts.length - 1] : "";

    const hallName = f.hallName.trim() || vName;

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
      venueName: vName,
      venueCity: vCity || "Local",
      venueAddress: venueText,
      hallType: "Hall",
      hallCost: num(f.hallCost),
      peopleCount: num(f.people),
      budgetTotal: num(f.totalBudget) || num(f.hallCost),
      budgetSpent: num(f.advancePayment),
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

  const matchingVenues = f.venueText
    ? venues.filter(
        (v) =>
          v.name.toLowerCase().includes(f.venueText.toLowerCase()) ||
          v.address.toLowerCase().includes(f.venueText.toLowerCase()) ||
          v.city.toLowerCase().includes(f.venueText.toLowerCase())
      )
    : venues;

  return (
    <Screen withNav={false} className="pb-[calc(96px+env(safe-area-inset-bottom))]">
      <TopBar back title="Add New Booking" subtitle={presetDate ? `For ${longDate(presetDate)}` : "Fill in the details to create a new event booking"} />
      <form onSubmit={submit} className="space-y-3 px-4 pt-1" noValidate>
        <Section icon={User} title="Client Details" desc="Enter the client's information">
          <Field label="Client Name" required icon={User} placeholder="e.g. Rohit Sharma" value={f.clientName} onChange={set("clientName")} error={errors["clientName"]} />
          <Field label="Contact Person" icon={User} placeholder="e.g. Rohit Sharma" value={f.contactPerson} onChange={set("contactPerson")} />
          <Field label="Phone Number" required icon={Phone} type="tel" inputMode="tel" placeholder="e.g. +91 98765 43210" value={f.phone} onChange={set("phone")} error={errors["phone"]} />
        </Section>

        <Section icon={CalendarDays} title="Event Details" desc="What and when is the event?">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium">Event Type <span className="text-live">*</span></span>
            <span className={`flex h-12 items-center gap-2.5 rounded-xl border bg-elevated-2/70 px-3.5 ${errors["eventType"] ? "border-live/70" : "border-border"}`}>
              <Sparkles className="h-4 w-4 text-link" />
              <select value={f.eventType} onChange={set("eventType")} className="h-full w-full bg-transparent text-[15px] outline-none [&>option]:bg-elevated">
                <option value="">Select event type</option>
                {eventTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </span>
            {errors["eventType"] && <span className="mt-1 block text-[12px] text-live">{errors["eventType"]}</span>}
          </label>
          {!presetDate && <Field label="Date" required icon={CalendarDays} type="date" min={today} value={f.date} onChange={set("date")} error={errors["date"]} />}
        </Section>

        <Section icon={Briefcase} title="Venue" desc="Where is the event happening? Write below or pick a saved venue">
          {/* Saved Venues Dropdown & Chips */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-muted-foreground">Saved Venues (Suggestions):</span>
              <button
                type="button"
                onClick={() => setShowDropdown((s) => !s)}
                className="text-[12px] font-semibold text-link hover:underline"
              >
                {showDropdown ? "Hide Suggestions" : "View All Saved Venues ▼"}
              </button>
            </div>

            {/* Quick Horizontal Chips */}
            <div className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {venues.map((v) => {
                const fullText = v.address || `${v.name}, ${v.city}`;
                const active = f.venueText === fullText;
                return (
                  <button
                    key={v.name}
                    type="button"
                    onClick={() => selectVenue(v)}
                    className={`tap shrink-0 rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-all ${
                      active
                        ? "border-glow bg-glow/20 text-link font-semibold shadow-glow"
                        : "border-border bg-elevated-2/70 text-foreground hover:bg-elevated-2"
                    }`}
                  >
                    📍 {v.name} <span className="opacity-70">({v.city})</span>
                  </button>
                );
              })}
            </div>

            {/* Expanded Dropdown Suggestions List if toggled */}
            {showDropdown && matchingVenues.length > 0 && (
              <ul className="max-h-48 space-y-1.5 overflow-y-auto rounded-xl border border-border bg-elevated-2/90 p-2 shadow-lg">
                {matchingVenues.map((v) => (
                  <li key={v.name}>
                    <button
                      type="button"
                      onClick={() => selectVenue(v)}
                      className="flex w-full items-center gap-2.5 rounded-lg p-2 text-left hover:bg-elevated/80"
                    >
                      <MapPin className="h-4 w-4 shrink-0 text-link" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold">{v.name}, {v.city}</p>
                        <p className="truncate text-[11px] text-muted-foreground">{v.address}</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* Venue Textarea Input */}
            <label className="block pt-1">
              <span className="mb-1.5 block text-[13px] font-medium">
                Venue Name & Address <span className="text-live">*</span>
              </span>
              <span className={`flex items-start gap-2.5 rounded-xl border bg-elevated-2/70 px-3.5 py-3 focus-within:border-[color:var(--glow)] focus-within:shadow-glow ${errors["venueText"] ? "border-live/70" : "border-border"}`}>
                <Briefcase className="mt-1 h-4 w-4 shrink-0 text-link" />
                <textarea
                  rows={3}
                  maxLength={500}
                  placeholder="Type venue details (e.g. The Grand Hotel, Connaught Place, New Delhi)..."
                  value={f.venueText}
                  onChange={set("venueText")}
                  className="min-h-[72px] w-full resize-y bg-transparent text-[15px] outline-none"
                />
              </span>
              {errors["venueText"] && <span className="mt-1 block text-[12px] text-live">{errors["venueText"]}</span>}
              <p className="mt-1 text-[11px] text-muted-foreground">
                💾 Write a new venue here and save. It will automatically be saved as a suggestion for future bookings!
              </p>
            </label>
          </div>
        </Section>

        <Section icon={Wallet} title="Budget" desc="Enter advance payment and total estimated budget">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field
              label="1. Advance Payment"
              icon={IndianRupee}
              inputMode="numeric"
              placeholder="e.g. ₹50,000"
              value={f.advancePayment}
              onChange={set("advancePayment")}
              hint="Initial advance paid by client"
            />
            <Field
              label="2. Total Budget"
              icon={IndianRupee}
              inputMode="numeric"
              placeholder="e.g. ₹2,50,000"
              value={f.totalBudget}
              onChange={set("totalBudget")}
              hint="Total budget for the event"
            />
          </div>
          {(Boolean(f.totalBudget) || Boolean(f.advancePayment)) && (
            <div className="mt-2 flex items-center justify-between rounded-xl border border-border bg-elevated-2/60 px-3.5 py-2.5 text-[13px]">
              <span className="text-muted-foreground font-medium">Remaining Balance:</span>
              <span className="font-semibold text-link font-heading text-[15px]">
                {inr(Math.max(0, num(f.totalBudget) - num(f.advancePayment)))}
              </span>
            </div>
          )}
        </Section>

        <Section icon={MapPin} title="Hall Details" desc="Details about the venue and capacity">
          <Field label="Place / Hall Name" required icon={MapPin} placeholder="e.g. The Grand Hotel, Delhi" value={f.hallName} onChange={set("hallName")} error={errors["hallName"]} />
          <Field label="Cost" required icon={IndianRupee} inputMode="numeric" placeholder="e.g. ₹1,50,000" value={f.hallCost} onChange={set("hallCost")} error={errors["hallCost"]} />
          <Field label="No. of People" required icon={Users} inputMode="numeric" placeholder="e.g. 200" value={f.people} onChange={set("people")} error={errors["people"]} />
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
