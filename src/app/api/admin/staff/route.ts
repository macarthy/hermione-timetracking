import { NextRequest, NextResponse } from 'next/server'
import { createClient_Server } from '@/lib/supabase'
import { checkAdminAccess } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const supabase = createClient_Server()
  
  // In a real implementation, get userId from authentication
  // const userId = await getUserIdFromAuth(request)
  // if (!await checkAdminAccess(userId)) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  // }
  
  try {
    const { data: staff, error } = await supabase
      .from('staff')
      .select('*')
      .order('name')

    if (error) throw error

    // Add additional stats for each staff member
    const staffWithStats = await Promise.all(
      staff.map(async (member) => {
        const { data: timeEntries } = await supabase
          .from('time_entries')
          .select('hours, date')
          .eq('staff_id', member.id)

        const totalHours = timeEntries?.reduce((sum, entry) => sum + entry.hours, 0) || 0
        const thisWeekHours = timeEntries?.filter(entry => {
          const entryDate = new Date(entry.date)
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          return entryDate >= weekAgo
        }).reduce((sum, entry) => sum + entry.hours, 0) || 0

        return {
          ...member,
          totalHours,
          thisWeekHours,
          entryCount: timeEntries?.length || 0
        }
      })
    )

    return NextResponse.json(staffWithStats)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch staff' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  const supabase = createClient_Server()
  
  // Check admin access
  // const userId = await getUserIdFromAuth(request)
  // if (!await checkAdminAccess(userId)) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  // }
  
  try {
    const body = await request.json()
    const { id, name, email, department, role } = body

    const { data: staff, error } = await supabase
      .from('staff')
      .update({ name, email, department, role })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(staff)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update staff member' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  const supabase = createClient_Server()
  
  // Check admin access
  // const userId = await getUserIdFromAuth(request)
  // if (!await checkAdminAccess(userId)) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  // }
  
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Staff ID required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('staff')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete staff member' },
      { status: 500 }
    )
  }
}