import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data', 'applications.json')

async function readApplications() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

async function writeApplications(applications: unknown[]) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify(applications, null, 2))
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const applications = await readApplications()

    const newApplication = {
      id: Date.now(),
      submittedAt: new Date().toISOString(),
      status: 'new',
      ...body,
    }

    applications.push(newApplication)
    await writeApplications(applications)

    return NextResponse.json({ success: true, id: newApplication.id })
  } catch (error) {
    console.error('Error saving application:', error)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const applications = await readApplications()
    return NextResponse.json(applications)
  } catch {
    return NextResponse.json([])
  }
}
