import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcryptjs from "bcryptjs";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Get user from Convex database
          const user = await convex.query(api.auth.getUserByEmail, { 
            email: credentials.email 
          });

          if (!user) {
            console.log("User not found:", credentials.email);
            return null;
          }

          // Verify password
          const isValidPassword = await bcryptjs.compare(credentials.password, user.password);
          
          if (!isValidPassword) {
            console.log("Invalid password for user:", credentials.email);
            return null;
          }

          // Return user object (without password)
          return {
            id: user._id,
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt" as const,
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development",
  },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user }: { token: import("next-auth/jwt").JWT; user?: { id: string } | null }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: import("next-auth").Session; token: import("next-auth/jwt").JWT }) {
      if (token) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 