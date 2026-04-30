import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { ownerId: session.user.id },
        { members: { some: { userId: session.user.id } } },
      ],
    },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      members: { include: { user: { select: { id: true, name: true, email: true } } } },
      tasks: { select: { status: true } },
      _count: { select: { tasks: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(projects)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Only admins can create projects" }, { status: 403 })
  }

  const { name, description } = await req.json()

  if (!name) {
    return NextResponse.json({ error: "Project name is required" }, { status: 400 })
  }

  const project = await prisma.project.create({
    data: {
      name,
      description,
      ownerId: session.user.id,
    },
  })

  return NextResponse.json(project, { status: 201 })
}
