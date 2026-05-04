import * as d3 from 'd3';
import type { GraphNode, GraphEdge, GraphData } from './types';
import type KnowledgeGraphPlugin from '../main';
import { createSimulation, nodeRadius } from './layout';

export class GraphRenderer {
	private container: HTMLElement;
	private plugin: KnowledgeGraphPlugin;
	private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
	private mainGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
	private linkGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
	private nodeGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
	private simulation: d3.Simulation<GraphNode, GraphEdge> | null = null;
	private data: GraphData | null = null;
	private resizeObserver: ResizeObserver;
	private highlighted = new Set<string>();
	private tagColorMap: Record<string, string> = {};
	private zoomBehavior: d3.ZoomBehavior<SVGSVGElement, unknown>;

	constructor(container: HTMLElement, plugin: KnowledgeGraphPlugin) {
		this.container = container;
		this.plugin = plugin;

		this.svg = d3.select(container)
			.append('svg')
			.attr('width', '100%')
			.attr('height', '100%');

		this.zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
			.scaleExtent([0.2, 5])
			.on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
				this.mainGroup.attr('transform', event.transform.toString());
			});
		this.svg.call(this.zoomBehavior);

		this.mainGroup = this.svg.append('g');
		this.linkGroup = this.mainGroup.append('g');
		this.nodeGroup = this.mainGroup.append('g');

		this.resizeObserver = new ResizeObserver(() => this.onResize());
		this.resizeObserver.observe(container);
	}

	render(data: GraphData): void {
		this.data = data;
		this.highlighted.clear();

		this.buildTagColors(data);

		const width = this.container.clientWidth;
		const height = this.container.clientHeight;

		this.simulation = createSimulation(data, width, height, this.plugin.settings);
		this.drawLinks(data);
		this.drawNodes(data, this.simulation);
		this.createStats(data);
		this.createLegend();

		this.simulation.on('tick', () => {
			this.linkGroup.selectAll<SVGLineElement, GraphEdge>('line')
				.attr('x1', d => (d.source as unknown as GraphNode).x!)
				.attr('y1', d => (d.source as unknown as GraphNode).y!)
				.attr('x2', d => (d.target as unknown as GraphNode).x!)
				.attr('y2', d => (d.target as unknown as GraphNode).y!);
			this.nodeGroup.selectAll<SVGGElement, GraphNode>('g')
				.attr('transform', d => `translate(${d.x},${d.y})`);
		});
	}

	highlightNode(nodeId: string): void {
		if (!this.data) return;

		this.highlighted = new Set([nodeId]);
		for (const e of this.data.edges) {
			const srcId = this.edgeSourceId(e);
			const tgtId = this.edgeTargetId(e);
			if (srcId === nodeId) this.highlighted.add(tgtId);
			if (tgtId === nodeId) this.highlighted.add(srcId);
		}

		this.updateHighlighting();
	}

	focusNode(nodeId: string): void {
		if (!this.data) return;

		const node = this.data.nodes.find(n => n.id === nodeId);
		if (!node || node.x === undefined || node.y === undefined) return;

		const width = this.container.clientWidth;
		const height = this.container.clientHeight;

		const transform = d3.zoomIdentity
			.translate(width / 2, height / 2)
			.scale(1.5)
			.translate(-node.x, -node.y);

		this.svg.transition().duration(750).call(
			(tr: d3.Transition<SVGSVGElement, unknown, null, undefined>) =>
				this.zoomBehavior.transform(tr, transform)
		);

		this.highlightNode(nodeId);
	}

	destroy(): void {
		this.resizeObserver.disconnect();
		if (this.simulation) this.simulation.stop();
		this.svg.remove();
	}

	private onResize(): void {
		if (!this.data || !this.simulation) return;
		const w = this.container.clientWidth;
		const h = this.container.clientHeight;
		this.svg.attr('width', w).attr('height', h);
		this.simulation.force('center', d3.forceCenter(w / 2, h / 2));
		this.simulation.alpha(0.3).restart();
	}

	private readonly schemeMap: Record<string, readonly string[]> = {
		set3: d3.schemeSet3,
		category10: d3.schemeCategory10,
		accent: d3.schemeAccent,
		dark2: d3.schemeDark2,
		paired: d3.schemePaired,
		pastel1: d3.schemePastel1,
		pastel2: d3.schemePastel2,
		set1: d3.schemeSet1,
		set2: d3.schemeSet2,
		tableau10: d3.schemeTableau10,
	};

	private buildTagColors(data: GraphData): void {
		const allTags = new Set<string>();
		for (const n of data.nodes) {
			for (const t of n.tags) allTags.add(t);
		}
		const scheme = this.schemeMap[this.plugin.settings.colorPalette] ?? d3.schemeSet3;
		const colors = d3.scaleOrdinal<string>(scheme);
		this.tagColorMap = {};
		for (const t of allTags) {
			this.tagColorMap[t] = colors(t);
		}
	}

	private nodeColor(d: GraphNode): string {
		if (this.plugin.settings.colorPalette === 'monochrome') {
			return 'var(--interactive-accent)';
		}
		if (d.tags.length > 0 && this.tagColorMap[d.tags[0]!]) {
			return this.tagColorMap[d.tags[0]!]!;
		}
		return 'var(--background-modifier-border)';
	}

	private drawLinks(data: GraphData): void {
		this.linkGroup.selectAll('line').remove();

		this.linkGroup.selectAll<SVGLineElement, GraphEdge>('line')
			.data(data.edges)
			.join('line')
			.attr('class', 'kg-link');
	}

	private drawNodes(data: GraphData, sim: d3.Simulation<GraphNode, GraphEdge>): void {
		this.nodeGroup.selectAll('g').remove();

		const node = this.nodeGroup
			.selectAll<SVGGElement, GraphNode>('g')
			.data(data.nodes)
			.join('g')
			.attr('class', 'kg-node')
			.call(this.createDrag(sim));

		node.append('circle')
			.attr('class', 'kg-node-glow')
			.attr('r', d => nodeRadius(d, this.plugin.settings) + 6)
			.attr('fill', d => this.nodeColor(d));

		node.append('circle')
			.attr('class', 'kg-node-circle')
			.attr('r', d => nodeRadius(d, this.plugin.settings))
			.attr('fill', d => this.nodeColor(d))
			.attr('stroke', 'var(--background-modifier-border)')
			.attr('stroke-width', 1.5);

		node.append('text')
			.attr('class', 'kg-node-label')
			.text(d => d.name)
			.attr('dx', d => nodeRadius(d, this.plugin.settings) + 7)
			.attr('dy', 4);

		node.on('click', (event: MouseEvent, d: GraphNode) => {
			event.stopPropagation();
			this.highlightNode(d.id);
			this.showTooltip(event, d, true);
		});

		node.on('dblclick.kg', (event: MouseEvent, d: GraphNode) => {
			event.stopPropagation();
			void this.plugin.app.workspace.openLinkText(d.file, '', false);
		});

		node.on('mouseover', (event: MouseEvent, d: GraphNode) => {
			if (this.highlighted.size === 0) {
				this.showTooltip(event, d, false);
			}
		});

		node.on('mousemove', (event: MouseEvent) => {
			d3.select('#kg-tooltip')
				.style('left', (event.pageX + 16) + 'px')
				.style('top', (event.pageY - 40) + 'px');
		});

		node.on('mouseout', (_event: MouseEvent) => {
			if (this.highlighted.size === 0) {
				d3.select('#kg-tooltip').classed('visible', false);
			}
		});

		this.svg.on('click', (_event: MouseEvent) => {
			this.highlighted.clear();
			this.updateHighlighting();
			d3.select('#kg-tooltip').classed('visible', false);
		});
	}

	private createDrag(sim: d3.Simulation<GraphNode, GraphEdge>) {
		return d3.drag<SVGGElement, GraphNode>()
			.on('start', (event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>, d: GraphNode) => {
				if (!event.active) sim.alphaTarget(0.3).restart();
				d.fx = d.x;
				d.fy = d.y;
			})
			.on('drag', (event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>, d: GraphNode) => {
				d.fx = event.x;
				d.fy = event.y;
			})
			.on('end', (event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>, d: GraphNode) => {
				if (!event.active) sim.alphaTarget(0);
				d.fx = undefined;
				d.fy = undefined;
			});
	}

	private updateHighlighting(): void {
		const hasHighlight = this.highlighted.size > 0;
		this.nodeGroup.selectAll<SVGGElement, GraphNode>('g')
			.select<SVGCircleElement>('.kg-node-glow')
			.attr('opacity', n => this.highlighted.has(n.id) ? 0.35 : 0);
		this.nodeGroup.selectAll<SVGGElement, GraphNode>('g')
			.select<SVGCircleElement>('.kg-node-circle')
			.attr('opacity', n => this.highlighted.has(n.id) ? 1 : hasHighlight ? 0.12 : 1)
			.attr('stroke', n => this.highlighted.has(n.id)
				? this.nodeColor(n)
				: hasHighlight ? 'var(--background-modifier-border)' : 'var(--background-modifier-border)')
			.attr('stroke-width', n => this.highlighted.has(n.id) ? 2.5 : 1.5);
		this.nodeGroup.selectAll<SVGGElement, GraphNode>('g')
			.select<SVGTextElement>('.kg-node-label')
			.attr('opacity', n => this.highlighted.has(n.id) ? 1 : hasHighlight ? 0.08 : 0.9)
			.attr('fill', n => this.highlighted.has(n.id)
				? 'var(--text-normal)'
				: 'var(--text-muted)');
		this.linkGroup.selectAll<SVGLineElement, GraphEdge>('line')
			.attr('opacity', e => {
				const s = this.edgeSourceId(e);
				const t = this.edgeTargetId(e);
				return this.highlighted.has(s) && this.highlighted.has(t) ? 0.9 : hasHighlight ? 0.03 : 0.35;
			})
			.attr('stroke-width', e => {
				const s = this.edgeSourceId(e);
				const t = this.edgeTargetId(e);
				return this.highlighted.has(s) && this.highlighted.has(t) ? 2 : 1;
			})
			.attr('stroke', e => {
				const s = this.edgeSourceId(e);
				const t = this.edgeTargetId(e);
				return this.highlighted.has(s) && this.highlighted.has(t)
					? 'var(--interactive-accent)'
					: 'var(--background-modifier-border)';
			});
	}

	private edgeSourceId(e: GraphEdge): string {
		const s = e.source;
		return typeof s === 'string' ? s :
			typeof s === 'number' ? String(s) : s.id;
	}

	private edgeTargetId(e: GraphEdge): string {
		const t = e.target;
		return typeof t === 'string' ? t :
			typeof t === 'number' ? String(t) : t.id;
	}

	private showTooltip(event: MouseEvent, d: GraphNode, showDetail: boolean): void {
		const tagsHtml = d.tags.length
			? `<div class="kg-tooltip-tags">${d.tags.map(t => `<span class="kg-tag">${t}</span>`).join('')}</div>`
			: '';

		const detailContent = showDetail
			? `<div class="kg-tooltip-meta">
					<span class="kg-tooltip-stat"><span class="kg-tooltip-stat-value">${d.outDegree}</span> Out</span>
					<span class="kg-tooltip-stat"><span class="kg-tooltip-stat-value">${d.inDegree}</span> In</span>
					<span class="kg-tooltip-stat"><span class="kg-tooltip-stat-value">${d.totalDegree}</span> Total</span>
				</div>`
			: `<div class="kg-tooltip-meta"><span class="kg-tooltip-stat-value">${d.totalDegree}</span> links</div>`;

		const accentColor = this.nodeColor(d);

		this.ensureTooltip();
		d3.select('#kg-tooltip')
			.html(`<div class="kg-tooltip-accent" style="background:${accentColor}"></div>
				<div class="kg-tooltip-body">
					<div class="kg-tooltip-name">${d.name}</div>
					${detailContent}
					${tagsHtml}
				</div>`)
			.classed('visible', true)
			.style('left', (event.pageX + 16) + 'px')
			.style('top', (event.pageY - 40) + 'px');
	}

	private ensureTooltip(): void {
		if (activeDocument.getElementById('kg-tooltip')) return;
		d3.select(activeDocument.body).append('div')
			.attr('id', 'kg-tooltip')
			.attr('class', 'kg-tooltip');
	}

	private createStats(data: GraphData): void {
		d3.select('#kg-stats').remove();
		const vaultName = this.plugin.app.vault.getName();

		const stats = d3.select(this.container)
			.append('div')
			.attr('id', 'kg-stats')
			.attr('class', 'kg-stats');

		stats.append('div')
			.attr('class', 'kg-stats-title')
			.text(vaultName);

		const rows = [
			{ label: 'Notes', value: data.totalNotes },
			{ label: 'Links', value: data.totalLinks },
		];
		for (const r of rows) {
			const row = stats.append('div').attr('class', 'kg-stats-row');
			row.append('span').attr('class', 'kg-stats-label').text(r.label);
			row.append('span').attr('class', 'kg-stats-value').text(String(r.value));
		}

		if (data.isolated.length > 0) {
			const row = stats.append('div')
				.attr('class', 'kg-stats-row kg-stats-warn');
			row.append('span').attr('class', 'kg-stats-label').text('Isolated');
			row.append('span').attr('class', 'kg-stats-value').text(String(data.isolated.length));
		}
	}

	private createLegend(): void {
		d3.select('#kg-legend').remove();
		const tags = Object.keys(this.tagColorMap);
		if (tags.length === 0) return;

		const legend = d3.select(this.container)
			.append('div')
			.attr('id', 'kg-legend')
			.attr('class', 'kg-legend');

		legend.append('div')
			.attr('class', 'kg-legend-title')
			.text('Tags');

		const pills = legend.append('div').attr('class', 'kg-legend-pills');
		for (const tag of tags) {
			const pill = pills.append('span').attr('class', 'kg-legend-pill');
			pill.append('span')
				.attr('class', 'kg-legend-swatch')
				.style('background', this.tagColorMap[tag]!);
			pill.append('span').attr('class', 'kg-legend-name').text(tag);
		}
	}
}
