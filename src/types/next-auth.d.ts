import "next-auth";

declare module "next-auth" {
  interface User {
    role: "ADMIN" | "DRIVER" | "CUSTOMER";
  }

  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "ADMIN" | "DRIVER" | "CUSTOMER";
  }
}
