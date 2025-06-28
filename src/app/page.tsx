// src/app/page.tsx
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function HomePage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Se o usuário já estiver logado, redireciona para o dashboard
  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-8">
      <h1 className="text-5xl font-extrabold tracking-tight mb-4">
        Bem-vindo ao DNAv2
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl">
        Grave, transcreva e analise áudios com o poder da inteligência artificial. Faça login para começar.
      </p>
      <Link href="/login">
        <Button size="lg">Acessar Plataforma</Button>
      </Link>
    </div>
  )
}
