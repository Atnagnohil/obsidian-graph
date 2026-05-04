<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)">
    <img alt="Obsidian Knowledge Graph" src="assets/icon.svg" width="96">
  </picture>
</p>

<h1 align="center">Obsidian Knowledge Graph</h1>

<p align="center">
  <b>Interactive force-directed graph of your vault's [[wikilinks]]</b>
</p>

<p align="center">
  <a href="https://github.com/Atnagnohil/obsidian-graph/releases">
    <img alt="Version" src="https://img.shields.io/github/v/release/Atnagnohil/obsidian-graph?style=flat-square&color=%237c3aed">
  </a>
  <a href="LICENSE">
    <img alt="License" src="https://img.shields.io/badge/license-MIT-green?style=flat-square">
  </a>
  <img alt="Min App Version" src="https://img.shields.io/badge/Obsidian-%3E%3D1.5.0-7c3aed?style=flat-square">
</p>

<!-- TODO: add screenshot -->


### Features

<table>
<tr>
  <td width="50%">
    <h4>&#9670; Force-directed layout</h4>
    D3.js simulation with drag, zoom, and pan. Nodes with more connections grow larger.
  </td>
  <td width="50%">
    <h4>&#9670; Zero-overhead data</h4>
    Reads <code>[[wikilinks]]</code> directly from Obsidian's MetadataCache — no parsing needed.
  </td>
</tr>
<tr>
  <td>
    <h4>&#9670; 11 color palettes</h4>
    Tag-based node coloring with palettes from D3 (Set3, Category10, Pastel, Dark2, Tableau10, Monochrome & more).
  </td>
  <td>
    <h4>&#9670; Smart navigation</h4>
    Click to highlight neighbors. Double-click to open the note. Command to center on your current file.
  </td>
</tr>
<tr>
  <td>
    <h4>&#9670; Live settings</h4>
    Adjust force strength, node size, color palette, orphan visibility — graph updates instantly.
  </td>
  <td>
    <h4>&#9670; Refined Editorial design</h4>
    Glass-morphism tooltips, dot-grid background, node glow on highlight, editorial-style stats panel.
  </td>
</tr>
</table>

### Install

<details open>
<summary><b>Manual</b></summary>

```bash
cd /path/to/vault/.obsidian/plugins
git clone https://github.com/Atnagnohil/obsidian-graph.git
cd obsidian-graph
npm install && npm run build
```
</details>

<details>
<summary><b>BRAT (Beta)</b></summary>

1. Install [BRAT](https://github.com/TfTHacker/obsidian42-brat)
2. Add `Atnagnohil/obsidian-graph` as a beta plugin
3. Enable **Knowledge Graph** in Community Plugins
</details>

<details>
<summary><b>Community Plugins</b></summary>

*Coming soon — pending review for the Obsidian plugin marketplace.*
</details>

### Usage

| Action | How |
|---|---|
| Open graph | Ribbon icon or `Open knowledge graph` command |
| Pan & Zoom | Scroll to zoom, drag to pan |
| Highlight neighbors | Click a node |
| Open note | Double-click a node |
| Center on current note | `Focus graph on current note` command |
| Drag nodes | Click and drag to reposition |

### Settings

| Setting | Description |
|---|---|
| **Force strength** | Repulsion between nodes — more negative = wider spread |
| **Node size** | Base radius, scaled by connection count |
| **Show orphans** | Show or hide notes without links |
| **Color palette** | Set3 / Category10 / Pastel 1&2 / Set 1&2 / Accent / Dark2 / Paired / Tableau10 / Monochrome |

### Develop

```bash
npm install       # Dependencies
npm run dev       # Watch mode
npm run build     # Production build
```

Built with TypeScript, esbuild, D3.js v7. Zero runtime framework dependencies.

Architecture and development history in [DEVLOG.md](DEVLOG.md).

---

<p align="center">
  <sub>MIT &copy; 2026 Atnagnohil</sub>
</p>
