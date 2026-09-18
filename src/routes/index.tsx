import { createFileRoute, Link } from "@tanstack/react-router";
import logo from "@/assets/logo-mark.png";
import { GradientLink, Screen } from "@/components/mantezo/ui";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mantezo — Plan · Manage · Execute" },
      { name: "description", content: "Event management, made for your team. One shared calendar of truth for every booking." },
      { property: "og:title", content: "Mantezo — Plan · Manage · Execute" },
      { property: "og:description", content: "Event management, made for your team." },
    ],
  }),
  component: Splash,
});

function Splash() {
  return (
    <Screen withNav={false} className="justify-between px-6 py-10">
      <div />
      <div className="flex flex-col items-center text-center">
        <img src={logo} alt="Mantezo logo" width={816} height={816} className="h-36 w-36 animate-float-glow" />
        <h1 className="mt-4 font-heading text-[34px] font-bold tracking-tight">
          Mante<span className="text-gradient-primary">zo</span>
        </h1>
        <p className="mt-2 text-[14px] tracking-[0.18em] text-muted-foreground">
          Plan <span className="mx-2">·</span> Manage <span className="mx-2">·</span> Execute
        </p>
        <p className="mt-10 max-w-[240px] text-[16px] leading-relaxed text-foreground/85">
          Event management,
          <br />
          made for your team.
        </p>
      </div>
      <div className="w-full safe-bottom">
        <GradientLink to="/login">Get Started</GradientLink>
        <p className="mt-5 text-center text-[13px] text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-link">
            Sign In
          </Link>
        </p>
      </div>
    </Screen>
  );
}
