import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // create admin user
  const admin = await prisma.user.upsert({
    where: { email: "anmol@taskflow.dev" },
    update: {},
    create: {
      email: "anmol@taskflow.dev",
      name: "Anmol Malviya",
      password: await bcrypt.hash("admin123", 10),
      role: "ADMIN",
    },
  })

  // create member user
  const member = await prisma.user.upsert({
    where: { email: "priya@taskflow.dev" },
    update: {},
    create: {
      email: "priya@taskflow.dev",
      name: "Priya Sharma",
      password: await bcrypt.hash("member123", 10),
      role: "MEMBER",
    },
  })

  // create projects
  const project1 = await prisma.project.create({
    data: {
      name: "E-Commerce Platform Redesign",
      description: "Revamp the frontend and improve checkout flow for better conversion",
      ownerId: admin.id,
    },
  })

  const project2 = await prisma.project.create({
    data: {
      name: "Mobile App MVP",
      description: "Build initial version of the mobile app with core features",
      ownerId: admin.id,
    },
  })

  // add member to project
  await prisma.projectMember.create({
    data: { projectId: project1.id, userId: member.id },
  })
  await prisma.projectMember.create({
    data: { projectId: project2.id, userId: member.id },
  })

  // create tasks for project 1
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 7)

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  await prisma.task.createMany({
    data: [
      {
        title: "Design new product page layout",
        description: "Create wireframes and mockups for the updated product page",
        status: "DONE",
        priority: "HIGH",
        projectId: project1.id,
        createdById: admin.id,
        assignedToId: member.id,
        dueDate: yesterday,
      },
      {
        title: "Implement cart API endpoints",
        status: "IN_PROGRESS",
        priority: "HIGH",
        projectId: project1.id,
        createdById: admin.id,
        assignedToId: admin.id,
        dueDate: tomorrow,
      },
      {
        title: "Setup payment gateway integration",
        description: "Integrate Razorpay for handling payments",
        status: "TODO",
        priority: "HIGH",
        projectId: project1.id,
        createdById: admin.id,
        assignedToId: member.id,
        dueDate: nextWeek,
      },
      {
        title: "Write unit tests for checkout flow",
        status: "TODO",
        priority: "MEDIUM",
        projectId: project1.id,
        createdById: admin.id,
        dueDate: nextWeek,
      },
      {
        title: "Fix responsive issues on mobile",
        status: "IN_PROGRESS",
        priority: "MEDIUM",
        projectId: project1.id,
        createdById: member.id,
        assignedToId: member.id,
        dueDate: yesterday, // overdue!
      },
      {
        title: "Update product image lazy loading",
        status: "DONE",
        priority: "LOW",
        projectId: project1.id,
        createdById: admin.id,
        assignedToId: admin.id,
      },
    ],
  })

  // tasks for project 2
  await prisma.task.createMany({
    data: [
      {
        title: "Setup React Native project",
        status: "DONE",
        priority: "HIGH",
        projectId: project2.id,
        createdById: admin.id,
        assignedToId: admin.id,
      },
      {
        title: "Build authentication screens",
        status: "IN_PROGRESS",
        priority: "HIGH",
        projectId: project2.id,
        createdById: admin.id,
        assignedToId: member.id,
        dueDate: tomorrow,
      },
      {
        title: "Design app navigation structure",
        status: "TODO",
        priority: "MEDIUM",
        projectId: project2.id,
        createdById: admin.id,
        dueDate: nextWeek,
      },
      {
        title: "Implement push notifications",
        status: "TODO",
        priority: "LOW",
        projectId: project2.id,
        createdById: member.id,
        assignedToId: admin.id,
        dueDate: nextWeek,
      },
    ],
  })

  console.log("Seed data created successfully")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
