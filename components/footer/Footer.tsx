"use client";

import * as React from "react";
import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border/80 bg-background text-foreground transition-colors mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Department Info */}
          <div className="text-center md:text-left space-y-1">
            <h3 className="font-bold text-sm tracking-tight text-foreground">
              Department of Computer Science
            </h3>
            <p className="text-xs text-muted-foreground">
              PDUAM, Amjonga, Goalpara-Assam
            </p>
            <p className="text-[11px] text-muted-foreground">
              Official Website:{" "}
              <a
                href="https://csc.pduamamjonga.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                csc.pduamamjonga.in
              </a>
            </p>
          </div>

          {/* Clean Navigation Links */}
          <div className="flex flex-wrap justify-center gap-6 text-xs text-muted-foreground font-medium">
            <Link href="/discussions" className="hover:text-foreground transition-colors">
              Discussions
            </Link>
            <Link href="/categories" className="hover:text-foreground transition-colors">
              Categories
            </Link>
            <Link href="/search" className="hover:text-foreground transition-colors">
              Search
            </Link>
            <a
              href="https://github.com/cscpduam-org/community"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              GitHub
            </a>
          </div>

          {/* Copyright */}
          <div className="text-center md:text-right text-[11px] text-muted-foreground space-y-1">
            <p>© {currentYear} Department of Computer Science, PDUAM Amjonga.</p>
            <p>Goalpara, Assam - 783124</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
