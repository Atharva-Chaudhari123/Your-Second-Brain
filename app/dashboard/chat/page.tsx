import ChatInterface from '@/components/chat-interface'

export default function ChatPage() {
  return (
    <main className="w-full max-w-3xl mx-auto h-[80vh] flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Chat with Brain</h1>
        <p className="text-gray-500">Ask questions about your notes, code snippets, and ideas.</p>
      </div>
      
      {/* We wrap it in a div to take up remaining height */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border overflow-hidden">
        <ChatInterface />
      </div>
    </main>
  )
}