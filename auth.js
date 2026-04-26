import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async signIn({ user, account }) {
      try {
        // Use dynamic imports to prevent edge runtime bundle issues
        const { connectDB } = await import("@/lib/mongodb");
        const User = (await import("@/models/User")).default;
        await connectDB();
        
        await User.findOneAndUpdate(
          { email: user.email },
          { 
            name: user.name,
            image: user.image,
            providerId: account?.providerAccountId || user.id,
            lastLogin: new Date(),
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      } catch (err) {
        console.error("Failed to track user sign-in:", err);
      }
      return true; // Always allow sign in to proceed
    },
    jwt({ token, user }) {
      /**
       * `user` is only populated on the initial sign-in event.
       * We persist `user.id` into the JWT so it survives across
       * all subsequent JWT refreshes and page reloads.
       * 
       * Auth.js v5 sets `user.id` to the provider's sub for OAuth
       * (same value that was used when the account was first created),
       * so this is always stable for the same Google account.
       */
      if (user?.id) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      /**
       * Expose the stable user ID in the session.
       * Falls back to token.sub (Google numeric sub) if for some reason
       * token.id is missing from an older JWT cookie.
       */
      session.user.id = token.id ?? token.sub;
      return session;
    },
  },

  pages: {
    signIn: "/", // Redirect unauthenticated users to login page
  },
});
