"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { useWorkspaceData } from "@/components/providers/workspace-data-provider";
import { InlineMessage } from "@/components/ui/inline-message";
import { PageIntro } from "@/components/ui/page-intro";
import { SectionCard } from "@/components/ui/section-card";

type AuthTab = "sign-in" | "sign-up" | "magic-link";

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthPageContent initialMessage="" />}>
      <AuthPageInner />
    </Suspense>
  );
}

function AuthPageInner() {
  const searchParams = useSearchParams();
  return <AuthPageContent initialMessage={searchParams.get("error") ?? ""} />;
}

function AuthPageContent({ initialMessage }: { initialMessage: string }) {
  const router = useRouter();
  const {
    authReady,
    mode,
    sendMagicLink,
    signInWithPassword,
    signOut,
    signUpWithPassword,
    supabaseConfigured,
    user,
  } = useWorkspaceData();
  const [tab, setTab] = useState<AuthTab>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(initialMessage);

  async function handlePasswordSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      await signInWithPassword({ email, password });
      router.push("/dashboard");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Sign in could not be completed right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePasswordSignUp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      await signUpWithPassword({ email, password });
      setMessage("Account created. Check your email if Supabase confirmation is enabled.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Account setup could not be completed right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleMagicLink(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      await sendMagicLink(email);
      setMessage("Magic link sent. Check your email to continue into YardBrief.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Magic link could not be sent right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSignOut() {
    setIsSubmitting(true);
    setMessage("");

    try {
      await signOut();
      setMessage("Signed out. Demo mode is still available locally.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Sign out could not be completed right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Authentication"
        title="Sign in when you want Supabase sync, or keep using demo mode."
        description="YardBrief stays fully usable in local demo mode. Supabase only takes over after you choose to sign in."
        highlights={[
          "Email/password or magic link",
          "Demo mode stays available",
          "Local data syncs after sign-in",
        ]}
        actions={
          <Link
            href="/dashboard"
            className="yb-button yb-button-secondary"
          >
            Continue in Demo Mode
          </Link>
        }
      />

      {message ? (
        <InlineMessage
          tone={
            message.toLowerCase().includes("error") || message.toLowerCase().includes("could not")
              ? "error"
              : "success"
          }
          title="Authentication message"
        >
          {message}
        </InlineMessage>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1fr,0.96fr]">
        <SectionCard>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone">
            Supabase access
          </p>

          {!supabaseConfigured ? (
            <div className="mt-5 rounded-[1.6rem] border border-dashed border-charcoal/14 bg-beige/45 px-5 py-5">
              <p className="text-base font-semibold text-charcoal">Supabase is not configured yet.</p>
              <p className="mt-3 text-sm leading-7 text-stone">
                Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> to enable email/password and magic-link sign-in.
              </p>
            </div>
          ) : mode === "cloud" && user ? (
            <div className="mt-5 space-y-4">
              <div className="rounded-[1.6rem] border border-charcoal/8 bg-beige/45 px-5 py-5">
                <p className="text-base font-semibold text-charcoal">You are signed in.</p>
                <p className="mt-2 text-sm leading-7 text-stone">
                  Supabase is active for <span className="font-semibold text-charcoal">{user.email}</span>.
                  Local demo mode still returns when you sign out.
                </p>
              </div>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSignOut}
                className="yb-button yb-button-primary"
              >
                {isSubmitting ? "Signing out..." : "Sign Out"}
              </button>
            </div>
          ) : (
            <div className="mt-5 space-y-5">
              <div className="flex flex-wrap gap-3">
                {[
                  ["sign-in", "Sign in"],
                  ["sign-up", "Create account"],
                  ["magic-link", "Magic link"],
                ].map(([value, label]) => {
                  const active = tab === value;

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setTab(value as AuthTab)}
                      className={
                        active
                          ? "yb-button yb-button-primary px-4 py-2 text-sm"
                          : "yb-button yb-button-secondary px-4 py-2 text-sm"
                      }
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {tab === "sign-in" ? (
                <form className="space-y-4" onSubmit={handlePasswordSignIn}>
                  <label className="block">
                    <span className="text-sm font-semibold text-charcoal">Email</span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="yb-field mt-2"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold text-charcoal">Password</span>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="yb-field mt-2"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={!authReady || isSubmitting}
                    className="yb-button yb-button-primary"
                  >
                    {isSubmitting ? "Signing in..." : "Sign In"}
                  </button>
                </form>
              ) : null}

              {tab === "sign-up" ? (
                <form className="space-y-4" onSubmit={handlePasswordSignUp}>
                  <label className="block">
                    <span className="text-sm font-semibold text-charcoal">Email</span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="yb-field mt-2"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold text-charcoal">Password</span>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="yb-field mt-2"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={!authReady || isSubmitting}
                    className="yb-button yb-button-primary"
                  >
                    {isSubmitting ? "Creating account..." : "Create Account"}
                  </button>
                </form>
              ) : null}

              {tab === "magic-link" ? (
                <form className="space-y-4" onSubmit={handleMagicLink}>
                  <label className="block">
                    <span className="text-sm font-semibold text-charcoal">Email</span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="yb-field mt-2"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={!authReady || isSubmitting}
                    className="yb-button yb-button-primary"
                  >
                    {isSubmitting ? "Sending link..." : "Send Magic Link"}
                  </button>
                </form>
              ) : null}
            </div>
          )}
        </SectionCard>

        <div className="space-y-6">
          <SectionCard className="bg-[linear-gradient(180deg,rgba(33,88,66,0.98),rgba(23,55,44,0.96))] text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
              What changes after sign-in
            </p>
            <div className="mt-4 space-y-3 text-sm leading-7 text-white/82">
              <p>Email/password auth is available first, with magic link as an optional shortcut.</p>
              <p>YardBrief syncs your locally created projects, site visits, reports, and settings into Supabase after sign-in.</p>
              <p>When you sign out, demo mode is still available with local browser data.</p>
            </div>
          </SectionCard>

          <SectionCard>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone">
              Demo mode stays available
            </p>
            <div className="mt-4 space-y-3 text-sm leading-7 text-stone">
              <p>You do not need authentication to keep building the MVP or testing the flows.</p>
              <p>Supabase becomes the active data source only after you sign in successfully.</p>
              <p>Photo previews remain local-only for now, even when the rest of the project data syncs.</p>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
