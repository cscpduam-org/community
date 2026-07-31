import type { Metadata } from "next";
import { Terminal, ShieldAlert } from "lucide-react";
import { MarkdownRenderer } from "@/components/markdown/MarkdownRenderer";
import { Card } from "@/components/ui/card";
import { setupMarkdownContent } from "@/docs/setupContent";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Setup Guide",
  description: "How to set up and run the CSCPDUAMA Community platform locally.",
};

export default async function SetupPage() {
  let content = setupMarkdownContent;
  let errorMsg: string | null = null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-6">
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
          <Terminal className="h-8 w-8 text-primary shrink-0" />
          <span>Local Setup Guide</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Detailed developer setup instructions for setting up the environment, GitHub OAuth, and running the project locally.
        </p>
      </div>

      <main id="main-content">
        {errorMsg ? (
          <Card className="p-6 border-destructive/20 bg-destructive/5 text-destructive flex items-center gap-3">
            <ShieldAlert className="h-5 w-5 shrink-0" />
            <span className="text-sm font-semibold">{errorMsg}</span>
          </Card>
        ) : (
          <Card className="p-6 sm:p-8 border-border bg-card shadow-xs">
            <article className="prose prose-slate dark:prose-invert max-w-none">
              <MarkdownRenderer content={content} />
            </article>
          </Card>
        )}
      </main>
    </div>
  );
}
