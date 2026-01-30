import MindMapWrapper from '@/components/mind-map-wrapper'

export default function MindMapPage() {
  return (
    <main className="w-full h-full flex flex-col">
       <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Mind Map</h1>
        <p className="text-gray-500">Visualizing the connections between your thoughts.</p>
      </div>

      <div className="w-full h-[600px] border rounded-xl overflow-hidden shadow-sm bg-gray-50">
        {/* Just render the wrapper */}
        <MindMapWrapper />
      </div>
    </main>
  )
}