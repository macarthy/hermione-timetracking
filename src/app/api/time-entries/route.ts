import { NextRequest, NextResponse } from 'next/server'
import { createClient_Server } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const supabase = createClient_Server()
  const { searchParams } = new URL(request.url)
  const staffId = searchParams.get('staff_id')
  const projectId = searchParams.get('project_id')
  const startDate = searchParams.get('start_date')
  const endDate = searchParams.get('end_date')
  
  try {
    let query = supabase
      .from('time_entries')
      .select(`
        *,
        staff:staff_id(id, name, email),
        project:project_id(id, name, client)
      `)
      .order('date', { ascending: false })

    if (staffId) {
      query = query.eq('staff_id', staffId)
    }
    
    if (projectId) {
      query = query.eq('project_id', projectId)
    }
    
    if (startDate) {
      query = query.gte('date', startDate)
    }
    
    if (endDate) {
      query = query.lte('date', endDate)
    }

    const { data: timeEntries, error } = await query

    if (error) throw error

    return NextResponse.json(timeEntries)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch time entries' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const supabase = createClient_Server()
  
  try {
    const body = await request.json()
    const { staff_id, project_id, description, hours, date } = body

    const { data: timeEntry, error } = await supabase
      .from('time_entries')
      .insert([{ staff_id, project_id, description, hours, date }])
      .select(`
        *,
        staff:staff_id(id, name, email),
        project:project_id(id, name, client)
      `)
      .single()

    if (error) throw error

    return NextResponse.json(timeEntry)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create time entry' },
      { status: 500 }
    )
  }
}