"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"

export default function ProjectsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetch("/api/projects")
        .then((r) => r.json())
        .then(setProjects)
        .finally(() => setLoading(false))
    }
  }, [session])

  if (loading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-5 rounded-lg border animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        {session?.user.role === "ADMIN" && (
          <Link
            href="/projects/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Create Project
          </Link>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 text-center">
          <p className="text-gray-500">No projects yet.</p>
          {session?.user.role === "ADMIN" && (
            <Link href="/projects/new" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
              Create your first project
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="bg-white p-5 rounded-lg border hover:border-blue-300 transition-colors"
            >
              <h3 className="font-semibold text-lg">{project.name}</h3>
              {project.description && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {project.description}
                </p>
              )}
              <div className="flex gap-4 mt-3 text-sm text-gray-500">
                <span>{project._count.tasks} tasks</span>
                <span>{project.members.length + 1} members</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Owner: {project.owner.name}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
