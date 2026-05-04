import * as d3 from 'd3';
import type { GraphNode, GraphEdge, GraphData } from './types';
import type { KnowledgeGraphSettings } from '../settings';

export function createSimulation(
	data: GraphData,
	width: number,
	height: number,
	settings: KnowledgeGraphSettings
): d3.Simulation<GraphNode, GraphEdge> {
	return d3.forceSimulation<GraphNode>(data.nodes)
		.force('link', d3.forceLink<GraphNode, GraphEdge>(data.edges)
			.id(d => d.id)
			.distance(120))
		.force('charge', d3.forceManyBody().strength(settings.forceStrength))
		.force('center', d3.forceCenter(width / 2, height / 2))
		.force('collision', d3.forceCollide<GraphNode>()
			.radius(d => nodeRadius(d, settings) + 8));
}

export function nodeRadius(d: GraphNode, settings: KnowledgeGraphSettings): number {
	return settings.nodeSize + Math.sqrt(d.totalDegree || 0) * 5;
}
