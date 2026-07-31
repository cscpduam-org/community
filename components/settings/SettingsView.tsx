"use client";

import * as React from "react";
import { signOut } from "next-auth/react";
import { useTheme } from "@/components/providers/Providers";
import {
  Sun,
  Moon,
  Monitor,
  Bell,
  Shield,
  LogOut,
  Check,
  Github,
  Sliders,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface SettingsViewProps {
  userSession: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    login?: string | null;
  };
}

export function SettingsView({ userSession }: SettingsViewProps) {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const [mounted, setMounted] = React.useState(false);

  // Settings State
  const [defaultSort, setDefaultSort] = React.useState("latest");
  const [emailNotifications, setEmailNotifications] = React.useState(true);
  const [replyAlerts, setReplyAlerts] = React.useState(true);
  const [compactView, setCompactView] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    // Load local stored preferences if available
    const savedSort = localStorage.getItem("csc_pref_sort");
    const savedCompact = localStorage.getItem("csc_pref_compact");
    if (savedSort) setDefaultSort(savedSort);
    if (savedCompact) setCompactView(savedCompact === "true");
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      localStorage.setItem("csc_pref_sort", defaultSort);
      localStorage.setItem("csc_pref_compact", String(compactView));

      toast({
        title: "Settings saved!",
        description: "Your account preferences have been updated successfully.",
      });
    } catch (err) {
      toast({
        title: "Error saving settings",
        description: "Failed to update preferences in local storage.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-40 rounded-2xl bg-card border border-border" />
        <div className="h-60 rounded-2xl bg-card border border-border" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSaveSettings} className="space-y-8">
      {/* Theme Preference Section */}
      <section className="rounded-[20px] border border-border bg-card p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-border/80 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sun className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Appearance & Theme</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Customize how CSCPDUAM Community looks on your device.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { id: "light", label: "Light Mode", icon: Sun, desc: "Clean white interface" },
            { id: "dark", label: "Dark Mode", icon: Moon, desc: "GitHub Dark palette" },
            { id: "system", label: "System Default", icon: Monitor, desc: "Matches OS theme" },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = theme === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTheme(item.id as any)}
                className={cn(
                  "flex flex-col items-start p-4 rounded-2xl border text-left transition-all relative focus:outline-none focus:ring-2 focus:ring-primary",
                  isSelected
                    ? "bg-primary/5 border-primary ring-2 ring-primary/30"
                    : "border-border bg-background hover:bg-accent/40"
                )}
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div
                    className={cn(
                      "p-2 rounded-xl border",
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted text-muted-foreground border-border"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  {isSelected && <Check className="h-5 w-5 text-primary" />}
                </div>
                <span className="font-bold text-sm text-foreground">{item.label}</span>
                <span className="text-xs text-muted-foreground mt-0.5">{item.desc}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Discussion & Layout Preferences */}
      <section className="rounded-[20px] border border-border bg-card p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-border/80 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sliders className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Community Preferences</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Configure default sorting, layout density, and view options.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Default Sorting Option */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/60">
            <div>
              <label htmlFor="default-sort" className="font-semibold text-sm text-foreground block">
                Default Discussion Sorting
              </label>
              <span className="text-xs text-muted-foreground">
                Set the default order when browsing discussions.
              </span>
            </div>
            <select
              id="default-sort"
              value={defaultSort}
              onChange={(e) => setDefaultSort(e.target.value)}
              className="h-10 px-3 rounded-xl border border-input bg-background text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="latest">Latest Discussions</option>
              <option value="top">Top / Most Active</option>
              <option value="unanswered">Unanswered Questions</option>
            </select>
          </div>

          {/* Compact Card Layout Switcher */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <span className="font-semibold text-sm text-foreground block">
                Compact Card View
              </span>
              <span className="text-xs text-muted-foreground">
                Display discussions in a tighter list format to fit more content.
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={compactView}
              onClick={() => setCompactView((prev) => !prev)}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary",
                compactView ? "bg-primary" : "bg-muted"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow-xs ring-0 transition duration-200 ease-in-out",
                  compactView ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Notifications Section */}
      <section className="rounded-[20px] border border-border bg-card p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-border/80 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Notifications</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Manage how GitHub sends notification updates for community discussions.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 pb-3 border-b border-border/60">
            <div>
              <span className="font-semibold text-sm text-foreground block">
                Discussion Reply Notifications
              </span>
              <span className="text-xs text-muted-foreground">
                Receive notifications when someone replies to your discussion or comment.
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={replyAlerts}
              onClick={() => setReplyAlerts((prev) => !prev)}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary",
                replyAlerts ? "bg-primary" : "bg-muted"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow-xs ring-0 transition duration-200 ease-in-out",
                  replyAlerts ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <span className="font-semibold text-sm text-foreground block">
                Department Announcements
              </span>
              <span className="text-xs text-muted-foreground">
                Get notified whenever new official faculty announcements are published.
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={emailNotifications}
              onClick={() => setEmailNotifications((prev) => !prev)}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary",
                emailNotifications ? "bg-primary" : "bg-muted"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow-xs ring-0 transition duration-200 ease-in-out",
                  emailNotifications ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Account Info & Security */}
      <section className="rounded-[20px] border border-border bg-card p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-border/80 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">GitHub Account & Session</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Connected GitHub OAuth session information and access permissions.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="p-4 rounded-xl border border-border bg-background space-y-1">
            <span className="text-muted-foreground font-medium block text-xs">Connected GitHub User</span>
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <Github className="h-4 w-4" />
              @{userSession.login || userSession.name}
            </span>
          </div>

          <div className="p-4 rounded-xl border border-border bg-background space-y-1">
            <span className="text-muted-foreground font-medium block text-xs">Email Address</span>
            <span className="font-bold text-foreground truncate block">
              {userSession.email || "Primary GitHub Email"}
            </span>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/60">
          <span className="text-xs text-muted-foreground">
            OAuth Scopes: read:user, user:email, repo, discussion
          </span>

          <Button
            type="button"
            variant="destructive"
            onClick={() => signOut()}
            className="w-full sm:w-auto gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </Button>
        </div>
      </section>

      {/* Save Button Bar */}
      <div className="flex justify-end pt-2">
        <Button type="submit" isLoading={isSaving} className="gap-2 px-8 shadow-sm">
          <Save className="h-4 w-4" />
          <span>Save Preferences</span>
        </Button>
      </div>
    </form>
  );
}
