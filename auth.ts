import NextAuth from "next-auth";

type AuthentikProfile = {
  sub?: string;
  name?: string;
  email?: string;
  preferred_username?: string;
  groups?: string[];
};

type UserRole = "ADMIN" | "DRIVER" | "CUSTOMER";

function isUserRole(role: unknown): role is UserRole {
  return role === "ADMIN" || role === "DRIVER" || role === "CUSTOMER";
}

function roleFromGroups(groups: string[] = []) {
  if (groups.includes(process.env.AUTHENTIK_ADMIN_GROUP ?? "FleetFlow Admins")) return "ADMIN" as const;
  if (groups.includes(process.env.AUTHENTIK_DRIVER_GROUP ?? "FleetFlow Drivers")) return "DRIVER" as const;
  return "CUSTOMER" as const;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    {
      id: "authentik",
      name: "Authentik",
      type: "oidc",
      issuer: process.env.AUTHENTIK_ISSUER || "http://localhost:9000/application/o/fleetflow/",
      clientId: process.env.AUTHENTIK_ID,
      clientSecret: process.env.AUTHENTIK_SECRET,
      authorization: { params: { scope: "openid email profile groups" } },
      profile(profile: AuthentikProfile) {
        return {
          id: profile.sub ?? profile.email ?? profile.preferred_username ?? "authentik-user",
          name: profile.name ?? profile.preferred_username ?? profile.email,
          email: profile.email,
          role: roleFromGroups(profile.groups),
        };
      },
    },
  ],
  callbacks: {
    async jwt({ token, profile }) {
      if (profile) {
        const authentikProfile = profile as AuthentikProfile;
        token.role = roleFromGroups(authentikProfile.groups);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = isUserRole(token.role) ? token.role : "CUSTOMER";
      }
      return session;
    },
  },
});
