import { createClient } from '@supabase/supabase-js'
import { createBrowserClient, createServerClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Browser client for client components
export const createClient_Browser = () =>
  createBrowserClient(supabaseUrl, supabaseAnonKey)

// Server client for server components and API routes
export const createClient_Server = () =>
  createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get: (name: string) => {
        // This will be used in server contexts
        return undefined
      },
      set: (name: string, value: string, options: any) => {
        // This will be used in server contexts
      },
      remove: (name: string, options: any) => {
        // This will be used in server contexts
      },
    },
  })

// Database types
export interface Staff {
  id: string
  email: string
  name: string
  department: string
  role: string
  azure_id?: string
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  name: string
  description?: string
  client?: string
  status: 'active' | 'completed' | 'on_hold'
  created_at: string
  updated_at: string
}

export interface TimeEntry {
  id: string
  staff_id: string
  project_id: string
  description: string
  hours: number
  date: string
  created_at: string
  updated_at: string
  staff?: Staff
  project?: Project
}