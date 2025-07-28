import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string
      department?: string
      staffId?: string
    }
  }

  interface User {
    role?: string
    department?: string
    staffId?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
    department?: string
    staffId?: string
  }
}