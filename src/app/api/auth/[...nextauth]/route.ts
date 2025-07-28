import NextAuth from 'next-auth'
import AzureADProvider from 'next-auth/providers/azure-ad'
import { createClient_Server } from '@/lib/supabase'

const handler = NextAuth({
  providers: [
    AzureADProvider({
      clientId: process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID!,
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'azure-ad') {
        const supabase = createClient_Server()
        
        try {
          // Check if user exists in staff table
          const { data: staff, error } = await supabase
            .from('staff')
            .select('*')
            .eq('email', user.email)
            .single()

          if (error && error.code !== 'PGRST116') {
            console.error('Database error:', error)
            return false
          }

          if (staff) {
            // Update Azure ID if not set
            if (!staff.azure_id && user.id) {
              await supabase
                .from('staff')
                .update({ azure_id: user.id })
                .eq('id', staff.id)
            }
            return true
          } else {
            // Auto-create staff record for new Azure AD users
            const { error: insertError } = await supabase
              .from('staff')
              .insert([{
                email: user.email!,
                name: user.name || user.email!,
                department: 'Unassigned',
                role: 'user',
                azure_id: user.id
              }])

            if (insertError) {
              console.error('Failed to create staff record:', insertError)
              return false
            }
            return true
          }
        } catch (error) {
          console.error('Sign in error:', error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (account && user) {
        const supabase = createClient_Server()
        
        // Get user's role from staff table
        const { data: staff } = await supabase
          .from('staff')
          .select('role, department, id')
          .eq('email', user.email)
          .single()

        if (staff) {
          token.role = staff.role
          token.department = staff.department
          token.staffId = staff.id
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role as string
        session.user.department = token.department as string
        session.user.staffId = token.staffId as string
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
})

export { handler as GET, handler as POST }