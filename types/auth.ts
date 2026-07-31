import { DefaultSession } from "next-auth";
import "next-auth/jwt";

export interface ExtendedUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  username?: string;
  login?: string;
  bio?: string | null;
  profileUrl?: string;
}

export interface Session extends DefaultSession {
  user: ExtendedUser;
  accessToken?: string;
  error?: string;
}

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: ExtendedUser & DefaultSession["user"];
  }

  interface User extends ExtendedUser {}
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    login?: string;
    username?: string;
    bio?: string;
    profileUrl?: string;
    id?: string;
  }
}
