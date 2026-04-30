import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const tasks = await prisma.task.findMany({
    where: { projectId: params.id },
    include: {
      assignedTo: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(tasks)
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { title, description, priority, dueDate, assignedToId } = await req.json()

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 })
  }

  const task = await prisma.task.create({
    data: {
      title,
      description,
      priority: priority || "MEDIUM",
      dueDate: dueDate ? new Date(dueDate) : null,
      projectId: params.id,
      createdById: session.user.id,
      assignedToId: assignedToId || null,
    },
    include: {
      assignedTo: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json(task, { status: 201 })
}
