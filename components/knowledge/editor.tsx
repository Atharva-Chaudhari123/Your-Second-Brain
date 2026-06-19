'use client'

// @ts-ignore: Bypass static analysis for Tiptap imports
import { useEditor, EditorContent } from '@tiptap/react'
import * as TiptapReact from '@tiptap/react'

import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Typography from '@tiptap/extension-typography'
import LinkExtension from '@tiptap/extension-link'
import BubbleMenuExtension from '@tiptap/extension-bubble-menu'
import FloatingMenuExtension from '@tiptap/extension-floating-menu'
import { useState, useEffect, useRef } from 'react'
import { savePageContent, mapToMind } from '@/app/dashboard/Knowledge-Store/[id]/action'
import { useRouter } from 'next/navigation'

// Robustly access menu components
const BubbleMenu = (TiptapReact as any).BubbleMenu || (TiptapReact as any).default?.BubbleMenu
const FloatingMenu = (TiptapReact as any).FloatingMenu || (TiptapReact as any).default?.FloatingMenu

interface EditorProps {
  pageId: string
  initialTitle: string
  initialContent: any 
  initialSummary: string | null
}

export default function NotionEditor({ pageId, initialTitle, initialContent, initialSummary }: EditorProps) {
  const router = useRouter()
  const [title, setTitle] = useState(initialTitle)
  const [status, setStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved')
  const [isMapping, setIsMapping] = useState(false)
  const [summary, setSummary] = useState(initialSummary)
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false)

  // Handle Initial Content Logic
  const getInitialContent = () => {
    if (!initialContent) return undefined
    if (initialContent.type === 'doc') return initialContent
    return {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: initialContent.text ? [{ type: 'text', text: initialContent.text }] : []
        }
      ]
    }
  }

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { 
          levels: [1, 2, 3],
          HTMLAttributes: { class: 'font-bold text-gray-900' }
        },
        bulletList: {
          HTMLAttributes: { class: 'list-disc list-outside ml-4 mb-2 space-y-1' }
        },
        orderedList: {
          HTMLAttributes: { class: 'list-decimal list-outside ml-4 mb-2 space-y-1' }
        },
        listItem: {
          HTMLAttributes: { class: 'pl-1' }
        },
        blockquote: {
          HTMLAttributes: { class: 'border-l-4 border-gray-300 pl-4 italic text-gray-700 my-4 bg-gray-50 py-2 rounded-r' }
        },
        codeBlock: {
          HTMLAttributes: { class: 'bg-gray-900 text-gray-100 rounded-md p-4 font-mono text-sm my-4 overflow-x-auto shadow-sm' }
        },
      }),
      Typography,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-blue-500 hover:underline cursor-pointer' },
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') return `Heading ${node.attrs.level}`
          return "Type '/' for commands..."
        },
      }),
      BubbleMenuExtension,
      FloatingMenuExtension,
    ],
    content: getInitialContent(),
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[60vh] text-gray-800 leading-relaxed [&>h1]:text-4xl [&>h1]:mt-8 [&>h1]:mb-4 [&>h2]:text-2xl [&>h2]:mt-6 [&>h2]:mb-3 [&>h3]:text-xl [&>h3]:mt-4 [&>h3]:mb-2 [&>p]:mb-4',
      },
    },
    onUpdate: () => {
      setStatus('unsaved')
    },
  })

  // Auto-Save Effect
  useEffect(() => {
    if (status === 'unsaved' && editor) {
      const handler = setTimeout(async () => {
        setStatus('saving')
        try {
          const json = editor.getJSON()
          await savePageContent(pageId, title, json)
          setStatus('saved')
          router.refresh()
        } catch (e) {
          console.error("Save failed", e)
          setStatus('unsaved')
        }
      }, 1500)
      return () => clearTimeout(handler)
    }
  }, [status, editor, title, pageId, router])

  const handleMapToMind = async () => {
    if (!editor) return
    setIsMapping(true)
    const plainText = editor.getText()
    const result = await mapToMind(pageId, plainText)
    setIsMapping(false)
    if (result.success && result.summary) {
      setSummary(result.summary)
    } else {
      alert("AI Mapping failed. Try again.")
    }
  }

  if (!editor) {
    return <div className="p-12 text-gray-400 text-center">Loading your knowledge...</div>
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 md:px-0">
      
      {/* STATUS BAR */}
      <div className="flex justify-between items-center mb-8 sticky top-0 bg-white/95 backdrop-blur-sm py-4 z-20 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${status === 'saved' ? 'bg-green-500' : 'bg-orange-400 animate-pulse'}`} />
          <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">
            {status === 'saved' ? 'Synced' : 'Saving...'}
          </span>
        </div>

        <button
          onClick={handleMapToMind}
          disabled={isMapping || status !== 'saved'}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm
            ${isMapping ? 'bg-purple-100 text-purple-700 cursor-wait' : 'bg-black text-white hover:bg-gray-800'}
            ${status !== 'saved' ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {isMapping ? "Mapping..." : "🧠 Map to Mind"}
        </button>
      </div>

      {/* TITLE INPUT */}
      <input
        type="text"
        value={title}
        onChange={(e) => { setTitle(e.target.value); setStatus('unsaved'); }}
        placeholder="Untitled Page"
        className="w-full text-5xl font-bold text-gray-900 border-none focus:ring-0 placeholder:text-gray-300 bg-transparent px-0 mb-8"
      />

      {/* SUMMARY BLOCK */}
      {summary && (
        <div className="bg-purple-50 border-l-4 border-purple-500 p-6 mb-10 rounded-r-xl">
          <h3 className="text-xs font-bold text-purple-800 uppercase tracking-wider mb-2 flex items-center gap-2">
            <span>✨</span> Knowledge Summary
          </h3>
          <p className="text-purple-900 text-sm leading-relaxed italic">
            {summary}
          </p>
        </div>
      )}

      {/* BUBBLE MENU (Text Selection) */}
      {editor && BubbleMenu && (
        <BubbleMenu 
          editor={editor} 
          tippyOptions={{ duration: 100, zIndex: 99999 }}
          className="flex bg-black text-white rounded-lg shadow-xl overflow-hidden divide-x divide-gray-700 border border-gray-700"
        >
          <MenuBtn onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} label="Bold" />
          <MenuBtn onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} label="Italic" />
          <MenuBtn onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} label="Strike" />
          <MenuBtn onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive('code')} label="Code" />
        </BubbleMenu>
      )}

      {/* NOTION-STYLE FLOATING MENU (Plus Button) */}
      {editor && FloatingMenu && (
        <FloatingMenu 
          editor={editor} 
          tippyOptions={{ duration: 100, zIndex: 99999, placement: 'left-start', offset: [0, 0] }}
          className="relative"
        >
          {/* The Plus Button */}
          <button 
            onClick={() => setIsPlusMenuOpen(!isPlusMenuOpen)}
            className="p-1.5 rounded-md text-gray-400 hover:text-black hover:bg-gray-100 transition-colors flex items-center justify-center"
            title="Add Block"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>

          {/* The Dropdown Menu */}
          {isPlusMenuOpen && (
            <div className="absolute top-8 left-0 w-64 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden flex flex-col z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 border-b border-gray-100">Basic Blocks</div>
              
              <DropdownItem 
                onClick={() => { editor.chain().focus().toggleHeading({ level: 1 }).run(); setIsPlusMenuOpen(false); }}
                icon="H1" label="Heading 1" desc="Big section heading"
              />
              <DropdownItem 
                onClick={() => { editor.chain().focus().toggleHeading({ level: 2 }).run(); setIsPlusMenuOpen(false); }}
                icon="H2" label="Heading 2" desc="Medium section heading"
              />
              <DropdownItem 
                onClick={() => { editor.chain().focus().toggleBulletList().run(); setIsPlusMenuOpen(false); }}
                icon="•" label="Bullet List" desc="Simple bullet points"
              />
              <DropdownItem 
                onClick={() => { editor.chain().focus().toggleOrderedList().run(); setIsPlusMenuOpen(false); }}
                icon="1." label="Numbered List" desc="Ordered items"
              />
              <DropdownItem 
                onClick={() => { editor.chain().focus().toggleBlockquote().run(); setIsPlusMenuOpen(false); }}
                icon="❞" label="Quote / Callout" desc="Highlight important text"
              />
              <DropdownItem 
                onClick={() => { editor.chain().focus().toggleCodeBlock().run(); setIsPlusMenuOpen(false); }}
                icon="<>" label="Code Block" desc="Snippet of code"
              />
            </div>
          )}
        </FloatingMenu>
      )}

      {/* MAIN EDITOR */}
      <EditorContent editor={editor} />
      
      <div className="mt-20 pt-10 border-t border-gray-100 text-center text-gray-400 text-xs">
        Last synced with Brain OS just now.
      </div>
    </div>
  )
}

// Helper: Top Toolbar Button
function MenuBtn({ onClick, isActive, label }: { onClick: () => void, isActive: boolean, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-bold transition-colors ${isActive ? 'bg-gray-800 text-blue-400' : 'hover:bg-gray-800'}`}
    >
      {label}
    </button>
  )
}

// Helper: Dropdown Item
function DropdownItem({ onClick, icon, label, desc }: { onClick: () => void, icon: string, label: string, desc: string }) {
  return (
    <button onClick={onClick} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-left group w-full">
      <div className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded bg-white text-xs font-bold text-gray-600 shadow-sm group-hover:border-gray-300">
        {icon}
      </div>
      <div>
        <div className="text-sm font-medium text-gray-800">{label}</div>
        <div className="text-[10px] text-gray-400">{desc}</div>
      </div>
    </button>
  )
}