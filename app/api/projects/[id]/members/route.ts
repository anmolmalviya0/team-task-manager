import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { email } = await req.json()
  console.log("adding member:", email)

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  // check if already a member
  const existing = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: params.id, userId: user.id } },
  })

  if (existing) {
    return NextResponse.json({ error: "Already a member" }, { status: 400 })
  }

  const member = await prisma.projectMember.create({
    data: {
      projectId: params.id,
      userId: user.id,
    },
    include: { user: { select: { id: true, name: true, email: true } } },
  })

  return NextResponse.json(member, { status: 201 })
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { userId } = await req.json()

  try {
    await prisma.projectMember.delete({
      where: { projectId_userId: { projectId: params.id, userId } },
    })
  } catch (err) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 })
  }

  return NextResponse.json({ message: "Member removed" })
}
