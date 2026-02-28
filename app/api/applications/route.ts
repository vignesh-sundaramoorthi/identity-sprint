import { NextRequest, NextResponse } from 'next/server'

// Use Vercel KV if available, otherwise fall back to in-memory (dev)
let kv: {
  lpush: (key: string, ...values: string[]) => Promise<number>
  lrange: (key: string, start: number, end: number) => Promise<string[]>
} | null = null

async function getKV() {
  if (kv) return kv
  try {
    const { kv: vercelKV } = await import('@vercel/kv')
    kv = vercelKV
    return kv
  } catch {
    return null
  }
}

// In-memory fallback for local dev
const inMemoryApplications: string[] = []

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const newApplication = {
      id: Date.now(),
      submittedAt: new Date().toISOString(),
      status: 'new',
      ...body,
    }

    const store = await getKV()
    if (store) {
      await store.lpush('applications', JSON.stringify(newApplication))
    } else {
      inMemoryApplications.unshift(JSON.stringify(newApplication))
    }

    return NextResponse.json({ success: true, id: newApplication.id })
  } catch (error) {
    console.error('Error saving application:', error)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const store = await getKV()
    let rawItems: string[] = []

    if (store) {
      rawItems = await store.lrange('applications', 0, -1)
    } else {
      rawItems = inMemoryApplications
    }

    const applications = rawItems.map((item) => {
      try { return JSON.parse(item) } catch { return null }
    }).filter(Boolean)

    return NextResponse.json(applications)
  } catch (error) {
    console.error('Error reading applications:', error)
    return NextResponse.json([])
  }
}
