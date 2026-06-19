
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'capture' | 'connections' | 'recall'>('capture')
  const [typedText, setTypedText] = useState('')
  const fullText = "Create a database schema for user profiles with automatic metadata extraction..."

  useEffect(() => {
    if (activeTab !== 'capture') {
      setTypedText('')
      return
    }
    let index = 0
    const interval = setInterval(() => {
      setTypedText(fullText.slice(0, index + 1))
      index++
      if (index >= fullText.length) {
        clearInterval(interval)
      }
    }, 40)
    return () => clearInterval(interval)
  }, [activeTab])

  return (
    <div className="min-h-screen bg-[#0A0D16] text-gray-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden relative">
      
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-purple-900/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[10%] w-[50vw] h-[50vw] rounded-full bg-blue-900/10 blur-[130px] pointer-events-none" />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370a_1px,transparent_1px),linear-gradient(to_bottom,#1f29370a_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md border-b border-gray-800/40 bg-[#0A0D16]/70 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-amber-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-xl font-bold text-white">🧠</span>
            </div>
            <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
              Second Brain
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <a href="#features" className="hover:text-white transition-colors duration-200">Features</a>
            <a href="#sandbox" className="hover:text-white transition-colors duration-200">Sandbox</a>
            <a href="#faq" className="hover:text-white transition-colors duration-200">FAQ</a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors duration-200">Github</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm font-semibold hover:text-white text-gray-400 transition-colors duration-200"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="relative group overflow-hidden rounded-xl p-[1px] focus:outline-none"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 rounded-xl transition-all group-hover:scale-105" />
              <div className="px-4 py-2 bg-[#0F1322] rounded-[11px] relative text-sm font-semibold text-white transition-colors group-hover:bg-transparent">
                Launch Brain &rarr;
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        
        {/* Glow Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-950/20 text-xs font-semibold text-indigo-300 mb-8 animate-fade-in shadow-inner shadow-indigo-900/40">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          Now with Auto-Categorization & Spaced Repetition
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-tight md:leading-[1.1] mb-6">
          Your Personal Knowledge OS{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-amber-400 bg-clip-text text-transparent">
            That Never Forgets
          </span>
        </h1>

        {/* Hero Description */}
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed font-light">
          A lightning-fast workspace to capture thoughts, store temporary tasks, build semantic connection graphs, and study via AI-generated flashcards.
        </p>

        {/* Hero CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16 w-full sm:w-auto">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold transition-all shadow-lg shadow-indigo-500/20 hover:scale-[1.02] text-center"
          >
            Start Capture Free
          </Link>
          <a
            href="#sandbox"
            className="w-full sm:w-auto px-8 py-4 rounded-xl border border-gray-800 bg-[#0F1322]/80 hover:bg-[#151B2E] text-gray-300 font-semibold transition-all hover:border-gray-700 text-center"
          >
            Explore Sandbox
          </a>
        </div>

        {/* Floating Cards Graphic */}
        <div className="w-full max-w-5xl mx-auto relative rounded-2xl border border-gray-800/60 bg-[#0C101F]/80 p-4 md:p-6 shadow-2xl shadow-indigo-950/20">
          
          {/* Card Window Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-800/40 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
            </div>
            <div className="px-4 py-1 rounded-md bg-[#0F1424] border border-gray-800/50 text-[10px] md:text-xs text-gray-500 font-mono">
              http://localhost:3000/dashboard
            </div>
            <div className="w-12" /> {/* spacer */}
          </div>

          {/* Dummy UI Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 text-left">
            {/* Left sidebar Mock */}
            <div className="space-y-2 lg:block hidden border-r border-gray-800/30 pr-4">
              <div className="h-8 rounded bg-indigo-950/30 border border-indigo-900/30 flex items-center px-3 text-xs text-indigo-300 font-medium">
                🧠 Dashboard
              </div>
              <div className="h-8 rounded hover:bg-gray-800/20 flex items-center px-3 text-xs text-gray-500">
                ⏳ Temporary Store
              </div>
              <div className="h-8 rounded hover:bg-gray-800/20 flex items-center px-3 text-xs text-gray-500">
                🧠 Brainstorm Graph
              </div>
              <div className="h-8 rounded hover:bg-gray-800/20 flex items-center px-3 text-xs text-gray-500">
                🗂️ Flashcards
              </div>
              <div className="pt-8 text-[10px] font-bold text-gray-600 tracking-wider uppercase px-3">
                Quick Tags
              </div>
              <div className="flex flex-wrap gap-1.5 p-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20">#ideas</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">#notes</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20">#schema</span>
              </div>
            </div>

            {/* Main Area Mock */}
            <div className="lg:col-span-3 space-y-6">
              {/* Capture Box */}
              <div className="p-5 rounded-xl border border-gray-800 bg-[#0E1326]/60 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    AI Ingestion Engine
                  </span>
                  <span className="text-[10px] font-mono text-gray-500 bg-gray-900 border border-gray-800 px-2 py-0.5 rounded">
                    Ctrl + K
                  </span>
                </div>
                <div className="h-20 bg-[#080B14] rounded-lg border border-gray-800/80 p-3 text-sm text-gray-400 font-mono">
                  Create a database schema for user profiles with automatic metadata extraction...
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-[11px] text-indigo-400">✨ Ready to parse, extract tags, & structure</span>
                  <div className="px-4 py-1.5 rounded bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white transition-all cursor-pointer">
                    Synthesize Note
                  </div>
                </div>
              </div>

              {/* Feed Mock */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-gray-500 tracking-wide uppercase">Recent Captures</div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Card 1 */}
                  <div className="p-4 rounded-xl border border-orange-500/20 bg-orange-950/5 hover:border-orange-500/40 transition-all space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-orange-400">⏳ Temporary Store</span>
                      <span className="text-[10px] text-orange-300 bg-orange-950/30 px-1.5 py-0.5 rounded">
                        29 days left
                      </span>
                    </div>
                    <p className="text-xs text-gray-300">Remember to review the microservices draft before client demo on Monday afternoon.</p>
                    <div className="flex gap-1.5">
                      <span className="text-[9px] bg-orange-900/20 text-orange-300 px-1.5 py-0.5 rounded">#client</span>
                      <span className="text-[9px] bg-orange-900/20 text-orange-300 px-1.5 py-0.5 rounded">#drafts</span>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-950/5 hover:border-purple-500/40 transition-all space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-purple-400">🧠 Facts & Synthesis</span>
                      <span className="text-[10px] text-purple-300 bg-purple-950/30 px-1.5 py-0.5 rounded">
                        Permanent
                      </span>
                    </div>
                    <p className="text-xs text-gray-300">Semantic cache limits DB loads by stores. Vector lookups index items with 95% threshold.</p>
                    <div className="flex gap-1.5">
                      <span className="text-[9px] bg-purple-900/20 text-purple-300 px-1.5 py-0.5 rounded">#caching</span>
                      <span className="text-[9px] bg-purple-900/20 text-purple-300 px-1.5 py-0.5 rounded">#vector-db</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Detail Grid */}
      <section id="features" className="py-24 border-t border-gray-900 bg-[#070911]/50 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
              Designed to Organize Your Digital Mind
            </h2>
            <p className="text-gray-400 text-base md:text-lg">
              Second Brain integrates powerful categorization and visual learning systems to optimize how you remember information.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Box 1: Smart Input */}
            <div className="p-8 rounded-2xl border border-gray-800 bg-[#0B0E1B] hover:border-gray-700 transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  📥
                </div>
                <h3 className="text-xl font-bold text-white">AI-Powered Ingestion</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Drop thoughts, documents, or links into the Smart Input. The AI automatically classifies facts, sets tags, and parses metadata instantly.
                </p>
              </div>
              <div className="mt-8 text-xs font-semibold text-indigo-400 flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                Learn more &rarr;
              </div>
            </div>

            {/* Box 2: Ephemeral Store */}
            <div className="p-8 rounded-2xl border border-gray-800 bg-[#0B0E1B] hover:border-gray-700 transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  ⏳
                </div>
                <h3 className="text-xl font-bold text-white">Temporary Store</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Capture thoughts that don't need to live forever. Ephemeral notes automatically expire in 30 days, keeping your brain clutter-free.
                </p>
              </div>
              <div className="mt-8 text-xs font-semibold text-orange-400 flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                Learn more &rarr;
              </div>
            </div>

            {/* Box 3: Spaced Repetition */}
            <div className="p-8 rounded-2xl border border-gray-800 bg-[#0B0E1B] hover:border-gray-700 transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  🗂️
                </div>
                <h3 className="text-xl font-bold text-white">AI Spaced Repetition</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Turn captured permanent facts into interactive flashcards automatically. Test your memory with active recall prompts generated by Gemini AI.
                </p>
              </div>
              <div className="mt-8 text-xs font-semibold text-emerald-400 flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                Learn more &rarr;
              </div>
            </div>

            {/* Box 4: Mind Maps */}
            <div className="p-8 rounded-2xl border border-gray-800 bg-[#0B0E1B] hover:border-gray-700 transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  🧠
                </div>
                <h3 className="text-xl font-bold text-white">Interactive Mind Maps</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Visualize your notes inside an interactive knowledge graph. Group facts into nodes, analyze connections, and map out concepts dynamically.
                </p>
              </div>
              <div className="mt-8 text-xs font-semibold text-purple-400 flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                Learn more &rarr;
              </div>
            </div>

            {/* Box 5: Unified Chat */}
            <div className="p-8 rounded-2xl border border-gray-800 bg-[#0B0E1B] hover:border-gray-700 transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  💬
                </div>
                <h3 className="text-xl font-bold text-white">AI Copilot Chat</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Chat directly with your notes. Ask questions like "Where did I save the notes about caching?" and receive summarized answers instantly.
                </p>
              </div>
              <div className="mt-8 text-xs font-semibold text-blue-400 flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                Learn more &rarr;
              </div>
            </div>

            {/* Box 6: Semantic Vector Search */}
            <div className="p-8 rounded-2xl border border-gray-800 bg-[#0B0E1B] hover:border-gray-700 transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  🔍
                </div>
                <h3 className="text-xl font-bold text-white">Semantic Search</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Don't rely on exact keywords. Query based on conceptual meaning, and let our system pull up relevant notes using vector similarity.
                </p>
              </div>
              <div className="mt-8 text-xs font-semibold text-amber-400 flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                Learn more &rarr;
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Sandbox Section */}
      <section id="sandbox" className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              Test-Drive the Brain Core
            </h2>
            <p className="text-gray-400 text-base md:text-lg leading-relaxed">
              Experience the core capabilities of the ingestion and mapping system. Select a mock module to simulate note processing.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => setActiveTab('capture')}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${
                  activeTab === 'capture'
                    ? 'border-indigo-500/40 bg-indigo-500/5 text-white'
                    : 'border-gray-800 hover:border-gray-700 text-gray-400'
                }`}
              >
                <div>
                  <div className="font-bold text-sm">1. AI Smart Capture</div>
                  <div className="text-xs text-gray-500 mt-0.5">Watch the agent parse your input real-time</div>
                </div>
                <span className="text-lg">📥</span>
              </button>

              <button
                onClick={() => setActiveTab('connections')}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${
                  activeTab === 'connections'
                    ? 'border-purple-500/40 bg-purple-500/5 text-white'
                    : 'border-gray-800 hover:border-gray-700 text-gray-400'
                }`}
              >
                <div>
                  <div className="font-bold text-sm">2. Semantic Connections</div>
                  <div className="text-xs text-gray-500 mt-0.5">Explore relational nodes in a 3D network</div>
                </div>
                <span className="text-lg">🧠</span>
              </button>

              <button
                onClick={() => setActiveTab('recall')}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${
                  activeTab === 'recall'
                    ? 'border-emerald-500/40 bg-emerald-500/5 text-white'
                    : 'border-gray-800 hover:border-gray-700 text-gray-400'
                }`}
              >
                <div>
                  <div className="font-bold text-sm">3. Spaced Recall Card</div>
                  <div className="text-xs text-gray-500 mt-0.5">Toggle and review generated study cards</div>
                </div>
                <span className="text-lg">🗂️</span>
              </button>
            </div>
          </div>

          {/* Sandbox Mock Window */}
          <div className="p-6 rounded-2xl border border-gray-800 bg-[#0B0D18] h-[360px] flex flex-col justify-between shadow-xl relative overflow-hidden">
            
            {/* Top Bar */}
            <div className="flex justify-between items-center border-b border-gray-800/40 pb-3">
              <span className="text-xs font-mono text-gray-500">interactive_sandbox.js</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            {/* Inner Content */}
            <div className="flex-1 flex flex-col justify-center py-4 relative z-10">
              {activeTab === 'capture' && (
                <div className="space-y-4">
                  <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">AI Streaming Ingestion</div>
                  <div className="p-3 bg-[#080B13] border border-gray-800 rounded-lg min-h-[80px] font-mono text-xs text-gray-300 leading-relaxed">
                    {typedText}
                    <span className="animate-pulse">|</span>
                  </div>
                  {typedText.length >= fullText.length && (
                    <div className="flex gap-2 animate-fade-in">
                      <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full">
                        #databases
                      </span>
                      <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                        #schema-design
                      </span>
                      <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">
                        Parsed: Permanent Fact
                      </span>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'connections' && (
                <div className="h-full flex items-center justify-center">
                  {/* Floating SVG Graph */}
                  <svg className="w-full h-full max-h-[220px]" viewBox="0 0 400 200">
                    <line x1="80" y1="100" x2="200" y2="60" stroke="#4f46e5" strokeWidth="1.5" strokeDasharray="3,3" />
                    <line x1="200" y1="60" x2="320" y2="100" stroke="#a855f7" strokeWidth="1.5" />
                    <line x1="200" y1="60" x2="200" y2="150" stroke="#f59e0b" strokeWidth="1.5" />
                    <line x1="80" y1="100" x2="200" y2="150" stroke="#9ca3af" strokeWidth="1" strokeOpacity="0.3" />

                    <circle cx="80" cy="100" r="14" fill="#1e1b4b" stroke="#4f46e5" strokeWidth="2" className="animate-pulse" />
                    <text x="80" y="104" textAnchor="middle" fill="#818cf8" fontSize="10" fontWeight="bold">DB</text>

                    <circle cx="200" cy="60" r="18" fill="#3b0764" stroke="#a855f7" strokeWidth="2" />
                    <text x="200" y="64" textAnchor="middle" fill="#d8b4fe" fontSize="10" fontWeight="bold">Cache</text>

                    <circle cx="320" cy="100" r="14" fill="#022c22" stroke="#10b981" strokeWidth="2" />
                    <text x="320" y="104" textAnchor="middle" fill="#34d399" fontSize="10" fontWeight="bold">API</text>

                    <circle cx="200" cy="150" r="14" fill="#451a03" stroke="#f59e0b" strokeWidth="2" />
                    <text x="200" y="154" textAnchor="middle" fill="#fcd34d" fontSize="9" fontWeight="bold">Redis</text>
                  </svg>
                </div>
              )}

              {activeTab === 'recall' && (
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-72 p-5 bg-[#0D1226] border border-emerald-500/30 rounded-xl hover:border-emerald-500/60 transition-all text-center cursor-pointer relative group">
                    <span className="absolute top-2 right-3 text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded">
                      Front Side
                    </span>
                    <div className="text-xs text-gray-400 font-semibold mb-2 uppercase tracking-wide">Question Prompt</div>
                    <p className="text-sm font-medium text-white">How does Vector Search bypass keyword limitations?</p>
                    <div className="mt-4 text-[10px] text-gray-500 font-medium group-hover:text-emerald-400 transition-colors">
                      Hover to flip card &rarr;
                    </div>
                    {/* Hover Backside Mock */}
                    <div className="absolute inset-0 bg-[#0C0F1D] border border-emerald-500/50 rounded-xl p-5 flex flex-col justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <span className="absolute top-2 right-3 text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded">
                        Answer
                      </span>
                      <p className="text-xs text-gray-300 leading-relaxed">
                        It embeds concepts into a high-dimensional vector space. Similar ideas cluster together, matching intent instead of letters.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Panel */}
            <div className="text-[10px] text-gray-600 flex justify-between">
              <span>Status: Online</span>
              <span>Gemini Pro 1.5</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 border-t border-gray-900/60 bg-[#070911]/30">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-center mb-16">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div className="p-6 rounded-xl border border-gray-800/80 bg-[#0B0D18]/80">
              <h3 className="font-bold text-white mb-2">How does the Temporary Store work?</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                When you mark a note as "Temporary", it is saved with a 30-day lifespan. We provide a countdown on each note, and it is automatically deleted from your database once the timer expires. Perfect for temporary lists, phone numbers, or code snippets.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-800/80 bg-[#0B0D18]/80">
              <h3 className="font-bold text-white mb-2">Is my data secure and private?</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Yes. Second Brain runs entirely on your own Supabase instance. We do not store your information on external servers. All processing and semantic searches happen through secure API calls using your personal credentials.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-800/80 bg-[#0B0D18]/80">
              <h3 className="font-bold text-white mb-2">Can I search files and links?</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Absolutely. If you paste a web link, our system parses page title, descriptions, and thumbnails. If you upload a PDF document, it is automatically processed and indexed in the vector space so you can query its contents easily.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-900 py-12 bg-[#05060D] text-gray-500 text-xs">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-tr from-indigo-500 to-amber-500 flex items-center justify-center text-xs text-white">
              🧠
            </div>
            <span className="font-bold text-gray-300">Second Brain OS</span>
          </div>

          <p className="text-center md:text-left">
            &copy; {new Date().getFullYear()} Second Brain. All rights reserved. Self-hosted and secure.
          </p>

          <div className="flex gap-6">
            <a href="#features" className="hover:text-gray-300 transition-colors">Features</a>
            <a href="#sandbox" className="hover:text-gray-300 transition-colors">Sandbox</a>
            <a href="/login" className="hover:text-gray-300 transition-colors">Sign In</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

