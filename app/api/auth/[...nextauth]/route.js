import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

const superadminEmail = process.env.SUPERADMIN_EMAIL;
const superadminPassword = process.env.SUPERADMIN_PASSWORD;

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Superadmin Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (
          credentials.email === superadminEmail &&
          credentials.password === superadminPassword
        ) {
          return {
            id: "superadmin",
            name: "Super Admin",
            email: superadminEmail,
            role: "superadmin",
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, token, user }) {
      // Add role to session
      if (token?.role) {
        session.user.role = token.role;
      } else if (session.user.email === superadminEmail) {
        session.user.role = "superadmin";
      } else {
        session.user.role = "admin";
      }
      return session;
    },
    async jwt({ token, user, account, profile }) {
      // Set role in JWT
      if (user?.role) {
        token.role = user.role;
      } else if (token?.email === superadminEmail) {
        token.role = "superadmin";
      } else {
        token.role = "admin";
      }
      return token;
    },
  },
  pages: {
    signIn: "/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
