import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

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
        try {
          await dbConnect();

          const user = await User.findOne({
            email: credentials.email,
            role: "superadmin",
            isActive: true,
          });

          if (!user) {
            return null;
          }

          const isValidPassword = await user.comparePassword(
            credentials.password
          );

          if (!isValidPassword) {
            return null;
          }

          // Update last login
          user.lastLogin = new Date();
          await user.save();

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            image: user.image,
          };
        } catch (error) {
          console.error("Superadmin login error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          await dbConnect();

          // Check if user exists
          let dbUser = await User.findOne({ email: user.email });

          if (!dbUser) {
            // Create new admin user
            dbUser = new User({
              name: user.name,
              email: user.email,
              googleId: profile.sub,
              image: user.image,
              role: "admin",
            });
            await dbUser.save();
          } else {
            // Update existing user
            dbUser.googleId = profile.sub;
            dbUser.image = user.image;
            dbUser.lastLogin = new Date();
            await dbUser.save();
          }

          user.id = dbUser._id.toString();
          user.role = dbUser.role;
        } catch (error) {
          console.error("Google signin error:", error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token, user }) {
      // Add role and user ID to session
      if (token?.role) {
        session.user.role = token.role;
      }
      if (token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user, account, profile }) {
      // Set role and user ID in JWT
      if (user?.role) {
        token.role = user.role;
      }
      if (user?.id) {
        token.sub = user.id;
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
