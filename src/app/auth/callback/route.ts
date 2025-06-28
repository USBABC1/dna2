// src/app/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // se 'next' for no cookie, usar ele, senão, usar '/'
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // retornar para uma página de erro de autenticação
  console.error("Auth callback error: No code or session exchange failed.");
  return NextResponse.redirect(`${origin}/login?message=Authentication failed. Please try again.`);
}
