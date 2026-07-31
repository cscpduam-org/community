"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import {
  MessageSquare,
  FolderKanban,
  Search,
  Menu,
  X,
  Github,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const userMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setUserMenuOpen(false);
        setMobileMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [userMenuOpen]);

  const navLinks = [
    { href: "/discussions", label: "Discussions", icon: MessageSquare },
    { href: "/categories", label: "Categories", icon: FolderKanban },
  ];

  const handleSearchTrigger = () => {
    window.dispatchEvent(new Event("open-global-search"));
  };

  return (
    <header className="sticky top-0 sm:top-4 z-50 w-full max-w-7xl mx-auto px-4 transition-all duration-300">
      <div className="w-full border border-border/80 bg-background/80 backdrop-blur-md rounded-none sm:rounded-2xl shadow-sm px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo & Department Branding */}
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg p-1"
              aria-label="CSCPDUAMA Community Home"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg overflow-hidden shadow-sm transition-transform duration-200 group-hover:scale-105">
                <Image
                  src="/logo.png"
                  alt="CSCPDUAMA Logo"
                  width={36}
                  height={36}
                  className="h-9 w-9 object-cover rounded-lg"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight leading-tight group-hover:text-primary transition-colors">
                  CSCPDUAMA
                </span>
                <span className="text-[10px] font-medium text-muted-foreground leading-tight">
                  PDUAM Amjonga
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav
              aria-label="Global"
              className="hidden md:flex items-center gap-1.5 text-sm font-medium"
            >
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive =
                  pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary relative",
                      isActive
                        ? "text-primary font-semibold"
                        : "text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{link.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Search Shortcut Button */}
            <button
              onClick={handleSearchTrigger}
              aria-label="Quick Search"
              className="hidden sm:flex items-center justify-center h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent border border-border/40 rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
            >
              <Search className="h-4 w-4" />
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Auth / Profile Section */}
            {status === "loading" ? (
              <div className="h-9 w-9 rounded-full bg-muted animate-pulse border border-border" />
            ) : session?.user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  aria-label="User menu"
                  aria-haspopup="true"
                  aria-expanded={userMenuOpen}
                  className="flex items-center gap-2 rounded-full border border-border p-0.5 hover:ring-2 hover:ring-primary/50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User Avatar"}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                      {session.user.name?.charAt(0) || "U"}
                    </div>
                  )}
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div
                    role="menu"
                    aria-orientation="vertical"
                    className="absolute right-0 mt-2 w-56 rounded-2xl border border-border bg-card shadow-xl ring-1 ring-black/5 z-50 p-2 focus:outline-none animate-in fade-in-50 zoom-in-95 duration-100"
                  >
                    <div className="px-3 py-2 border-b border-border/80 mb-1">
                      <p className="text-sm font-semibold truncate text-foreground">
                        {session.user.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {session.user.email}
                      </p>
                    </div>

                    <Link
                      href="/profile"
                      role="menuitem"
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-colors focus-visible:outline-none focus-visible:bg-accent"
                    >
                      <User className="h-4 w-4" />
                      <span>Your Profile</span>
                    </Link>

                    <Link
                      href="/settings"
                      role="menuitem"
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-colors focus-visible:outline-none focus-visible:bg-accent"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </Link>

                    <div className="my-1 border-t border-border/80" />

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => signOut()}
                      className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-xl transition-colors focus-visible:outline-none focus-visible:bg-destructive/10"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => signIn("github")}
                className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium text-white bg-slate-950 dark:bg-slate-50 dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-200 rounded-xl shadow-xs transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Github className="h-4 w-4" />
                <span>Sign in</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? "Close main menu" : "Open main menu"}
              aria-expanded={mobileMenuOpen}
              className="flex md:hidden items-center justify-center h-9 w-9 rounded-xl border border-border bg-card text-foreground hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer / Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border border-border bg-card rounded-2xl p-4 mt-2 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <nav aria-label="Mobile Navigation" className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleSearchTrigger();
              }}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors w-full text-left"
            >
              <Search className="h-4 w-4" />
              <span>Search Discussions</span>
            </button>
          </nav>

          <div className="pt-2 border-t border-border/80 flex flex-col gap-2">
            {!session && (
              <button
                type="button"
                onClick={() => signIn("github")}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-white bg-slate-950 dark:bg-slate-50 dark:text-slate-950 rounded-xl shadow-xs hover:bg-slate-800 transition-colors"
              >
                <Github className="h-4 w-4" />
                <span>Sign in with GitHub</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
