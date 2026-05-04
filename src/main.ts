import { Plugin } from 'obsidian';
import { GraphView, VIEW_TYPE_GRAPH } from './views/graph-view';
import { KnowledgeGraphSettings, DEFAULT_SETTINGS, KnowledgeGraphSettingTab } from './settings';

export default class KnowledgeGraphPlugin extends Plugin {
	settings: KnowledgeGraphSettings;

	async onload() {
		await this.loadSettings();

		this.registerView(
			VIEW_TYPE_GRAPH,
			(leaf) => new GraphView(leaf, this)
		);

		this.addRibbonIcon('network', 'Open knowledge graph', () => {
			void this.activateView();
		});

		this.addCommand({
			id: 'open-graph-view',
			name: 'Open graph',
			callback: () => this.activateView(),
		});

		this.addCommand({
			id: 'focus-on-current-note',
			name: 'Focus graph on current note',
			checkCallback: (checking) => {
				const activeFile = this.app.workspace.getActiveFile();
				if (activeFile) {
					if (!checking) {
						void this.focusOnNote(activeFile.path);
					}
					return true;
				}
				return false;
			},
		});

		this.addSettingTab(new KnowledgeGraphSettingTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<KnowledgeGraphSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async activateView() {
		const { workspace } = this.app;
		await workspace.ensureSideLeaf(VIEW_TYPE_GRAPH, 'right', { active: true });
	}

	async focusOnNote(notePath: string) {
		const { workspace } = this.app;
		await workspace.ensureSideLeaf(VIEW_TYPE_GRAPH, 'right', { active: true });

		const leaves = workspace.getLeavesOfType(VIEW_TYPE_GRAPH);
		for (const leaf of leaves) {
			const view = leaf.view as GraphView;
			view.focusOnNode(notePath);
		}
	}

	refreshGraphViews(): void {
		const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_GRAPH);
		for (const leaf of leaves) {
			(leaf.view as GraphView).refresh();
		}
	}
}
