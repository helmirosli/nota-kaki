"use client"

import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { GraphNode, GraphEdge } from "@/lib/types"

function toFlowNodes(nodes: GraphNode[]): Node[] {
  const cols = Math.ceil(Math.sqrt(nodes.length))
  return nodes.map((n, i) => ({
    id: n.id,
    position: {
      x: (i % cols) * 180 + 20,
      y: Math.floor(i / cols) * 120 + 20,
    },
    data: { label: n.label },
    style: {
      background: n.colour || "#4CAF50",
      color: "#fff",
      borderRadius: 12,
      fontWeight: 700,
      fontSize: 13,
      border: "none",
      padding: "8px 14px",
      minWidth: 100,
      textAlign: "center" as const,
    },
  }))
}

function toFlowEdges(edges: GraphEdge[]): Edge[] {
  return edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
    animated: true,
    style: { stroke: "#94a3b8" },
    labelStyle: { fontSize: 11, fill: "#64748b", fontWeight: 600 },
  }))
}

export function KnowledgeGraph({ nodes, edges }: { nodes: GraphNode[]; edges: GraphEdge[] }) {
  const [flowNodes, , onNodesChange] = useNodesState(toFlowNodes(nodes))
  const [flowEdges, , onEdgesChange] = useEdgesState(toFlowEdges(edges))

  return (
    <div style={{ height: 320 }} className="rounded-xl overflow-hidden border border-gray-100">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        attributionPosition="bottom-right"
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#e2e8f0" />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  )
}
