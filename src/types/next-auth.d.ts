import "next-auth";
import type { AppRole } from "@/lib/roles";

declare module "next-auth" {
  interface User {
    role: AppRole;
  }

  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: AppRole;
  }
}
