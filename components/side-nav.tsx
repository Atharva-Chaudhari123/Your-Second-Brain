'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Simple SVG Icons for visual clarity
const Icons = {
  Home: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>,
  Chat: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>,
  Brain: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>,
  Logout: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
}

export default function SideNav() {
  const pathname = usePathname()

  const links = [
    { name: 'Home', href: '/dashboard', icon: Icons.Home },
    { name: 'Chat with Brain', href: '/dashboard/chat', icon: Icons.Chat },
    { name: 'Mind Map', href: '/dashboard/mind-map', icon: Icons.Brain },
  ]

  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-2">
      <div className="mb-4 flex h-20 shrink-0 items-end justify-start rounded-md bg-black p-4 md:h-20">
        <h1 className="text-xl font-bold text-white md:text-2xl">🧠 Brain</h1>
      </div>
      
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        {links.map((link) => {
          const LinkIcon = link.icon
          const isActive = pathname === link.href
          
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex h-[48px] grow items-center justify-center gap-2 rounded-md p-3 text-sm font-medium hover:bg-gray-100 hover:text-black md:flex-none md:justify-start md:p-2 md:px-3
                ${isActive ? 'bg-gray-100 text-black border border-gray-200' : 'text-gray-500'}
              `}
            >
              <LinkIcon />
              <p className="hidden md:block">{link.name}</p>
            </Link>
          )
        })}
        
        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block"></div>
        
        <form action="/auth/signout" method="post">
          <button className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-red-50 hover:text-red-600 md:flex-none md:justify-start md:p-2 md:px-3">
            <Icons.Logout />
            <div className="hidden md:block">Sign Out</div>
          </button>
        </form>
      </div>
    </div>
  )
}