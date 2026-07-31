import * as React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDiscussionByNumber } from "@/lib/github";
import { DiscussionDetailView } from "@/components/discussion/DiscussionDetailView";
import { ErrorState } from "@/components/shared/ErrorState";
import { auth } from "@/auth";

interface DiscussionDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Extract discussion number from slug.
 * Handles formats like: "my-discussion-123", "123-my-discussion", or "123".
 */
function extractDiscussionNumber(slug: string): number | null {
  if (!slug) return null;
  const trimmed = slug.trim();
  if (/^\d+$/.test(trimmed)) {
    return parseInt(trimmed, 10);
  }
  const parts = trimmed.split("-");
  const lastPart = parts[parts.length - 1];
  if (/^\d+$/.test(lastPart)) {
    return parseInt(lastPart, 10);
  }
  const firstPart = parts[0];
  if (/^\d+$/.test(firstPart)) {
    return parseInt(firstPart, 10);
  }
  const match = trimmed.match(/(\d+)$/);
  if (match) {
    return parseInt(match[1], 10);
  }
  return null;
}

export async function generateMetadata({ params }: DiscussionDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const discussionNumber = extractDiscussionNumber(resolvedParams.slug);

  if (!discussionNumber) {
    return {
      title: "Discussion | CSCPDUAM Community",
      description: "Read technical discussions on CSCPDUAM Community.",
    };
  }

  try {
    const discussion = await getDiscussionByNumber(discussionNumber);
    if (!discussion) {
      return {
        title: `Discussion #${discussionNumber} | CSCPDUAM Community`,
        description: "Read technical discussion on CSCPDUAM Community.",
      };
    }

    const titleText = `${discussion.title} | CSCPDUAM Community`;
    const descText =
      discussion.body?.slice(0, 160).replace(/[\r\n]+/g, " ") ||
      "Read technical discussion on CSCPDUAM Community.";

    return {
      title: titleText,
      description: descText,
      openGraph: {
        title: discussion.title,
        description: descText,
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title: discussion.title,
        description: descText,
      },
    };
  } catch {
    return {
      title: `Discussion #${discussionNumber} | CSCPDUAM Community`,
      description: "Read technical discussion on CSCPDUAM Community.",
    };
  }
}

export default async function DiscussionDetailPage({ params }: DiscussionDetailPageProps) {
  const resolvedParams = await params;
  const discussionNumber = extractDiscussionNumber(resolvedParams.slug);

  if (!discussionNumber) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 flex-1">
        <ErrorState
          title="Invalid Discussion Link"
          message="The discussion URL provided is invalid. Please return to the discussions page."
        />
      </div>
    );
  }

  const session = await auth();
  const userToken = session?.accessToken;

  let discussion = null;
  let errorMsg: string | null = null;

  try {
    discussion = await getDiscussionByNumber(discussionNumber, 50, undefined, userToken);
  } catch (err: any) {
    console.error(`Error fetching discussion #${discussionNumber}:`, err);
    errorMsg = err.message || "Failed to load discussion from GitHub.";
  }

  if (!discussion && !errorMsg) {
    notFound();
  }

  if (errorMsg || !discussion) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 flex-1">
        <ErrorState
          title="Discussion Not Found"
          message={errorMsg || `Discussion #${discussionNumber} could not be found or has been removed.`}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
      <DiscussionDetailView discussion={discussion} />
    </div>
  );
}

