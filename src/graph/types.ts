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

export type GraphEdge = SimulationLinkDatum<GraphNode>;

export interface GraphData {
	nodes: GraphNode[];
	edges: GraphEdge[];
	isolated: string[];
	totalNotes: number;
	totalLinks: number;
}
