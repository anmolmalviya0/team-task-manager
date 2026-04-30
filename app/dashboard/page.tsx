"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"

interface Task {
  id: string
  title: string
  status: string
  priority: string
  dueDate: string | null
  project: { id: string; name: string }
  assignedTo: { id: string; name: string } | null
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchDashboardData()
    }
  }, [session])

  async function fetchDashboardData() {
    try {
      const projectsRes = await fetch("/api/projects")
      const projectsData = await projectsRes.json()
      setProjects(projectsData)

      // get all tasks from all projects
      const allTasks: Task[] = []
      for (const project of projectsData) {
        const tasksRes = await fetch(`/api/projects/${project.id}/tasks`)
        const tasksData = await tasksRes.json()
        allTasks.push(
          ...tasksData.map((t: any) => ({ ...t, project: { id: project.id, name: project.name } }))
        )
      }
      setTasks(allTasks)
    } catch {
      console.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return <p className="text-gray-500">Loading dashboard...</p>
  }

  const todoCount = tasks.filter((t) => t.status === "TODO").length
  const inProgressCount = tasks.filter((t) => t.status === "IN_PROGRESS").length
  const doneCount = tasks.filter((t) => t.status === "DONE").length

  const overdueTasks = tasks.filter((t) => {
    if (!t.dueDate || t.status === "DONE") return false
    return new Date(t.dueDate) < new Date()
  })

  const myTasks = tasks.filter(
    (t) => t.assignedTo?.id === session?.user.id && t.status !== "DONE"
  )

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-500">Total Tasks</p>
          <p className="text-2xl font-bold">{tasks.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-500">To Do</p>
          <p className="text-2xl font-bold text-yellow-600">{todoCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-500">In Progress</p>
          <p className="text-2xl font-bold text-blue-600">{inProgressCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-2xl font-bold text-green-600">{doneCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* overdue tasks */}
        <div className="bg-white rounded-lg border p-4">
          <h2 className="font-semibold text-red-600 mb-3">
            Overdue Tasks ({overdueTasks.length})
          </h2>
          {overdueTasks.length === 0 ? (
            <p className="text-sm text-gray-500">No overdue tasks</p>
          ) : (
            <ul className="space-y-2">
              {overdueTasks.map((task) => (
                <li key={task.id} className="flex justify-between items-center text-sm">
                  <span>{task.title}</span>
                  <span className="text-gray-400">{task.project.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* my tasks */}
        <div className="bg-white rounded-lg border p-4">
          <h2 className="font-semibold mb-3">My Tasks ({myTasks.length})</h2>
          {myTasks.length === 0 ? (
            <p className="text-sm text-gray-500">No tasks assigned to you</p>
          ) : (
            <ul className="space-y-2">
              {myTasks.slice(0, 5).map((task) => (
                <li key={task.id} className="flex justify-between items-center text-sm">
                  <span>{task.title}</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    task.status === "TODO" ? "bg-yellow-100 text-yellow-700" :
                    "bg-blue-100 text-blue-700"
                  }`}>
                    {task.status.replace("_", " ")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* projects overview */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold">Projects ({projects.length})</h2>
          {session?.user.role === "ADMIN" && (
            <Link
              href="/projects/new"
              className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700"
            >
              New Project
            </Link>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {projects.slice(0, 6).map((project: any) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="bg-white p-4 rounded-lg border hover:border-blue-300 transition-colors"
            >
              <h3 className="font-medium">{project.name}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {project._count.tasks} tasks
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
