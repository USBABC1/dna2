// src/app/dashboard/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import AudioRecorder from '@/components/AudioRecorder'
import { Button } from '@/components/ui/button'

export default async function Dashboard() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  const signOut = async () => {
    'use server'

    const supabase = createClient()
    await supabase.auth.signOut()
    return redirect('/')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="absolute top-4 right-4 flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-300">Olá, {user.email}</span>
            <form action={signOut}>
                <Button variant="outline">Sair</Button>
            </form>
        </div>
        
        <div className="w-full max-w-2xl">
            <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-gray-200">
                Gravador e Analisador de Áudio
            </h1>
            <AudioRecorder />
        </div>
    </div>
  )
}
