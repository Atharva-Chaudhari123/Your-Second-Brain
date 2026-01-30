'use client'

import dynamic from 'next/dynamic'

// This handles the "No SSR" logic safely
const KnowledgeGraph = dynamic(() => import('@/components/knowledge-graph'), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
      Loading Neural Network...
    </div>
  )
})

export default function MindMapWrapper() {
  return <KnowledgeGraph />
}