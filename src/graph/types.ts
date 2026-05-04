import type { SimulationNodeDatum, SimulationLinkDatum } from 'd3';

export interface GraphNode extends SimulationNodeDatum {
	id: string;
	name: string;
	file: string;
	tags: string[];
	outDegree: number;
	inDegree: number;
	totalDegree: number;
}

export interface GraphEdge extends SimulationLinkDatum<GraphNode> {
	source: string;
	target: string;
}

export interface GraphData {
	nodes: GraphNode[];
	edges: GraphEdge[];
	isolated: string[];
	totalNotes: number;
	totalLinks: number;
}
