import { NextRequest, NextResponse } from 'next/server'
import { createClient_Server } from '@/lib/supabase'
import { checkAdminAccess } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const supabase = createClient_Server()
  
  // Check admin access
  // const userId = await getUserIdFromAuth(request)
  // if (!await checkAdminAccess(userId)) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  // }
  
  const { searchParams } = new URL(request.url)
  const reportType = searchParams.get('type') || 'summary'
  const startDate = searchParams.get('start_date')
  const endDate = searchParams.get('end_date')
  const staffId = searchParams.get('staff_id')
  const projectId = searchParams.get('project_id')
  
  try {
    if (reportType === 'summary') {
      // Get summary statistics
      const { data: totalHours } = await supabase
        .from('time_entries')
        .select('hours')
      
      const { data: staffCount } = await supabase
        .from('staff')
        .select('id')
      
      const { data: projectCount } = await supabase
        .from('projects')
        .select('id')
        .eq('status', 'active')

      // Get this week's hours
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      
      const { data: thisWeekHours } = await supabase
        .from('time_entries')
        .select('hours')
        .gte('date', weekAgo.toISOString().split('T')[0])

      return NextResponse.json({
        totalStaff: staffCount?.length || 0,
        activeProjects: projectCount?.length || 0,
        totalHours: totalHours?.reduce((sum, entry) => sum + entry.hours, 0) || 0,
        thisWeekHours: thisWeekHours?.reduce((sum, entry) => sum + entry.hours, 0) || 0,
        avgHoursPerDay: thisWeekHours ? (thisWeekHours.reduce((sum, entry) => sum + entry.hours, 0) / 7) : 0
      })
    }
    
    if (reportType === 'department') {
      // Get hours by department
      const { data: departmentData } = await supabase
        .from('time_entries')
        .select(`
          hours,
          staff:staff_id(department)
        `)
      
      const departmentHours: Record<string, number> = {}
      departmentData?.forEach(entry => {
        const dept = entry.staff?.department || 'Unknown'
        departmentHours[dept] = (departmentHours[dept] || 0) + entry.hours
      })

      return NextResponse.json(
        Object.entries(departmentHours).map(([department, hours]) => ({
          department,
          hours
        }))
      )
    }

    if (reportType === 'project') {
      // Get hours by project
      let query = supabase
        .from('time_entries')
        .select(`
          hours,
          project:project_id(id, name, client)
        `)

      if (startDate) query = query.gte('date', startDate)
      if (endDate) query = query.lte('date', endDate)

      const { data: projectData } = await query

      const projectHours: Record<string, { name: string; client?: string; hours: number }> = {}
      projectData?.forEach(entry => {
        const projectId = entry.project?.id
        if (projectId) {
          if (!projectHours[projectId]) {
            projectHours[projectId] = {
              name: entry.project?.name || 'Unknown',
              client: entry.project?.client,
              hours: 0
            }
          }
          projectHours[projectId].hours += entry.hours
        }
      })

      return NextResponse.json(Object.values(projectHours))
    }

    return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}