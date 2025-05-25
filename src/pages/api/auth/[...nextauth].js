import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { connectToDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions = {
  debug: true, // Enable debug logs
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        await connectToDB();

        const user = await User.findOne({
          email: credentials.email.toLowerCase(),
        });

        if (!user || !user?.password) {
          throw new Error("Invalid credentials");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // console.log("SignIn callback:", { user, account, profile });

      if (account?.provider === "google") {
        try {
          await connectToDB();

          // Check if user exists
          const existingUser = await User.findOne({
            email: user.email.toLowerCase(),
          });

          if (existingUser) {
            // Update user info if needed
            await User.findByIdAndUpdate(existingUser._id, {
              name: user.name,
              isVerified: true,
            });

            // Use existing user's role
            user.role = existingUser.role;
            user.id = existingUser._id;
            // console.log("Found existing user:", existingUser);
          } else {
            // Create new user if doesn't exist
            const newUser = await User.create({
              email: user.email.toLowerCase(),
              name: user.name,
              isVerified: true,
              phone: user.phone || "",
              role: "None", // Set default role for new users
            });
            // console.log("Created new user:", newUser);
            user.role = "None";
            user.id = newUser._id;
          }

          return true;
        } catch (error) {
          // console.error("Error during Google sign in:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account, profile }) {
      // console.log("JWT callback - Input:", { token, user, account, profile });

      if (user) {
        token.role = user.role;
        token.id = user.id;
      } else if (token) {
        // If no user object but token exists, ensure role is preserved
        const dbUser = await User.findById(token.id);
        if (dbUser) {
          token.role = dbUser.role;
        }
      }

      // console.log("JWT callback - Output token:", token);
      return token;
    },
    async session({ session, token, user }) {
      // console.log("Session callback - Input:", { session, token, user });

      if (token) {
        session.user.role = token.role;
        session.user.id = token.id;
      }

      // console.log("Session callback - Output session:", session);
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
