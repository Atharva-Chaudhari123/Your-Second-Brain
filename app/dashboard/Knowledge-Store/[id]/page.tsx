import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import PageEditor from '@/components/knowledge/editor'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function KnowledgePage({ params }: PageProps) {
  const supabase = await createClient()
  const { id } = await params

  // 1. Fetch Metadata (Table A)
  const { data: page } = await supabase
    .from('pages')
    .select('*')
    .eq('id', id)
    .single()

  if (!page) {
    notFound()
  }

  // 2. Fetch Content (Table B)
  const { data: pageContent } = await supabase
    .from('page_contents')
    .select('content, ai_summary')
    .eq('page_id', id)
    .single()

  return (
    <main className="w-full min-h-screen bg-white">
      <PageEditor 
        pageId={page.id}
        initialTitle={page.title}
        initialContent={pageContent?.content || { text: "" }}
        initialSummary={pageContent?.ai_summary || null}
      />
    </main>
  )
}