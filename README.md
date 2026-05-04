# Obsidian Knowledge Graph

Interactive D3.js force-directed knowledge graph for your Obsidian vault — rendered from `[[wikilinks]]`.

![version](https://img.shields.io/badge/version-0.1.0-blue)
![license](https://img.shields.io/badge/license-MIT-green)

## Features

- **Force-directed graph** — D3.js force simulation with drag, zoom, and pan
- **Wikilinks as edges** — reads `[[wikilinks]]` from Obsidian's MetadataCache (zero parsing overhead)
- **Tag-based coloring** — 11 color palettes, mapped from YAML frontmatter tags
- **Click to highlight** — click a node to highlight its neighbors, double-click to open the note
- **Focus on current note** — command to center the graph on your active file
- **Refined Editorial design** — glass-morphism tooltips, dot-grid background, node glow effects
- **Live settings** — force strength, node size, color palette, orphan visibility — all update instantly

## Installation

### From Obsidian Community Plugins (coming soon)

1. Open Settings → Community Plugins
2. Search "Knowledge Graph"
3. Install and enable

### Manual

```bash
cd /path/to/vault/.obsidian/plugins
git clone https://github.com/Atnagnohil/obsidian-graph.git
cd obsidian-graph
npm install && npm run build
```

Then enable the plugin in Settings → Community Plugins.

### From BRAT

1. Install [BRAT](https://github.com/TfTHacker/obsidian42-brat) plugin
2. Add `Atnagnohil/obsidian-graph` as a beta plugin
3. Enable "Knowledge Graph" in Community Plugins

## Usage

| Action | How |
|--------|-----|
| Open graph | Ribbon icon or command palette → "Open knowledge graph" |
| Pan / Zoom | Scroll to zoom, drag to pan |
| Highlight neighbors | Click a node |
| Open note | Double-click a node |
| Focus current note | Command palette → "Focus graph on current note" |
| Drag nodes | Drag a node to reposition |

## Settings

| Setting | Description |
|---------|-------------|
| **Force strength** | Repulsion between nodes. More negative = wider spread |
| **Node size** | Base radius. Nodes with more links grow proportionally |
| **Show orphans** | Toggle visibility of unlinked notes |
| **Color palette** | 11 schemes: Set3, Category10, Pastel, Accent, Dark2, Paired, Tableau10, Monochrome |

## Development

```bash
npm install          # Dependencies
npm run dev          # Watch mode
npm run build        # Production build
```

Built with TypeScript, esbuild, and D3.js v7. No runtime framework dependencies.

See [DEVLOG.md](DEVLOG.md) for architecture, data flow diagrams, and full development history.

## License

MIT
