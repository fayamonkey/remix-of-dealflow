import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Target, TrendingUp, Sparkles, Users, Rocket } from "lucide-react";
import aiaBgDark from "@/assets/aia-bg-dark.png.asset.json";
import aiaBgWarm from "@/assets/aia-bg-dark-warm.png.asset.json";
import aiaBgLight from "@/assets/aia-bg-light.png.asset.json";
import aiaLogoWhite from "@/assets/aia-logo-white.png.asset.json";
import aiaIconGlow from "@/assets/aia-icon-glow.png.asset.json";

function GoldPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#B8A268]/40 bg-[#B8A268]/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#D4BE84]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#D4BE84] animate-pulse" />
      {children}
    </span>
  );
}

const MANIFESTO = [
  { k: "Decide", v: "The best sales tool in the world can't save an undecided mind. Decide to win first — the CRM is just where you keep score." },
  { k: "Execute", v: "Massive action beats perfect strategy. Every day. Log the call. Move the deal. Send the follow-up. Stack the reps." },
  { k: "Compound", v: "Small daily wins, tracked and repeated, become an unfair advantage. This is where you build yours." },
];

const PRINCIPLES = [
  {
    icon: Target,
    title: "Clarity is power.",
    body: "One pipeline. Every deal. Zero guesswork. See exactly where your money lives and what moves it forward.",
  },
  {
    icon: Zap,
    title: "Speed is a decision.",
    body: "Log an activity in seconds. Update a stage with one drag. The friction is gone — so you can finally move at the speed of your ambition.",
  },
  {
    icon: TrendingUp,
    title: "Momentum is math.",
    body: "Track velocity, win rates, and forecast with weighted probability. What gets measured gets multiplied.",
  },
  {
    icon: Users,
    title: "Your tribe, aligned.",
    body: "Everyone sees the same board. No one drops the ball. The team stops managing and starts closing.",
  },
  {
    icon: Rocket,
    title: "Ship in an afternoon.",
    body: "Remix the template. Brand it. Deploy it. You'll be tracking real deals before your competitor books their kickoff call.",
  },
  {
    icon: Sparkles,
    title: "Built for builders.",
    body: "Part of the AI Advantage stack. Plug it into your agents, your workflows, your empire. You own it.",
  },
];

export default function Landing() {
  const { session, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!loading && session) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-[#0a0906] text-white antialiased selection:bg-[#B8A268]/40 selection:text-white">
      {/* ─── Sticky nav ─── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 lg:px-20 transition-all duration-300 ${
          scrolled ? "bg-[#0a0906]/85 backdrop-blur-md border-b border-white/5" : ""
        }`}
      >
        <div className="flex items-center gap-2.5">
          <img src={aiaIconGlow.url} alt="" className="h-8 w-8 drop-shadow-[0_0_20px_rgba(184,162,104,0.6)]" />
          <img src={aiaLogoWhite.url} alt="AI Advantage" className="h-4 opacity-95" />
          <span className="ml-1.5 hidden sm:inline-flex items-center rounded-full border border-[#B8A268]/40 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-[#D4BE84]">
            CRM
          </span>
        </div>
        <div className="flex items-center gap-2">
          <a href="https://aiadvantage.com" target="_blank" rel="noreferrer" className="hidden md:block">
            <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/5">
              aiadvantage.com
            </Button>
          </a>
          <Link to="/auth">
            <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/5">
              Sign in
            </Button>
          </Link>
          <Link to="/auth">
            <Button size="sm" className="rounded-full bg-[#B8A268] text-black hover:bg-[#D4BE84] font-semibold px-5">
              Claim yours
            </Button>
          </Link>
        </div>
      </nav>

      {/* ─── AGENTHUB MODULARITY STRIP ─── */}
      <div className="fixed top-[72px] left-0 right-0 z-40 px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-5xl rounded-xl border border-[#B8A268]/20 bg-[#0a0906]/90 backdrop-blur-md px-5 py-3 shadow-[0_0_40px_rgba(184,162,104,0.08)]">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#B8A268]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#D4BE84]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D4BE84] animate-pulse" />
              AgentHub Modularity
            </span>
            <p className="text-sm text-white/70">
              Run this CRM standalone — or plug it into your AgentHub for one connected advantage.
            </p>
          </div>
        </div>
      </div>

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <img
          src={aiaBgDark.url}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0906]/70 via-[#0a0906]/50 to-[#0a0906]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(184,162,104,0.15),transparent_60%)]" />

        <div className="relative z-10 w-full px-6 md:px-12 lg:px-20 pt-32 pb-24">
          <div className="max-w-5xl mx-auto text-center">
            <div className="flex justify-center mb-8">
              <GoldPill>The AI Advantage CRM</GoldPill>
            </div>

            <h1 className="font-sans font-bold tracking-tight leading-[0.95] mb-8">
              <span className="block text-5xl md:text-7xl lg:text-[92px] text-white">
                Where champions
              </span>
              <span className="block text-5xl md:text-7xl lg:text-[92px] bg-gradient-to-r from-[#D4BE84] via-[#F5E6B8] to-[#B8A268] bg-clip-text text-transparent italic">
                keep score.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed text-balance">
              The average salesperson tracks deals in their head — and loses them there. You're not average.
              This is your command center. Built for the AI Advantage community. Owned by you.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/auth">
                <Button
                  size="lg"
                  className="rounded-full bg-[#B8A268] text-black hover:bg-[#D4BE84] text-base font-semibold px-8 h-13 shadow-[0_0_40px_rgba(184,162,104,0.3)] transition-all hover:shadow-[0_0_60px_rgba(184,162,104,0.5)] hover:scale-[1.02]"
                >
                  Start your advantage
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <a href="https://aiadvantage.com" target="_blank" rel="noreferrer">
                <Button
                  size="lg"
                  variant="ghost"
                  className="rounded-full text-base text-white/80 hover:text-white hover:bg-white/5 px-6 h-13"
                >
                  Join the community
                </Button>
              </a>
            </div>

            {/* Floating stats bar */}
            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {[
                { n: "5 min", l: "To go live" },
                { n: "0", l: "Consultants needed" },
                { n: "100%", l: "Yours to own" },
                { n: "∞", l: "Deals to close" },
              ].map((s) => (
                <div key={s.l} className="text-center">
                  <div className="font-sans text-2xl md:text-3xl font-bold text-[#D4BE84] mb-1">{s.n}</div>
                  <div className="text-[11px] uppercase tracking-widest text-white/50">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0906] to-transparent pointer-events-none" />
      </section>

      {/* ─── MANIFESTO ─── */}
      <section className="relative py-28 md:py-40 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(184,162,104,0.06),transparent_70%)]" />
        <div className="relative max-w-5xl mx-auto px-6 md:px-12 lg:px-20 text-center">
          <div className="flex justify-center mb-8">
            <GoldPill>The Manifesto</GoldPill>
          </div>
          <h2 className="font-sans text-4xl md:text-6xl font-bold tracking-tight leading-[1.05] mb-6 text-balance">
            A CRM is a tool.<br />
            <span className="text-white/40">A decision is a weapon.</span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto mb-20 leading-relaxed">
            Success in sales isn't a software problem. It's a standards problem. Raise your standards.
            Track everything. Follow up like a professional. This CRM is where those decisions get real.
          </p>

          <div className="grid md:grid-cols-3 gap-6 text-left">
            {MANIFESTO.map((m, i) => (
              <div
                key={m.k}
                className="group relative rounded-2xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-sm hover:border-[#B8A268]/30 hover:bg-[#B8A268]/[0.03] transition-all"
              >
                <div className="font-sans text-6xl font-bold text-[#B8A268]/20 mb-4 leading-none">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="font-sans text-2xl font-bold mb-3 text-[#D4BE84]">{m.k}.</h3>
                <p className="text-white/60 leading-relaxed text-[15px]">{m.v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRINCIPLES / FEATURES ─── */}
      <section className="relative py-28 md:py-36 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="max-w-3xl mb-20">
            <GoldPill>What you get</GoldPill>
            <h2 className="font-sans text-4xl md:text-6xl font-bold tracking-tight leading-[1.05] mt-6 text-balance">
              Six principles.<br />
              <span className="bg-gradient-to-r from-[#D4BE84] to-[#B8A268] bg-clip-text text-transparent italic">One unfair advantage.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 rounded-3xl overflow-hidden border border-white/5">
            {PRINCIPLES.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="group relative bg-[#0a0906] p-10 hover:bg-[#B8A268]/[0.04] transition-all duration-300"
              >
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#B8A268]/10 border border-[#B8A268]/20 text-[#D4BE84] group-hover:bg-[#B8A268]/20 group-hover:scale-110 transition-all">
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </div>
                <h3 className="font-sans text-2xl font-bold mb-3 tracking-tight">{title}</h3>
                <p className="text-white/60 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── QUOTE / EMPOWERMENT ─── */}
      <section className="relative py-32 md:py-44 overflow-hidden">
        <img src={aiaBgWarm.url} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0906] via-[#0a0906]/60 to-[#0a0906]" />
        <div className="relative max-w-4xl mx-auto px-6 md:px-12 lg:px-20 text-center">
          <div className="text-[#B8A268]/40 text-8xl font-serif leading-none mb-4">"</div>
          <p className="font-sans text-3xl md:text-5xl font-bold tracking-tight leading-[1.15] mb-10 text-balance">
            You don't rise to the level of your goals.<br />
            <span className="text-[#D4BE84] italic">You fall to the level of your systems.</span>
          </p>
          <p className="text-white/50 uppercase tracking-[0.2em] text-xs">
            This is that system.
          </p>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="relative py-32 md:py-44 overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(184,162,104,0.15),transparent_70%)]" />
        <div className="relative max-w-4xl mx-auto px-6 md:px-12 lg:px-20 text-center">
          <img
            src={aiaIconGlow.url}
            alt=""
            aria-hidden
            className="h-20 w-20 mx-auto mb-8 drop-shadow-[0_0_60px_rgba(184,162,104,0.7)] animate-pulse"
            style={{ animationDuration: "3s" }}
          />
          <h2 className="font-sans text-5xl md:text-7xl font-bold tracking-tight leading-[0.95] mb-8 text-balance">
            The gap between<br />
            <span className="text-white/40">who you are</span> and{" "}
            <span className="bg-gradient-to-r from-[#D4BE84] via-[#F5E6B8] to-[#B8A268] bg-clip-text text-transparent italic">
              who you could be
            </span>
            <br />
            is closed one deal at a time.
          </h2>
          <p className="text-lg text-white/60 max-w-xl mx-auto mb-10">
            Stop losing deals in your inbox. Start closing them here.
          </p>
          <Link to="/auth">
            <Button
              size="lg"
              className="rounded-full bg-[#B8A268] text-black hover:bg-[#D4BE84] text-base font-bold px-10 h-14 shadow-[0_0_60px_rgba(184,162,104,0.4)] hover:shadow-[0_0_80px_rgba(184,162,104,0.6)] hover:scale-[1.03] transition-all"
            >
              Claim your advantage
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
          <p className="mt-6 text-xs uppercase tracking-widest text-white/40">
            Free · Yours forever · Ready in 5 minutes
          </p>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/5 bg-black px-6 md:px-12 lg:px-20 py-14">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-10">
            <div className="flex items-center gap-2.5">
              <img src={aiaIconGlow.url} alt="" className="h-8 w-8" />
              <img src={aiaLogoWhite.url} alt="AI Advantage" className="h-4" />
              <span className="ml-1.5 inline-flex items-center rounded-full border border-[#B8A268]/30 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-[#D4BE84]">
                CRM
              </span>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-white/50">
              <a href="https://aiadvantage.com" target="_blank" rel="noreferrer" className="hover:text-[#D4BE84] transition-colors">
                aiadvantage.com
              </a>
              <a href="https://aiadvantage.com/community" target="_blank" rel="noreferrer" className="hover:text-[#D4BE84] transition-colors">
                Community
              </a>
              <Link to="/auth" className="hover:text-[#D4BE84] transition-colors">
                Sign in
              </Link>
              <a href="mailto:hello@aiadvantage.com" className="hover:text-[#D4BE84] transition-colors">
                Contact
              </a>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <p className="text-xs text-white/40 max-w-lg leading-relaxed">
              The AI Advantage CRM is part of the AI Advantage app collection — a growing toolkit for the community. Remix it, brand it, own it.
            </p>
            <p className="text-xs text-white/30">© {new Date().getFullYear()} AI Advantage. Your unfair advantage.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
