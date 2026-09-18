import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { useState, type FormEvent } from "react";
import logo from "@/assets/logo-mark.png";
import { Field, GradientButton, Screen, TopBar } from "@/components/mantezo/ui";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — Mantezo" },
      { name: "description", content: "Sign in to continue to your Mantezo team account." },
      { property: "og:title", content: "Sign In — Mantezo" },
      { property: "og:description", content: "Sign in to continue to your Mantezo team account." },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<{ email?: string; password?: string }>({});

  function submit(e: FormEvent) {
    e.preventDefault();
    const next: typeof err = {};
    if (!email.trim()) next.email = "Enter your email or username";
    if (!password) next.password = "Enter your password";
    setErr(next);
    if (Object.keys(next).length) return;
    toast.success("Welcome back, Aryan ✓");
    navigate({ to: "/home" });
  }

  return (
    <Screen withNav={false}>
      <TopBar back="/" title="" />
      <form onSubmit={submit} className="flex flex-1 flex-col px-5 pb-8">
        <div className="flex items-center justify-center gap-2 py-2">
          <img src={logo} alt="" width={816} height={816} className="h-12 w-12" />
          <span className="font-heading text-[26px] font-bold">
            Mante<span className="text-gradient-primary">zo</span>
          </span>
        </div>
        <h1 className="mt-8 font-heading text-[24px] font-bold">Welcome Back</h1>
        <p className="mt-1 text-[14px] text-muted-foreground">Sign in to continue to your team account.</p>

        <div className="mt-7 space-y-4">
          <Field label="Email or Username" icon={User} placeholder="you@team.com" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} error={err.email} />
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-foreground/90">Password</span>
            <span className={`flex h-12 items-center gap-2.5 rounded-xl border bg-elevated-2/70 px-3.5 transition focus-within:border-[color:var(--glow)] focus-within:shadow-glow ${err.password ? "border-live/70" : "border-border"}`}>
              <Lock className="h-4 w-4 shrink-0 text-link" />
              <input type={show ? "text" : "password"} autoComplete="current-password" placeholder="Password" className="h-full w-full min-w-0 bg-transparent text-[15px] outline-none" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="button" aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow((s) => !s)} className="tap -mr-2 grid place-items-center text-muted-foreground">
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </span>
            {err.password && <span className="mt-1 block text-[12px] text-live">{err.password}</span>}
          </label>
        </div>

        <div className="mt-4 flex items-center justify-between text-[13px]">
          <label className="flex items-center gap-2 py-2">
            <input type="checkbox" defaultChecked className="h-4 w-4 accent-[oklch(0.58_0.2_265)]" />
            <span className="text-muted-foreground">Remember me</span>
          </label>
          <button type="button" className="py-2 font-medium text-link" onClick={() => toast("Ask your admin to reset your password.")}>
            Forgot password?
          </button>
        </div>

        <div className="mt-6">
          <GradientButton type="submit">Sign In</GradientButton>
        </div>

        <div className="my-6 flex items-center gap-3 text-[12px] text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>

        <button
          type="button"
          onClick={() => {
            toast.success("Signed in with Google ✓");
            navigate({ to: "/home" });
          }}
          className="flex h-12 w-full items-center justify-center gap-3 rounded-[14px] border border-border bg-elevated/80 text-[15px] font-semibold transition active:scale-[0.98]"
        >
          <GoogleG />
          Continue with Google
        </button>

        <p className="mt-auto pt-10 text-center text-[13px] text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/login" className="font-semibold text-link" onClick={() => toast("Team workspaces are created by an admin.")}>
            Create Team
          </Link>
        </p>
      </form>
    </Screen>
  );
}

function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.6 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6C12.2 13.4 17.6 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4 7.1-10 7.1-17.5z" />
      <path fill="#FBBC05" d="M10.4 28.8A14.6 14.6 0 0 1 9.5 24c0-1.7.3-3.3.9-4.8l-7.8-6A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.8-6z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.4 0-11.8-4.3-13.6-10.2l-7.8 6C6.5 42.6 14.6 48 24 48z" />
    </svg>
  );
}
