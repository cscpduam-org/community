import * as React from "react";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Github, ArrowLeft, ShieldCheck, Sparkles, MessageSquare } from "lucide-react";
import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";

export const runtime = "edge";


export const metadata: Metadata = {
  title: "Sign In | CSCPDUAM Community",
  description:
    "Sign in to CSCPDUAM Community with your GitHub account to ask questions, share projects, and participate in department discussions.",
};

interface SignInPageProps {
  searchParams: Promise<{
    callbackUrl?: string;
    error?: string;
  }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const rawCallbackUrl = params.callbackUrl || "/discussions";
  // Ensure callbackUrl is safe / relative or valid local URL
  const callbackUrl = rawCallbackUrl.startsWith("/")
    ? rawCallbackUrl
    : rawCallbackUrl.includes("localhost") || rawCallbackUrl.includes("cscpduam")
    ? rawCallbackUrl
    : "/discussions";

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 flex-1 w-full">
      <div className="w-full max-w-md space-y-8">
        {/* Back Link */}
        <div>
          <Link
            href="/discussions"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Community</span>
          </Link>
        </div>

        {/* Main Sign In Card */}
        <div className="rounded-[24px] border border-border bg-card p-8 sm:p-10 shadow-xl space-y-8 relative overflow-hidden">
          {/* Top Decorative Subtle Glow */}
          <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

          {/* Logo & Header */}
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/60 ring-8 ring-muted/20 shadow-xs overflow-hidden">
              <Image
                src="/logo.png"
                alt="CSCPDUAM Logo"
                width={64}
                height={64}
                className="h-16 w-16 object-cover rounded-2xl"
                priority
              />
            </div>

            <div className="space-y-1 pt-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center justify-center gap-1.5">
                <span>CSCPDUAM</span>
                <Sparkles className="h-4 w-4 text-amber-500" />
              </h1>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Department of Computer Science
              </p>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-1 max-w-xs mx-auto">
              Sign in with your GitHub account to create discussions, post replies, and connect with peers.
            </p>
          </div>

          {/* Error Banner if Redirected with Error */}
          {params.error && (
            <div className="p-3 rounded-xl border border-destructive/30 bg-destructive/5 text-xs text-destructive text-center font-medium">
              Authentication failed or was cancelled. Please try again.
            </div>
          )}

          {/* Sign In Form Action */}
          <form
            action={async () => {
              "use server";
              await signIn("github", { redirectTo: callbackUrl });
            }}
            className="space-y-4"
          >
            <Button
              type="submit"
              size="lg"
              className="w-full gap-3 py-6 text-base font-semibold rounded-[14px] shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Github className="h-5 w-5" />
              <span>Continue with GitHub</span>
            </Button>
          </form>

          {/* Trust & Security Highlights */}
          <div className="pt-4 border-t border-border/80 space-y-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>No password storage — Secured by GitHub OAuth.</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary shrink-0" />
              <span>GitHub Discussions powers all community data.</span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-muted-foreground leading-relaxed">
          Need help logging in? Contact the Department of Computer Science, PDUAM.
        </p>
      </div>
    </div>
  );
}
