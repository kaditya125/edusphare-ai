import React, { useMemo, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

interface FacultyKnowledgeGraphProps {
  facultyData: any[];
  onNodeClick: (node: any) => void;
}

export function FacultyKnowledgeGraph({ facultyData, onNodeClick }: FacultyKnowledgeGraphProps) {
  // We need to compute nodes and links
  const graphData = useMemo(() => {
    const nodes = facultyData.map(f => ({
      id: f.id,
      name: f.name,
      val: 5, // size
      color: f.status === 'available' ? '#10b981' : '#64748b',
      faculty: f
    }));

    const links: any[] = [];
    
    // Create links between faculty who share research interests
    for (let i = 0; i < facultyData.length; i++) {
      for (let j = i + 1; j < facultyData.length; j++) {
        const sharedInterests = facultyData[i].researchInterests.filter((interest: string) => 
          facultyData[j].researchInterests.includes(interest)
        );
        
        if (sharedInterests.length > 0) {
          links.push({
            source: facultyData[i].id,
            target: facultyData[j].id,
            value: sharedInterests.length
          });
        }
      }
    }

    return { nodes, links };
  }, [facultyData]);

  const handleNodeClick = useCallback((node: any) => {
    onNodeClick(node.faculty);
  }, [onNodeClick]);

  return (
    <div className="w-full h-[600px] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm mt-8">
      <ForceGraph2D
        graphData={graphData}
        nodeLabel="name"
        nodeColor="color"
        linkColor={() => 'rgba(148, 163, 184, 0.3)'}
        linkWidth="value"
        onNodeClick={handleNodeClick}
        backgroundColor="transparent"
        d3VelocityDecay={0.3}
        // Customize node rendering to show names
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          const label = node.name;
          const fontSize = 12/globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          
          if (node.color) {
            ctx.fillStyle = node.color;
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.val, 0, 2 * Math.PI, false);
            ctx.fill();
          }

          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#64748b'; // slate-500
          ctx.fillText(label, node.x, node.y + node.val + fontSize);
        }}
      />
    </div>
  );
}
