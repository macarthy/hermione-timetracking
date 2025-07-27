'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Download, Calendar, Clock, Filter } from 'lucide-react'
import { TimeEntry } from '@/lib/supabase'

export default function TimeReports() {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [filteredEntries, setFilteredEntries] = useState<TimeEntry[]>([])
  const [filters, setFilters] = useState({
    staffId: '',
    projectId: '',
    startDate: '',
    endDate: '',
    department: ''
  })

  useEffect(() => {
    fetchTimeEntries()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [timeEntries, filters])

  const fetchTimeEntries = async () => {
    try {
      const response = await fetch('/api/time-entries')
      const data = await response.json()
      setTimeEntries(data || [])
    } catch (error) {
      console.error('Failed to fetch time entries:', error)
    }
  }

  const applyFilters = () => {
    let filtered = timeEntries

    if (filters.staffId) {
      filtered = filtered.filter(entry => entry.staff_id === filters.staffId)
    }

    if (filters.projectId) {
      filtered = filtered.filter(entry => entry.project_id === filters.projectId)
    }

    if (filters.startDate) {
      filtered = filtered.filter(entry => entry.date >= filters.startDate)
    }

    if (filters.endDate) {
      filtered = filtered.filter(entry => entry.date <= filters.endDate)
    }

    setFilteredEntries(filtered)
  }

  const exportToCSV = () => {
    const headers = ['Date', 'Staff', 'Project', 'Description', 'Hours']
    const csvData = filteredEntries.map(entry => [
      entry.date,
      entry.staff?.name || 'N/A',
      entry.project?.name || 'N/A',
      entry.description,
      entry.hours
    ])

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `time-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const getTotalHours = () => {
    return filteredEntries.reduce((total, entry) => total + entry.hours, 0)
  }

  const getUniqueStaff = () => {
    const staffMap = new Map()
    timeEntries.forEach(entry => {
      if (entry.staff) {
        staffMap.set(entry.staff.id, entry.staff)
      }
    })
    return Array.from(staffMap.values())
  }

  const getUniqueProjects = () => {
    const projectMap = new Map()
    timeEntries.forEach(entry => {
      if (entry.project) {
        projectMap.set(entry.project.id, entry.project)
      }
    })
    return Array.from(projectMap.values())
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Time Reports</h1>
          <p className="text-muted-foreground">
            View and export time tracking reports
          </p>
        </div>
        <Button onClick={exportToCSV}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </CardTitle>
          <CardDescription>
            Filter time entries by staff, project, or date range
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Staff Member</label>
              <Select onValueChange={(value) => setFilters({...filters, staffId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All staff" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All staff</SelectItem>
                  {getUniqueStaff().map((staff: any) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Project</label>
              <Select onValueChange={(value) => setFilters({...filters, projectId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All projects</SelectItem>
                  {getUniqueProjects().map((project: any) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Start Date</label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({...filters, startDate: e.target.value})}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">End Date</label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({...filters, endDate: e.target.value})}
              />
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => setFilters({staffId: '', projectId: '', startDate: '', endDate: '', department: ''})}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalHours().toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              From {filteredEntries.length} entries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(filteredEntries.map(e => e.staff_id)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Staff members with entries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Hours/Entry</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredEntries.length > 0 ? (getTotalHours() / filteredEntries.length).toFixed(1) : '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Average per time entry
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Time Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Time Entries</CardTitle>
          <CardDescription>
            Detailed view of all time entries matching your filters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Staff Member</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Department</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{entry.staff?.name || 'N/A'}</p>
                      <p className="text-sm text-muted-foreground">{entry.staff?.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{entry.project?.name || 'N/A'}</p>
                      {entry.project?.client && (
                        <p className="text-sm text-muted-foreground">{entry.project.client}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{entry.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{entry.hours}h</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {entry.staff?.department || 'N/A'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}