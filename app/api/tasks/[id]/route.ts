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

  const task = await prisma.task.findUnique({
    where: { id: params.id },
    include: {
      assignedTo: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true } },
      project: { select: { id: true, name: true } },
    },
  })

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 })
  }

  return NextResponse.json(task)
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()

  // members can only update status of tasks assigned to them
  if (session.user.role === "MEMBER") {
    const task = await prisma.task.findUnique({ where: { id: params.id } })
    if (!task) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    if (task.assignedToId !== session.user.id && task.createdById !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
  }

  const updateData: any = {}
  if (body.title) updateData.title = body.title
  if (body.description !== undefined) updateData.description = body.description
  if (body.status) updateData.status = body.status
  if (body.priority) updateData.priority = body.priority
  if (body.dueDate !== undefined) updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null
  if (body.assignedToId !== undefined) updateData.assignedToId = body.assignedToId

  const updated = await prisma.task.update({
    where: { id: params.id },
    data: updateData,
    include: {
      assignedTo: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const task = await prisma.task.findUnique({ where: { id: params.id } })
  if (!task) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  // only admin or task creator can delete
  if (session.user.role !== "ADMIN" && task.createdById !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await prisma.task.delete({ where: { id: params.id } })

  return NextResponse.json({ message: "Task deleted" })
}
