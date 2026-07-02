# Knowledge Graph

> Interactive force-directed node-edge graph visualising concept relationships within each note. Powered by xyflow/react.

← [[Architecture]]

---

## Location

```
web/components/graph/KnowledgeGraph.tsx    ← "use client"
```

---

## Current Status

The Knowledge Graph is **imported but hidden** in [[Services/Note Reader]]. The component exists and works; the render call is commented out in `NoteReader.tsx`. Each note JSON still includes a `graph` field with nodes and edges.

---

## Data Structure

From [[Services/Note Schema]]:

```typescript
interface KnowledgeGraph {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

interface GraphNode {
  id: string
  label: string
  colour: string   // hex, typically the subject colour or a shade
}

interface GraphEdge {
  id: string
  source: string   // node id
  target: string   // node id
  label: string    // relationship description (e.g. "adalah", "terdiri dari")
}
```

### Example (feqah bab2 — Rukun Solat)

```json
{
  "nodes": [
    { "id": "n1", "label": "Rukun Solat", "colour": "#9C27B0" },
    { "id": "n2", "label": "Niat", "colour": "#AB47BC" },
    { "id": "n3", "label": "Takbiratul Ihram", "colour": "#AB47BC" }
  ],
  "edges": [
    { "id": "e1", "source": "n1", "target": "n2", "label": "rukun pertama" },
    { "id": "e2", "source": "n1", "target": "n3", "label": "rukun kedua" }
  ]
}
```

---

## Rendering

### Nodes
- Converted to xyflow `Node[]` with custom styling:
  - Background: node `colour + "22"` (tinted)
  - Border: `2px solid colour`
  - Text: bold, subject-coloured
  - Shape: rounded rectangle

### Edges
- Converted to xyflow `Edge[]` with:
  - Animated: `true` (flowing dots along edge)
  - Gray stroke
  - `label` shown as edge label (small text mid-edge)

### Canvas
- Fixed height: `320px`
- Background: dot pattern (xyflow `<Background>`)
- Controls: zoom in/out, fit view button (xyflow `<Controls>`)
- `fitView` on mount

---

## Props

```typescript
<KnowledgeGraph
  graph: KnowledgeGraph
  colour: string           // subject colour
/>
```

---

## Dependencies

- `@xyflow/react` 12.11.1 — ReactFlow, Background, Controls
- [[Services/Note Schema]] — `KnowledgeGraph`, `GraphNode`, `GraphEdge`
- Called by [[Services/Note Reader]] (currently hidden)
