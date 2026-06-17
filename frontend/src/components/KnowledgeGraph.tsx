import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { useStore } from '../store/useStore';
import { apiCall } from '../lib/api';
import { motion } from 'motion/react';
import { Search, Filter, Maximize2, GitMerge } from 'lucide-react';

// A function to generate a beautiful, dense Logseq-style graph
export function KnowledgeGraph() {
  const user = useStore(state => state.user);
  const fgRef = useRef<any>(null);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());
  const [hoverNode, setHoverNode] = useState<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        const data = await apiCall('/dashboard/graph');
        setGraphData(data as any);
      } catch (err) {
        console.error('Failed to fetch graph data:', err);
      }
    };
    if (user) {
      fetchGraphData();
    }
  }, [user]);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    window.addEventListener('resize', updateDimensions);
    updateDimensions();
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (fgRef.current) {
      // Significantly increase the repulsive force to prevent the large pills from overlapping
      fgRef.current.d3Force('charge').strength(-4000);
      fgRef.current.d3Force('charge').distanceMax(2000);
      fgRef.current.d3Force('link').distance(300);
      fgRef.current.d3ReheatSimulation();
    }
  }, [graphData]);

  const handleNodeHover = useCallback((node: any) => {
    setHighlightNodes(new Set());
    setHighlightLinks(new Set());
    if (node) {
      const newHighlightNodes = new Set();
      const newHighlightLinks = new Set();
      
      newHighlightNodes.add(node.id);
      graphData.links.forEach((link: any) => {
        if (link.source.id === node.id || link.target.id === node.id) {
          newHighlightLinks.add(link);
          newHighlightNodes.add(link.source.id);
          newHighlightNodes.add(link.target.id);
        }
      });

      setHighlightNodes(newHighlightNodes);
      setHighlightLinks(newHighlightLinks);
    }
    setHoverNode(node || null);
  }, [graphData]);

  const getColor = (node: any) => {
    if (highlightNodes.size > 0 && !highlightNodes.has(node.id)) {
      return 'rgba(255,255,255,0.1)';
    }
    switch(node.group) {
      case 'user': return '#4dc3b6'; // Teal
      case 'course': return '#3b82f6'; // Blue
      case 'concept': return '#8b5cf6'; // Purple
      case 'assignment': return '#f59e0b'; // Amber
      case 'journal': return '#10b981'; // Emerald
      default: return '#94a3b8'; // Slate
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#061419] text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-[#173842] bg-[#091e24]/50 backdrop-blur-md z-10">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <GitMerge className="w-6 h-6 text-[#4dc3b6]" />
            Knowledge Graph
          </h1>
          <p className="text-sm text-[#88b0b9] mt-1">Visualize connections between your courses, assignments, and notes.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 bg-[#0c2229] border border-[#173842] px-3 py-1.5 rounded-lg">
            <Search className="w-4 h-4 text-[#88b0b9]" />
            <input type="text" placeholder="Search nodes..." className="bg-transparent border-none outline-none text-sm text-white placeholder:text-[#173842]" />
          </div>
          <button className="p-2 bg-[#0c2229] border border-[#173842] rounded-lg text-[#88b0b9] hover:text-white transition-colors">
            <Filter className="w-4 h-4" />
          </button>
          <button className="p-2 bg-[#0c2229] border border-[#173842] rounded-lg text-[#88b0b9] hover:text-white transition-colors" onClick={() => fgRef.current?.zoomToFit(400)}>
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Graph Area */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden">
        {graphData.nodes.length > 0 && (
          <ForceGraph2D
            ref={fgRef}
            width={dimensions.width}
            height={dimensions.height}
            graphData={graphData}
            nodeLabel="" // We will draw custom labels
            nodeRelSize={6}
            d3VelocityDecay={0.3}
            onEngineStop={() => fgRef.current?.zoomToFit(400, 50)}
            linkColor={(link: any) => highlightLinks.has(link) ? '#4dc3b6' : 'rgba(51,122,139,0.3)'}
            linkWidth={(link: any) => highlightLinks.has(link) ? 2 : 1}
            linkDirectionalParticles={2}
            linkDirectionalParticleWidth={(link: any) => highlightLinks.has(link) ? 4 : 0}
            onNodeHover={handleNodeHover}
            backgroundColor="#061419"
            nodeCanvasObject={(node: any, ctx, globalScale) => {
              const label = node.name || 'Unknown';
              const fontSize = 12 / globalScale;
              ctx.font = `${fontSize}px Inter, sans-serif`;
              const textWidth = ctx.measureText(label).width;
              const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 1.5); // some padding

              ctx.fillStyle = getColor(node);
              
              // Draw rounded rectangle
              ctx.beginPath();
              ctx.roundRect(
                node.x - bckgDimensions[0] / 2,
                node.y - bckgDimensions[1] / 2,
                bckgDimensions[0],
                bckgDimensions[1],
                fontSize * 0.5
              );
              ctx.fill();

              // Draw border if highlighted
              if (highlightNodes.has(node.id)) {
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1.5 / globalScale;
                ctx.stroke();
              }

              // Draw text
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = '#ffffff';
              ctx.fillText(label, node.x, node.y);
              
              node.__bckgDimensions = bckgDimensions; // Save dimensions for hit testing
            }}
            nodePointerAreaPaint={(node: any, color, ctx) => {
              const bckgDimensions = node.__bckgDimensions || [20, 20];
              ctx.fillStyle = color;
              ctx.fillRect(
                node.x - bckgDimensions[0] / 2,
                node.y - bckgDimensions[1] / 2,
                bckgDimensions[0],
                bckgDimensions[1]
              );
            }}
          />
        )}
        
        {/* Floating Legend */}
        <div className="absolute bottom-6 left-6 bg-[#0c2229]/80 backdrop-blur-md border border-[#173842] p-4 rounded-xl shadow-xl flex gap-4">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#3b82f6]"></div><span className="text-xs text-[#88b0b9]">Courses</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#8b5cf6]"></div><span className="text-xs text-[#88b0b9]">Concepts</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div><span className="text-xs text-[#88b0b9]">Assignments</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#10b981]"></div><span className="text-xs text-[#88b0b9]">Journals</span></div>
        </div>
      </div>
    </div>
  );
}
