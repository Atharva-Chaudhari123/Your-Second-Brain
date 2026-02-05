'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return

  // Create a new blank page
  const { data: page, error } = await supabase
    .from('pages')
    .insert({
      user_id: user.id,
      title: 'Untitled Page',
      icon: '📄'
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating page:', error)
    return
  }

  // Also create the empty content entry for it (Table B)
  await supabase.from('page_contents').insert({
    page_id: page.id,
    content: [] // Empty JSON array for blocks
  })

  revalidatePath('/dashboard/Knowledge-Store')
  redirect(`/dashboard/Knowledge-Store/${page.id}`)
}

export async function deletePage(pageId: string) {
  const supabase = await createClient()
  await supabase.from('pages').delete().eq('id', pageId)
  revalidatePath('/dashboard/Knowledge-Store')
}