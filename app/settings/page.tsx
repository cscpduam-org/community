import * as React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Settings, Lock, Github, ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { SettingsView } from "@/components/settings/SettingsView";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Settings",
  description:
    "Manage your account preferences, theme options, notification settings, and session options on CSCPDUAM Community.",
};

export default async function SettingsPage() {
  const session = await auth();

  // If user is guest / unauthenticated
  if (!session || !session.user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 flex-1 w-full flex flex-col justify-center items-center">
        <div className="w-full rounded-[24px] border border-border bg-card p-8 sm:p-12 text-center shadow-lg space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Lock className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Sign In to Access Settings
            </h1>
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              You must be signed in with your GitHub account to access and customize your account preferences.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button asChild size="lg" className="w-full sm:w-auto gap-2 px-8 shadow-sm">
              <Link href="/api/auth/signin?callbackUrl=/settings">
                <Github className="h-5 w-5" />
                <span>Sign in with GitHub</span>
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto gap-2">
              <Link href="/discussions">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Discussions</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const userSession = {
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
    login: (session.user as any).login || session.user.name,
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
      {/* Header Banner */}
      <div className="border-b border-border pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
          <Settings className="h-7 w-7 text-primary shrink-0" />
          <span>Account Settings</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your theme, community layout options, and notification preferences.
        </p>
      </div>

      {/* Settings Form Host */}
      <main id="main-content">
        <SettingsView userSession={userSession} />
      </main>
    </div>
  );
}
