import { ItemView, WorkspaceLeaf } from 'obsidian';
import type KnowledgeGraphPlugin from '../main';
import { buildGraphData } from '../graph/engine';
import type { GraphData } from '../graph/types';
import { GraphRenderer } from '../graph/renderer';

export const VIEW_TYPE_GRAPH = 'obsidian-knowledge-graph-view';

export class GraphView extends ItemView {
	private plugin: KnowledgeGraphPlugin;
	private renderer: GraphRenderer | null = null;
	private pendingFocusNodeId: string | null = null;

	constructor(leaf: WorkspaceLeaf, plugin: KnowledgeGraphPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType(): string {
		return VIEW_TYPE_GRAPH;
	}

	getDisplayText(): string {
		return 'Knowledge Graph';
	}

	getIcon(): string {
		return 'network';
	}

	async onOpen(): Promise<void> {
		this.refresh();
	}

	async onClose(): Promise<void> {
		this.renderer?.destroy();
		this.renderer = null;
		this.contentEl.empty();
	}

	focusOnNode(nodeId: string): void {
		if (this.renderer) {
			this.renderer.focusNode(nodeId);
		} else {
			this.pendingFocusNodeId = nodeId;
		}
	}

	refresh(): void {
		this.renderer?.destroy();

		const raw = buildGraphData(this.plugin.app);
		console.log('Knowledge Graph:', raw);

		const container = this.contentEl;
		container.empty();

		if (raw.nodes.length === 0) {
			container.createEl('div', {
				cls: 'kg-container',
				text: 'No markdown notes found in vault.',
			});
			return;
		}

		// Apply showOrphans setting
		let data: GraphData;
		if (this.plugin.settings.showOrphans) {
			data = raw;
		} else {
			const orphanIds = new Set(raw.isolated);
			data = {
				...raw,
				nodes: raw.nodes.filter(n => !orphanIds.has(n.name)),
				edges: raw.edges.filter(e =>
					!orphanIds.has(raw.nodes.find(n => n.id === e.source)?.name ?? '') &&
					!orphanIds.has(raw.nodes.find(n => n.id === e.target)?.name ?? '')
				),
			};
		}

		const graphEl = container.createEl('div', { cls: 'kg-container' });
		this.renderer = new GraphRenderer(graphEl, this.plugin);
		this.renderer.render(data);

		if (this.pendingFocusNodeId) {
			this.renderer.focusNode(this.pendingFocusNodeId);
			this.pendingFocusNodeId = null;
		}
	}
}
