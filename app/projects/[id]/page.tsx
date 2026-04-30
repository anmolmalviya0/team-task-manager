"use client"

import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"

interface Task {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  dueDate: string | null
  assignedTo: { id: string; name: string } | null
  createdBy: { id: string; name: string }
}

interface Project {
  id: string
  name: string
  description: string | null
  owner: { id: string; name: string; email: string }
  members: { user: { id: string; name: string; email: string } }[]
  tasks: Task[]
}

export default function ProjectDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [memberEmail, setMemberEmail] = useState("")
  const [addingMember, setAddingMember] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => {
    if (session && params.id) {
      fetchProject()
    }
  }, [session, params.id])

  async function fetchProject() {
    const res = await fetch(`/api/projects/${params.id}`)
    if (res.ok) {
      setProject(await res.json())
    }
    setLoading(false)
  }

  async function updateTaskStatus(taskId: string, newStatus: string) {
    await fetch(`/api/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
    fetchProject()
  }

  async function deleteTask(taskId: string) {
    if (!confirm("Delete this task?")) return
    await fetch(`/api/tasks/${taskId}`, { method: "DELETE" })
    fetchProject()
  }

  async function addMember(e: React.FormEvent) {
    e.preventDefault()
    setAddingMember(true)
    const res = await fetch(`/api/projects/${params.id}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: memberEmail }),
    })
    if (res.ok) {
      setMemberEmail("")
      fetchProject()
    } else {
      const data = await res.json()
      alert(data.error || "Failed to add member")
    }
    setAddingMember(false)
  }

  async function removeMember(userId: string) {
    if (!confirm("Remove this member?")) return
    await fetch(`/api/projects/${params.id}/members`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    })
    fetchProject()
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-96 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-100 rounded-lg p-3 h-48"></div>
          ))}
        </div>
      </div>
    )
  }
  if (!project) return <p className="text-red-500">Project not found</p>

  const todoTasks = project.tasks.filter((t) => t.status === "TODO")
  const inProgressTasks = project.tasks.filter((t) => t.status === "IN_PROGRESS")
  const doneTasks = project.tasks.filter((t) => t.status === "DONE")

  const isAdmin = session?.user.role === "ADMIN"

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          {project.description && (
            <p className="text-gray-500 mt-1">{project.description}</p>
          )}
        </div>
        <Link
          href={`/projects/${project.id}/tasks/new`}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
        >
          Add Task
        </Link>
      </div>

      {/* task board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* TODO column */}
        <div className="bg-yellow-50 rounded-lg p-3">
          <h3 className="font-medium text-yellow-800 mb-3">
            To Do ({todoTasks.length})
          </h3>
          <div className="space-y-2">
            {todoTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={updateTaskStatus}
                onDelete={deleteTask}
                isAdmin={isAdmin}
                currentUserId={session?.user.id || ""}
              />
            ))}
          </div>
        </div>

        {/* IN PROGRESS column */}
        <div className="bg-blue-50 rounded-lg p-3">
          <h3 className="font-medium text-blue-800 mb-3">
            In Progress ({inProgressTasks.length})
          </h3>
          <div className="space-y-2">
            {inProgressTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={updateTaskStatus}
                onDelete={deleteTask}
                isAdmin={isAdmin}
                currentUserId={session?.user.id || ""}
              />
            ))}
          </div>
        </div>

        {/* DONE column */}
        <div className="bg-green-50 rounded-lg p-3">
          <h3 className="font-medium text-green-800 mb-3">
            Done ({doneTasks.length})
          </h3>
          <div className="space-y-2">
            {doneTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={updateTaskStatus}
                onDelete={deleteTask}
                isAdmin={isAdmin}
                currentUserId={session?.user.id || ""}
              />
            ))}
          </div>
        </div>
      </div>

      {/* team members section */}
      <div className="bg-white rounded-lg border p-4">
        <h2 className="font-semibold mb-3">Team Members</h2>
        <ul className="space-y-2 mb-4">
          <li className="flex justify-between items-center text-sm">
            <span>{project.owner.name} ({project.owner.email})</span>
            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">Owner</span>
          </li>
          {project.members.map((m) => (
            <li key={m.user.id} className="flex justify-between items-center text-sm">
              <span>{m.user.name} ({m.user.email})</span>
              {isAdmin && (
                <button
                  onClick={() => removeMember(m.user.id)}
                  className="text-red-500 text-xs hover:underline"
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>

        {isAdmin && (
          <form onSubmit={addMember} className="flex gap-2">
            <input
              type="email"
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              placeholder="Enter member email"
              className="flex-1 px-3 py-1.5 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              disabled={addingMember}
              className="bg-gray-800 text-white px-3 py-1.5 rounded text-sm hover:bg-gray-900 disabled:opacity-50"
            >
              Add
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

function TaskCard({
  task,
  onStatusChange,
  onDelete,
  isAdmin,
  currentUserId,
}: {
  task: Task
  onStatusChange: (id: string, status: string) => void
  onDelete: (id: string) => void
  isAdmin: boolean
  currentUserId: string
}) {
  const canModify = isAdmin || task.assignedTo?.id === currentUserId || task.createdBy.id === currentUserId

  const priorityColors: Record<string, string> = {
    LOW: "bg-gray-100 text-gray-600",
    MEDIUM: "bg-orange-100 text-orange-700",
    HIGH: "bg-red-100 text-red-700",
  }

  return (
    <div className="bg-white p-3 rounded border shadow-sm">
      <div className="flex justify-between items-start">
        <h4 className="font-medium text-sm">{task.title}</h4>
        <span className={`text-xs px-1.5 py-0.5 rounded ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
      </div>
      {task.description && (
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>
      )}
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {task.assignedTo ? task.assignedTo.name : "Unassigned"}
        </span>
        {task.dueDate && (
          <span className={`text-xs ${
            new Date(task.dueDate) < new Date() && task.status !== "DONE"
              ? "text-red-500" : "text-gray-400"
          }`}>
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>
      {canModify && (
        <div className="mt-2 flex gap-1 flex-wrap">
          {task.status !== "TODO" && (
            <button onClick={() => onStatusChange(task.id, "TODO")} className="text-xs px-2 py-0.5 bg-yellow-100 rounded hover:bg-yellow-200">
              To Do
            </button>
          )}
          {task.status !== "IN_PROGRESS" && (
            <button onClick={() => onStatusChange(task.id, "IN_PROGRESS")} className="text-xs px-2 py-0.5 bg-blue-100 rounded hover:bg-blue-200">
              In Progress
            </button>
          )}
          {task.status !== "DONE" && (
            <button onClick={() => onStatusChange(task.id, "DONE")} className="text-xs px-2 py-0.5 bg-green-100 rounded hover:bg-green-200">
              Done
            </button>
          )}
          <button onClick={() => onDelete(task.id)} className="text-xs px-2 py-0.5 bg-red-50 text-red-600 rounded hover:bg-red-100">
            Delete
          </button>
        </div>
      )}
    </div>
  )
}
