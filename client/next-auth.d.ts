declare module "next-auth" {
    interface User {
      id: string
      // Add any other custom properties your user model has
    }
    
    interface Session {
      user: User
    }
  }
  
  declare module "next-auth/jwt" {
    interface JWT {
      id: string
    }
  }