import * as React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Github } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Authentication Error | CSCPDUAM Community",
  description: "An error occurred during GitHub authentication.",
};

interface AuthErrorPageProps {
  searchParams: Promise<{
    error?: string;
  }>;
}

export default async function AuthErrorPage({ searchParams }: AuthErrorPageProps) {
  const params = await searchParams;
  const errorType = params.error || "Default";

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-12 flex-1 w-full">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertCircle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            Authentication Error
          </h1>
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            Error Code: {errorType}
          </p>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed pt-1">
            An issue occurred while authenticating with GitHub OAuth. This could be due to cancelled permissions or a network timeout.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Button asChild size="lg" className="w-full sm:w-auto gap-2">
            <Link href="/auth/signin">
              <Github className="h-4 w-4" />
              <span>Try Again</span>
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto gap-2">
            <Link href="/discussions">
              <ArrowLeft className="h-4 w-4" />
              <span>Return Home</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
