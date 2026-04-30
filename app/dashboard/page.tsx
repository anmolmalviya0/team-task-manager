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

interface Activity {
  id: string
  action: string
  details: string | null
  createdAt: string
  user: { name: string }
}

function SkeletonCard() {
  return (
    <div className="bg-white p-4 rounded-lg border animate-pulse">
      <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
      <div className="h-6 bg-gray-200 rounded w-12"></div>
    </div>
  )
}

function SkeletonList() {
  return (
    <div className="bg-white rounded-lg border p-4 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
      <div className="space-y-3">
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("ALL")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetch("/api/dashboard")
        .then((r) => r.json())
        .then((data) => {
          setProjects(data.projects || [])
          setTasks(data.tasks || [])
          setActivities(data.activities || [])
        })
        .catch(() => console.error("Failed to load dashboard"))
        .finally(() => setLoading(false))
    }
  }, [session])

  if (status === "loading" || loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SkeletonList />
          <SkeletonList />
          <SkeletonList />
        </div>
      </div>
    )
  }

  const todoCount = tasks.filter((t) => t.status === "TODO").length
  const inProgressCount = tasks.filter((t) => t.status === "IN_PROGRESS").length
  const doneCount = tasks.filter((t) => t.status === "DONE").length

  const overdueTasks = tasks.filter((t) => {
    if (!t.dueDate || t.status === "DONE") return false
    // const due = new Date(t.dueDate).toLocaleDateString()
    return new Date(t.dueDate) < new Date()
  })

  const myTasks = tasks.filter(
    (t) => t.assignedTo?.id === session?.user.id && t.status !== "DONE"
  )

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "ALL" || t.status === filterStatus
    return matchesSearch && matchesStatus
  })

  function formatAction(action: string) {
    const map: Record<string, string> = {
      created_task: "created",
      changed_status: "moved",
      updated_task: "updated",
      deleted_task: "deleted",
    }
    return map[action] || action
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "just now"
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Welcome back, {session?.user.name}
        </p>
      </div>

      {/* stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg border hover:shadow-sm transition-shadow">
          <p className="text-sm text-gray-500">Total Tasks</p>
          <p className="text-2xl font-bold mt-1">{tasks.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-l-4 border-l-yellow-400">
          <p className="text-sm text-gray-500">To Do</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{todoCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-l-4 border-l-blue-400">
          <p className="text-sm text-gray-500">In Progress</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{inProgressCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-l-4 border-l-green-400">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{doneCount}</p>
        </div>
      </div>

      {/* search and filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Status</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DONE">Done</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* overdue tasks */}
        <div className="bg-white rounded-lg border p-4">
          <h2 className="font-semibold text-red-600 mb-3">
            Overdue ({overdueTasks.length})
          </h2>
          {overdueTasks.length === 0 ? (
            <p className="text-sm text-gray-400">All caught up</p>
          ) : (
            <ul className="space-y-2">
              {overdueTasks.map((task) => (
                <li key={task.id} className="text-sm border-b pb-2 last:border-0">
                  <span className="font-medium">{task.title}</span>
                  <span className="block text-xs text-gray-400 mt-0.5">{task.project.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* my tasks */}
        <div className="bg-white rounded-lg border p-4">
          <h2 className="font-semibold mb-3">My Tasks ({myTasks.length})</h2>
          {myTasks.length === 0 ? (
            <p className="text-sm text-gray-400">Nothing assigned</p>
          ) : (
            <ul className="space-y-2">
              {myTasks.slice(0, 5).map((task) => (
                <li key={task.id} className="flex justify-between items-center text-sm border-b pb-2 last:border-0">
                  <span className="truncate mr-2">{task.title}</span>
                  <span className={`shrink-0 px-2 py-0.5 rounded text-xs ${
                    task.status === "TODO" ? "bg-yellow-100 text-yellow-700" :
                    "bg-blue-100 text-blue-700"
                  }`}>
                    {task.status === "IN_PROGRESS" ? "In Progress" : "To Do"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* recent activity */}
        <div className="bg-white rounded-lg border p-4">
          <h2 className="font-semibold mb-3">Recent Activity</h2>
          {activities.length === 0 ? (
            <p className="text-sm text-gray-400">No activity yet. Move a task to see it here.</p>
          ) : (
            <ul className="space-y-2">
              {activities.slice(0, 6).map((a) => (
                <li key={a.id} className="text-sm border-b pb-2 last:border-0">
                  <span className="font-medium">{a.user.name}</span>{" "}
                  <span className="text-gray-500">{formatAction(a.action)}</span>{" "}
                  <span className="text-gray-700">{a.details}</span>
                  <span className="block text-xs text-gray-400 mt-0.5">{timeAgo(a.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* filtered results */}
      {searchQuery || filterStatus !== "ALL" ? (
        <div className="mt-6 bg-white rounded-lg border p-4">
          <h2 className="font-semibold mb-3">
            Results ({filteredTasks.length})
          </h2>
          {filteredTasks.length === 0 ? (
            <p className="text-sm text-gray-400">No tasks match your filters</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-2 font-medium">Task</th>
                    <th className="pb-2 font-medium">Project</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.slice(0, 10).map((task) => (
                    <tr key={task.id} className="border-b last:border-0">
                      <td className="py-2 font-medium">{task.title}</td>
                      <td className="py-2 text-gray-500">{task.project.name}</td>
                      <td className="py-2">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          task.status === "TODO" ? "bg-yellow-100 text-yellow-700" :
                          task.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-700" :
                          "bg-green-100 text-green-700"
                        }`}>
                          {task.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-2">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          task.priority === "HIGH" ? "bg-red-100 text-red-700" :
                          task.priority === "MEDIUM" ? "bg-orange-100 text-orange-700" :
                          "bg-gray-100 text-gray-600"
                        }`}>
                          {task.priority}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}

      {/* projects */}
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
          {projects.map((project: any) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="bg-white p-4 rounded-lg border hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <h3 className="font-medium">{project.name}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {project._count?.tasks || 0} tasks
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
