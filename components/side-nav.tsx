'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import UnifiedSearch from '@/components/unified-search'

// Simple SVG Icons
const Icons = {
  Home: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>,
  Brain: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>,
  Chat: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>,
  Temp: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Facts: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
  Knowledge: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  Flashcards: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
  MindMap: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  Logout: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
}

export default function SideNav() {
  const pathname = usePathname()

  const links = [
    { name: 'Dashboard', href: '/dashboard', icon: Icons.Home },
    { name: 'Temporary Store', href: '/dashboard/Temporary-Store', icon: Icons.Temp },
    { name: 'Facts Store', href: '/dashboard/Facts-Store', icon: Icons.Facts },
    { name: 'Knowledge Store', href: '/dashboard/Knowledge-Store', icon: Icons.Knowledge },
    { name: 'Brainstorm', href: '/dashboard/Brainstorm', icon: Icons.Brain },
    { name: 'Flashcards', href: '/dashboard/Flashcards', icon: Icons.Flashcards },
    { name: 'Mind Map', href: '/dashboard/mind-map', icon: Icons.MindMap },
    { name: 'Chat with Brain', href: '/dashboard/chat', icon: Icons.Chat },
  ]

  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-2 bg-gray-50 border-r border-gray-200">
      <div className="mb-6 flex h-20 shrink-0 items-end justify-start rounded-xl bg-black p-4 md:h-20 shadow-sm">
        <h1 className="text-xl font-bold text-white md:text-2xl tracking-tight">🧠 Brain OS</h1>
      </div>

      {/* Unified Search Input (Click to open Modal) */}
      <div className="mb-4 px-2 hidden md:block">
        <UnifiedSearch />
      </div>
      
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-1 overflow-y-auto">
        {links.map((link) => {
          const LinkIcon = link.icon
          const isActive = pathname === link.href
          
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex h-[48px] grow items-center justify-center gap-3 rounded-lg p-3 text-sm font-medium transition-all md:flex-none md:justify-start md:p-2 md:px-3
                ${isActive 
                  ? 'bg-white text-black shadow-sm ring-1 ring-gray-200' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-black'
                }
              `}
            >
              <LinkIcon />
              <p className="hidden md:block">{link.name}</p>
            </Link>
          )
        })}
        
        <div className="hidden h-auto w-full grow md:block"></div>
        
        <form action="/auth/signout" method="post">
          <button className="flex h-[48px] w-full grow items-center justify-center gap-3 rounded-lg p-3 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors md:flex-none md:justify-start md:p-2 md:px-3">
            <Icons.Logout />
            <div className="hidden md:block">Sign Out</div>
          </button>
        </form>
      </div>
    </div>
  )
}