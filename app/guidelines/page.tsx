import type { Metadata } from "next";
import { ShieldCheck, MessageSquare, BookOpen, UserCheck, AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "Guidelines",
  description: "Community guidelines and Code of Conduct for CSCPDUAMA Community.",
};

export default function GuidelinesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
      {/* Header banner */}
      <div className="border-b border-border pb-6 space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
          <ShieldCheck className="h-8 w-8 text-primary shrink-0" />
          <span>Community Guidelines</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Code of conduct, collaboration standards, and academic integrity policies for the Department of Computer Science, PDUAM Amjonga.
        </p>
      </div>

      <main className="space-y-8">
        {/* Core Principles */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" />
            <span>1. Core Principles</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl border border-border bg-card space-y-2">
              <h3 className="font-semibold text-sm text-foreground">Be Respectful</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Treat all students, teachers, and community members with dignity. Harassment, clean-language violations, and hate speech are strictly prohibited.
              </p>
            </div>
            <div className="p-5 rounded-2xl border border-border bg-card space-y-2">
              <h3 className="font-semibold text-sm text-foreground">Collaborate Openly</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Share resources, answer questions thoughtfully, and encourage fellow students on their learning journeys.
              </p>
            </div>
          </div>
        </section>

        {/* Academic Integrity */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            <span>2. Academic Integrity</span>
          </h2>
          <div className="p-6 rounded-2xl border border-border bg-card space-y-3">
            <p className="text-sm text-foreground font-medium">
              We value honest collaboration that aids learning over copy-pasting solutions.
            </p>
            <ul className="list-disc pl-5 space-y-2.5 text-xs text-muted-foreground leading-relaxed">
              <li>
                <strong>No Plagiarism:</strong> Do not post complete homework/assignment solutions for others to copy directly.
              </li>
              <li>
                <strong>Guided Help:</strong> When answering homework-related Q&A threads, explain the concepts, logic, and debugging steps instead of sharing the complete code.
              </li>
              <li>
                <strong>Open Source:</strong> Project showcase threads must cite original developers and license guidelines clearly.
              </li>
            </ul>
          </div>
        </section>

        {/* Categories & Posting */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <span>3. Discussion Etiquette</span>
          </h2>
          <div className="p-6 rounded-2xl border border-border bg-card space-y-3">
            <ul className="list-disc pl-5 space-y-2.5 text-xs text-muted-foreground leading-relaxed">
              <li>
                <strong>Pick the Right Category:</strong> Choose the appropriate category (e.g. Q&A for programming doubts, Showcase/Projects for sharing your project repositories).
              </li>
              <li>
                <strong>Write Clear Titles:</strong> Use descriptive titles (e.g., *&quot;Error when setting up PostgreSQL connection in Node.js&quot;* instead of *&quot;Help please!&quot;*).
              </li>
              <li>
                <strong>Markdown & Code Blocks:</strong> Wrap your code snippets in triple backticks with syntax highlighting languages (e.g., <code>```python</code>) to keep them readable.
              </li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
