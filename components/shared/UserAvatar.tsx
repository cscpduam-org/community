import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface UserAvatarUser {
  name?: string | null;
  image?: string | null;
  username?: string | null;
  role?: string | null;
}

export interface UserAvatarProps {
  user?: UserAvatarUser;
  name?: string;
  image?: string;
  username?: string;
  role?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showName?: boolean;
  showRole?: boolean;
  subtext?: string;
  className?: string;
}

function getInitials(name?: string | null, username?: string | null): string {
  const displayName = name || username || "";
  if (!displayName) return "U";

  const parts = displayName.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return displayName.substring(0, 2).toUpperCase();
}

function getRoleVariant(role?: string | null): "default" | "secondary" | "outline" | "category" | "role" | "status" | "success" | "warning" {
  if (!role) return "secondary";
  const r = role.toLowerCase();
  if (r.includes("faculty") || r.includes("professor") || r.includes("teacher")) return "warning";
  if (r.includes("maintainer") || r.includes("lead")) return "role";
  if (r.includes("admin")) return "default";
  if (r.includes("contributor")) return "category";
  if (r.includes("student")) return "success";
  return "secondary";
}

export function UserAvatar({
  user,
  name: nameProp,
  image: imageProp,
  username: usernameProp,
  role: roleProp,
  size = "md",
  showName = false,
  showRole = false,
  subtext,
  className,
}: UserAvatarProps) {
  const name = nameProp ?? user?.name ?? "";
  const image = imageProp ?? user?.image ?? "";
  const username = usernameProp ?? user?.username ?? "";
  const role = roleProp ?? user?.role;

  const displayName = name || username || "User";
  const initials = getInitials(name, username);

  const avatarSizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-lg",
  };

  return (
    <div className={cn("inline-flex items-center gap-3", className)}>
      <Avatar className={avatarSizes[size]}>
        <AvatarImage
          src={image || undefined}
          alt={displayName}
        />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>

      {(showName || showRole || subtext) && (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            {showName && (
              <span className="font-semibold text-foreground truncate text-sm">
                {displayName}
              </span>
            )}
            {showRole && role && (
              <Badge variant={getRoleVariant(role)} className="capitalize text-[10px] px-1.5 py-0">
                {role}
              </Badge>
            )}
          </div>
          {subtext && (
            <span className="text-xs text-muted-foreground truncate">
              {subtext}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
