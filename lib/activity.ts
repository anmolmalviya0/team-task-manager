import prisma from "./prisma"

export async function logActivity(
  projectId: string,
  userId: string,
  action: string,
  details?: string
) {
  await prisma.activity.create({
    data: { projectId, userId, action, details },
  })
}
