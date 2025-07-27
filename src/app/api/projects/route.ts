import { NextRequest, NextResponse } from 'next/server'
import { createClient_Server } from '@/lib/supabase'

export async function GET() {
  const supabase = createClient_Server()
  
  try {
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .order('name')

    if (error) throw error

    return NextResponse.json(projects)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const supabase = createClient_Server()
  
  try {
    const body = await request.json()
    const { name, description, client, status = 'active' } = body

    const { data: project, error } = await supabase
      .from('projects')
      .insert([{ name, description, client, status }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(project)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}