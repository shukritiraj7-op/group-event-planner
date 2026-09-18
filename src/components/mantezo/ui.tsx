import { Link, type LinkProps } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, ChevronRight, Home, Users, CalendarDays, CheckSquare, MoreHorizontal, Plus, type LucideIcon } from "lucide-react";
import type { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import type { TeamMember } from "@/lib/types";

/* ---------- Layout ---------- */

export function Screen({ children, className, withNav = true }: { children: ReactNode; className?: string; withNav?: boolean }) {
  return (
    <div className="min-h-dvh">
      <div className={cn("relative mx-auto flex min-h-dvh w-full max-w-[480px] flex-col", withNav ? "pb-[calc(88px+env(safe-area-inset-bottom))]" : "", className)}>
        {children}
      </div>
    </div>
  );
}

export function TopBar({
  title,
  subtitle,
  back,
  right,
  left,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  back?: LinkProps["to"] | true;
  right?: ReactNode;
  left?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-30 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 bg-background/80 px-4 py-3 backdrop-blur-md">
      <div className="flex min-w-0 items-center gap-3">
        {back && (
          <BackButton to={back === true ? undefined : back} />
        )}
        {left}
        <div className="min-w-0">
          <h1 className="truncate font-heading text-[19px] font-bold leading-tight">{title}</h1>
          {subtitle && <p className="truncate text-[13px] text-link/90">{subtitle}</p>}
        </div>
      </div>
      {right && <div className="flex shrink-0 items-center gap-2">{right}</div>}
    </header>
  );
}

function BackButton({ to }: { to?: LinkProps["to"] }) {
  const cls = "tap grid h-11 w-11 shrink-0 place-items-center rounded-full bg-elevated/70 border border-border text-foreground active:scale-95 transition";
  if (to) {
    return (
      <Link to={to} aria-label="Back" className={cls}>
        <ArrowLeft className="h-5 w-5" />
      </Link>
    );
  }
  return (
    <button type="button" aria-label="Back" className={cls} onClick={() => window.history.back()}>
      <ArrowLeft className="h-5 w-5" />
    </button>
  );
}

export function IconButton({ icon: Icon, label, className, ...rest }: { icon: LucideIcon; label: string } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" aria-label={label} className={cn("tap relative grid h-11 w-11 place-items-center rounded-full border border-border bg-elevated/70 text-foreground transition active:scale-95", className)} {...rest}>
      <Icon className="h-5 w-5" />
    </button>
  );
}

/* ---------- Bottom nav ---------- */

const navItems = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/team", label: "Team", icon: Users },
  { to: "/bookings", label: "Bookings", icon: CalendarDays },
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/settings", label: "More", icon: MoreHorizontal },
] as const;

export function BottomNav() {
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40">
      <div className="mx-auto max-w-[480px] safe-bottom border-t border-border bg-elevated/90 backdrop-blur-xl">
        <ul className="grid h-[68px] grid-cols-5">
          {navItems.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <Link
                to={to}
                className="tap group flex h-full flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground"
                activeProps={{ className: "text-foreground" }}
              >
                {({ isActive }) => (
                  <>
                    <span className={cn("grid h-8 w-12 place-items-center rounded-full transition", isActive && "bg-badge")}>
                      <Icon className={cn("h-[22px] w-[22px]", isActive && "text-link")} strokeWidth={isActive ? 2.4 : 1.8} />
                    </span>
                    {label}
                  </>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export function Fab({ date, label = "Add booking" }: { date?: string; label?: string }) {
  return (
    <Link
      to="/booking/new"
      search={date ? { date } : {}}
      aria-label={label}
      className="fixed bottom-[calc(88px+env(safe-area-inset-bottom))] right-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-gradient-primary text-primary-foreground shadow-glow-lg transition active:scale-95 sm:right-[calc(50%-240px+16px)]"
    >
      <Plus className="h-7 w-7" />
    </Link>
  );
}

/* ---------- Surfaces ---------- */

export function Card({ children, className, glow }: { children: ReactNode; className?: string; glow?: boolean }) {
  return <div className={cn("rounded-2xl border border-border bg-elevated/80 p-4", glow && "border-glow", className)}>{children}</div>;
}

export function CardHeader({ icon: Icon, title, action }: { icon: LucideIcon; title: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <IconBadge icon={Icon} size="sm" />
        <h2 className="truncate font-heading text-[16px] font-semibold">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function IconBadge({ icon: Icon, size = "md", className }: { icon: LucideIcon; size?: "sm" | "md" | "lg"; className?: string }) {
  const s = size === "sm" ? "h-8 w-8 [&>svg]:h-4 [&>svg]:w-4" : size === "lg" ? "h-14 w-14 [&>svg]:h-7 [&>svg]:w-7" : "h-11 w-11 [&>svg]:h-5 [&>svg]:w-5";
  return (
    <span className={cn("grid shrink-0 place-items-center rounded-full bg-badge text-link", s, className)}>
      <Icon />
    </span>
  );
}

export function StatusDot({ kind, className }: { kind: "live" | "online" | "offline"; className?: string }) {
  const c = kind === "live" ? "bg-live shadow-[0_0_8px_var(--live)]" : kind === "online" ? "bg-online" : "border border-offline bg-transparent";
  return <span aria-hidden className={cn("inline-block h-2 w-2 shrink-0 rounded-full", c, className)} />;
}

export function Avatar({ member, size = 36, className }: { member: TeamMember; size?: number; className?: string }) {
  return (
    <span
      className={cn("grid shrink-0 place-items-center rounded-full font-heading font-semibold text-primary-foreground ring-2 ring-elevated", className)}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        background: `linear-gradient(135deg, oklch(0.62 0.18 ${member.hue}), oklch(0.5 0.2 ${member.hue + 40}))`,
      }}
      aria-label={member.name}
    >
      {member.name[0]}
    </span>
  );
}

export function AvatarStack({ members, max = 3 }: { members: TeamMember[]; max?: number }) {
  const shown = members.slice(0, max);
  const rest = members.length - shown.length;
  return (
    <div className="flex items-center">
      {shown.map((m, i) => (
        <Avatar key={m.id} member={m} size={30} className={i > 0 ? "-ml-2" : ""} />
      ))}
      {rest > 0 && (
        <span className="-ml-2 grid h-[30px] w-[30px] place-items-center rounded-full bg-elevated-2 text-[11px] font-semibold ring-2 ring-elevated">+{rest}</span>
      )}
    </div>
  );
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-elevated-2" role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full bg-gradient-primary" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

/* ---------- Controls ---------- */

export function GradientButton({ children, className, arrow = true, ...rest }: { arrow?: boolean } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn("flex h-[52px] w-full items-center justify-center gap-2 rounded-[14px] bg-gradient-primary px-5 font-heading text-[15px] font-semibold text-primary-foreground shadow-glow transition active:scale-[0.98] disabled:opacity-60", className)}
      {...rest}
    >
      {children}
      {arrow && <ArrowRight className="h-4 w-4" />}
    </button>
  );
}

export function GradientLink({ children, className, arrow = true, ...rest }: { children: ReactNode; className?: string; arrow?: boolean } & LinkProps) {
  return (
    <Link
      className={cn("flex h-[52px] w-full items-center justify-center gap-2 rounded-[14px] bg-gradient-primary px-5 font-heading text-[15px] font-semibold text-primary-foreground shadow-glow transition active:scale-[0.98]", className)}
      {...rest}
    >
      {children}
      {arrow && <ArrowRight className="h-4 w-4" />}
    </Link>
  );
}

export function OutlineLink({ children, className, ...rest }: { children: ReactNode; className?: string } & LinkProps) {
  return (
    <Link
      className={cn("inline-flex h-12 items-center justify-center gap-2 rounded-[14px] border border-glow bg-transparent px-5 font-heading text-[15px] font-semibold text-foreground shadow-glow transition active:scale-[0.98]", className)}
      {...rest}
    >
      {children}
    </Link>
  );
}

export function TextLink({ children, className, ...rest }: { children: ReactNode; className?: string } & LinkProps) {
  return (
    <Link className={cn("tap inline-flex items-center gap-1 text-[13px] font-medium text-link", className)} {...rest}>
      {children}
    </Link>
  );
}

export function Segmented<T extends string>({ options, value, onChange }: { options: readonly T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div role="tablist" className="grid gap-1 rounded-full border border-border bg-elevated/70 p-1" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0,1fr))` }}>
      {options.map((o) => (
        <button
          key={o}
          role="tab"
          type="button"
          aria-selected={value === o}
          onClick={() => onChange(o)}
          className={cn("h-10 truncate rounded-full px-3 text-[13px] font-semibold transition", value === o ? "bg-gradient-primary text-primary-foreground shadow-glow" : "text-muted-foreground")}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export function Chip({ active, children, className, ...rest }: { active?: boolean } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn("inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 text-[13px] font-semibold transition", active ? "border-transparent bg-gradient-primary text-primary-foreground shadow-glow" : "border-glow/60 border-[color:var(--glow)] bg-elevated/60 text-foreground", className)}
      {...rest}
    >
      {children}
    </button>
  );
}

export function TagChip({ icon, label, subLabel }: { icon: string; label: string; subLabel?: string }) {
  return (
    <div className="flex shrink-0 items-center gap-2.5 rounded-full border border-border bg-elevated-2/60 py-2 pl-2 pr-4">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-badge text-base">{icon}</span>
      <div className="min-w-0">
        <p className="text-[13px] font-semibold leading-tight">{label}</p>
        {subLabel && <p className="text-[11px] leading-tight text-muted-foreground">({subLabel})</p>}
      </div>
    </div>
  );
}

export function ListRow({ icon, title, subtitle, to, right, onClick }: { icon: LucideIcon; title: ReactNode; subtitle?: ReactNode; to?: LinkProps["to"]; right?: ReactNode; onClick?: () => void }) {
  const inner = (
    <>
      <IconBadge icon={icon} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold">{title}</p>
        {subtitle && <p className="truncate text-[13px] text-muted-foreground">{subtitle}</p>}
      </div>
      {right ?? <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />}
    </>
  );
  const cls = "flex w-full items-center gap-3 rounded-2xl border border-border bg-elevated/80 p-3.5 text-left transition active:bg-elevated-2";
  if (to) return <Link to={to} className={cls}>{inner}</Link>;
  return <button type="button" onClick={onClick} className={cls}>{inner}</button>;
}

/* ---------- Form ---------- */

export function Field({ label, required, icon: Icon, error, hint, ...rest }: { label: string; required?: boolean; icon?: LucideIcon; error?: string; hint?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-foreground/90">
        {label} {required && <span className="text-live">*</span>}
      </span>
      <span className={cn("flex h-12 items-center gap-2.5 rounded-xl border bg-elevated-2/70 px-3.5 transition focus-within:border-[color:var(--glow)] focus-within:shadow-glow", error ? "border-live/70" : "border-border")}>
        {Icon && <Icon className="h-4 w-4 shrink-0 text-link" />}
        <input className="h-full w-full min-w-0 bg-transparent text-[15px] text-foreground outline-none" {...rest} />
      </span>
      {error ? <span className="mt-1 block text-[12px] text-live">{error}</span> : hint ? <span className="mt-1 block text-[12px] text-muted-foreground">{hint}</span> : null}
    </label>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="font-heading text-[16px] font-semibold">{children}</h2>
      {action}
    </div>
  );
}
