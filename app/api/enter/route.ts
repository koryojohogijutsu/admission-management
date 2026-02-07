import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const className = searchParams.get('class')

  if (!className) {
    return NextResponse.json(
      { error: 'class is required' },
      { status: 400 }
    )
  }

  return NextResponse.redirect(
    new URL('/done', request.url)
  )
}
