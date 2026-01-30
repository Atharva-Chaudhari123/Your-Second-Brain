'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import ForceGraph2D from 'react-force-graph-2d'
import { createClient } from '@/utils/supabase/client'

// --- Types ---
type Node = {
  id: number;
  name: string;
  fullContent: string;
  tags: string[];
  group: string;
  val: number; // Size based on importance
}

type Link = {
  source: number;
  target: number;
  type: 'semantic' | 'tag'; // Different visual styles
  value: number;
}

export default function KnowledgeGraph() {
  const [graphData, setGraphData] = useState({ nodes: [] as Node[], links: [] as Link[] })
  const containerRef = useRef<HTMLDivElement>(null)
  const fgRef = useRef<any>(null) // Reference to the graph instance for zooming
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)

  // 1. Resize Handler
  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight || 600
      })
    }
  }, [])

  // 2. Fetch & Compute Logic
  useEffect(() => {
    const fetchGraph = async () => {
      const supabase = createClient()
      const { data: notes } = await supabase
        .from('notes')
        .select('id, content, embedding, tags')
        .limit(100)

      if (!notes || notes.length === 0) return

      // --- Nodes ---
      const nodes: Node[] = notes.map((note) => ({
        id: note.id,
        name: note.content.substring(0, 15) + (note.content.length > 15 ? '...' : ''),
        fullContent: note.content,
        tags: note.tags || [],
        group: note.tags?.[0] || 'untagged',
        val: 3 // Base size
      }))

      // --- Links ---
      const links: Link[] = []

      for (let i = 0; i < notes.length; i++) {
        for (let j = i + 1; j < notes.length; j++) {
          const noteA = notes[i];
          const noteB = notes[j];

          // A. Semantic Connection (Vector Math)
          const similarity = cosineSimilarity(noteA.embedding, noteB.embedding);
          
          // LOWERED THRESHOLD: 0.65 -> 0.50 to catch "Hello" <-> "Namaste"
          if (similarity > 0.50) {
            links.push({
              source: noteA.id,
              target: noteB.id,
              type: 'semantic',
              value: similarity // Thickness based on strength
            })
            continue; // If semantically linked, skip tag check to avoid double links
          }

          // B. Tag Connection (Categorical Math)
          // If they share at least one tag, connect them weakly
          const sharedTags = noteA.tags?.filter((t: string) => noteB.tags?.includes(t)) || [];
          if (sharedTags.length > 0) {
             links.push({
              source: noteA.id,
              target: noteB.id,
              type: 'tag',
              value: 0.3 // Thinner, fixed width for tags
            })
          }
        }
      }

      setGraphData({ nodes, links })
    }

    fetchGraph()
  }, [])

  // 3. Interaction Handlers
  const handleNodeClick = useCallback((node: any) => {
    setSelectedNode(node as Node);
    
    // Fly to node
    fgRef.current?.centerAt(node.x, node.y, 1000);
    fgRef.current?.zoom(4, 2000);
  }, []);

  const handleBackgroundClick = useCallback(() => {
    setSelectedNode(null);
    fgRef.current?.zoomToFit(400); // Reset zoom
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[600px] border rounded-lg overflow-hidden bg-white relative shadow-inner">
      
      {/* Loading Spinner */}
      {graphData.nodes.length === 0 && (
         <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 z-10 bg-gray-50">
            <p className="text-sm font-medium animate-pulse">Building Neural Pathways...</p>
         </div>
      )}

      {/* THE GRAPH */}
      <ForceGraph2D
        ref={fgRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        
        // --- Visuals ---
        backgroundColor="#ffffff"
        nodeLabel="name"
        nodeRelSize={6}
        
        // Custom Node Rendering (The "Glow")
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          const label = node.name;
          const fontSize = 12/globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          const textWidth = ctx.measureText(label).width;
          const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); // some padding

          // 1. Draw the Node Circle
          ctx.fillStyle = getNodeColor(node.group);
          ctx.beginPath();
          ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);
          ctx.fill();

          // 2. Draw Glow (if selected or high value)
          if (node === selectedNode) {
             ctx.shadowBlur = 15;
             ctx.shadowColor = "rgba(0,0,0,0.5)";
          } else {
             ctx.shadowBlur = 0;
          }

          // 3. Draw Text Label (Only if zoomed in or selected)
          if (globalScale > 1.5 || node === selectedNode) {
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#000';
            ctx.fillText(label, node.x, node.y + 8);
          }
        }}
        
        // --- Links ---
        linkColor={(link: any) => link.type === 'semantic' ? '#93C5FD' : '#E5E7EB'} // Blue for meaning, Gray for tags
        linkWidth={(link: any) => link.type === 'semantic' ? link.value * 3 : 1}     // Semantic is thicker
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={2}
        
        // --- Interaction ---
        onNodeClick={handleNodeClick}
        onBackgroundClick={handleBackgroundClick}
      />

      {/* INSPECTOR PANEL (Floating Sidebar) */}
      {selectedNode && (
        <div className="absolute top-4 right-4 w-80 bg-white/90 backdrop-blur-md p-6 rounded-xl shadow-2xl border border-gray-100 z-50 transform transition-all duration-300 ease-in-out">
          
          <div className="flex justify-between items-start mb-4">
             <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Memory Node #{selectedNode.id}</span>
             <button onClick={() => setSelectedNode(null)} className="text-gray-400 hover:text-black">
               ✕
             </button>
          </div>

          <p className="text-gray-800 text-sm leading-relaxed mb-4 font-medium">
            {selectedNode.fullContent}
          </p>

          {selectedNode.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
               {selectedNode.tags.map(tag => (
                 <span key={tag} className="px-2 py-1 bg-black text-white text-[10px] rounded-full font-bold uppercase">
                   {tag}
                 </span>
               ))}
            </div>
          )}

          <div className="mt-6 pt-4 border-t flex justify-between items-center">
             <span className="text-xs text-blue-600 font-semibold flex items-center gap-1">
                Connected to {graphData.links.filter((l: any) => l.source.id === selectedNode.id || l.target.id === selectedNode.id).length} other memories
             </span>
          </div>
        </div>
      )}
    </div>
  )
}

// --- Helpers ---

// Color generator based on string (consistent colors for tags)
function getNodeColor(group: string) {
  const colors = ['#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#8B5CF6', '#EC4899'];
  let hash = 0;
  for (let i = 0; i < group.length; i++) {
    hash = group.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

// Cosine Sim Math
function cosineSimilarity(vecA: number[] | string, vecB: number[] | string) {
  const a = typeof vecA === 'string' ? JSON.parse(vecA) : vecA;
  const b = typeof vecB === 'string' ? JSON.parse(vecB) : vecB;
  if (!a || !b || a.length !== b.length) return 0;

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }
  return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
}