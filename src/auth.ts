import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { comparePasswords, saltAndHashPassword } from "@/utils/salt";
import { PrismaClient } from "@prisma/client";

// Prisma:
const prisma = new PrismaClient();

interface UserSchema {
  name: string,
  email: string;
  password: string;
}

export const authHandler = NextAuth({
  providers: [
    Credentials({
      name: "Ignify.",
      credentials: {
        name: { label: "Username", placeholder: "Enter your Name", name: "text", type: "text" },
        email: { label: "Email", placeholder: "Enter your email", name: "email", type: "email" },
        password: { label: "Password", placeholder: "Enter your password", name: "password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials) throw new Error("Missing credentials");

        const { name, email, password } = credentials as UserSchema;


        let user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {

          const hashedPassword = await saltAndHashPassword(password);

          user = await prisma.user.create({
            data: {
              display_name: name,
              email,
              password: hashedPassword,
            },
          });
        } else {

          const isValid = await comparePasswords(password, user.password);
          if (!isValid) {
            throw new Error("Invalid credentials");
          }
        }

        return {
          id: user.user_id,
          email: user.email,
          name: user.display_name,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.email = token.email as string;
      session.user.name = token.name as string;
      return session;
    },
  },
});
