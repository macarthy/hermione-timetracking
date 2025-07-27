import { createClient_Server } from './supabase'

export async function checkAdminAccess(userId?: string) {
  if (!userId) {
    return false
  }

  const supabase = createClient_Server()
  
  try {
    const { data: staff, error } = await supabase
      .from('staff')
      .select('role')
      .eq('azure_id', userId)
      .single()

    if (error || !staff) {
      return false
    }

    // Check if user has admin role
    return staff.role === 'admin' || staff.role === 'manager'
  } catch (error) {
    return false
  }
}

export function isAdminRole(role: string): boolean {
  return role === 'admin' || role === 'manager'
}