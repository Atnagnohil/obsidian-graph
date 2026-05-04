import { App } from 'obsidian';
import { GraphData, GraphNode } from './types';

export function buildGraphData(app: App): GraphData {
	const files = app.vault.getMarkdownFiles();
	const resolvedLinks = app.metadataCache.resolvedLinks;

	// Build node data
	const nodeMap = new Map<string, GraphNode>();

	for (const file of files) {
		const cache = app.metadataCache.getFileCache(file);
		const tags: string[] = [];

		if (cache?.frontmatter?.tags) {
			const raw = cache.frontmatter.tags;
			if (Array.isArray(raw)) {
				for (const t of raw) {
					if (typeof t === 'string') tags.push(t);
				}
			} else if (typeof raw === 'string') {
				tags.push(raw);
			}
		}

		nodeMap.set(file.path, {
			id: file.path,
			name: file.basename,
			file: file.path,
			tags,
			outDegree: 0,
			inDegree: 0,
			totalDegree: 0,
		});
	}

	// Build edges from resolvedLinks
	const edges: { source: string; target: string }[] = [];
	const inDegree = new Map<string, number>();

	for (const [sourcePath, targets] of Object.entries(resolvedLinks)) {
		if (!nodeMap.has(sourcePath)) continue;

		for (const targetPath of Object.keys(targets)) {
			if (!nodeMap.has(targetPath)) continue;
			edges.push({ source: sourcePath, target: targetPath });
			inDegree.set(targetPath, (inDegree.get(targetPath) || 0) + 1);
		}
	}

	// Compute degrees
	for (const node of nodeMap.values()) {
		const targets = resolvedLinks[node.id] || {};
		node.outDegree = Object.keys(targets).filter(t => nodeMap.has(t)).length;
		node.inDegree = inDegree.get(node.id) || 0;
		node.totalDegree = node.outDegree + node.inDegree;
	}

	// Find isolated nodes
	const isolated = Array.from(nodeMap.values())
		.filter(n => n.totalDegree === 0)
		.map(n => n.name);

	return {
		nodes: Array.from(nodeMap.values()),
		edges,
		isolated,
		totalNotes: nodeMap.size,
		totalLinks: edges.length,
	};
}
