import { NextRequest, NextResponse } from 'next/server'
import { createClient_Server } from '@/lib/supabase'

export async function GET() {
  const supabase = createClient_Server()
  
  try {
    const { data: staff, error } = await supabase
      .from('staff')
      .select('*')
      .order('name')

    if (error) throw error

    return NextResponse.json(staff)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch staff' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const supabase = createClient_Server()
  
  try {
    const body = await request.json()
    const { email, name, department, role, azure_id } = body

    const { data: staff, error } = await supabase
      .from('staff')
      .insert([{ email, name, department, role, azure_id }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(staff)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create staff member' },
      { status: 500 }
    )
  }
}