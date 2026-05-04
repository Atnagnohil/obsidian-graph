import { App, PluginSettingTab, Setting, setTooltip, Notice } from 'obsidian';
import type KnowledgeGraphPlugin from './main';

export type ColorPalette =
	| 'set3'
	| 'category10'
	| 'accent'
	| 'dark2'
	| 'paired'
	| 'pastel1'
	| 'pastel2'
	| 'set1'
	| 'set2'
	| 'tableau10'
	| 'monochrome';

export interface KnowledgeGraphSettings {
	forceStrength: number;
	nodeSize: number;
	showOrphans: boolean;
	colorPalette: ColorPalette;
}

export const DEFAULT_SETTINGS: KnowledgeGraphSettings = {
	forceStrength: -300,
	nodeSize: 6,
	showOrphans: true,
	colorPalette: 'set3',
};

const HELP = {
	forceStrength:
		'How strongly nodes push away from each other. More negative values create stronger repulsion, spreading the graph wider. Use the slider to find the right balance for your vault size.',
	nodeSize:
		'Base size of graph nodes. Nodes with more connections grow proportionally larger. Adjust to fit your screen density preferences.',
	showOrphans:
		'When enabled, notes without any links are shown as disconnected nodes. Disable to hide them and focus on connected content only.',
	colorPalette:
		'Color scheme for node coloring. Each palette maps tags to a different set of colors. Monochrome uses your current Obsidian accent color for all nodes.',
};

export class KnowledgeGraphSettingTab extends PluginSettingTab {
	plugin: KnowledgeGraphPlugin;
	private debounceTimer: number | null = null;

	constructor(app: App, plugin: KnowledgeGraphPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl).setName('Display').setHeading();

		const makeHelp = (el: HTMLElement, text: string): void => {
			const helpEl = el.createSpan({ cls: 'kg-setting-help', text: '?' });
			setTooltip(helpEl, text);
		};

		const forceSetting = new Setting(containerEl)
			.setName('Force strength')
			.setDesc('Repulsion between nodes');
		makeHelp(forceSetting.nameEl, HELP.forceStrength);
		forceSetting.addSlider(slider => slider
			.setLimits(-1000, -50, 50)
			.setValue(this.plugin.settings.forceStrength)
			.onChange(async (value) => {
				this.plugin.settings.forceStrength = value;
				await this.plugin.saveSettings();
				this.debouncedRefresh();
			}));

		const sizeSetting = new Setting(containerEl)
			.setName('Node size')
			.setDesc('Base radius of nodes');
		makeHelp(sizeSetting.nameEl, HELP.nodeSize);
		sizeSetting.addSlider(slider => slider
			.setLimits(3, 20, 1)
			.setValue(this.plugin.settings.nodeSize)
			.onChange(async (value) => {
				this.plugin.settings.nodeSize = value;
				await this.plugin.saveSettings();
				this.debouncedRefresh();
			}));

		const orphanSetting = new Setting(containerEl)
			.setName('Show orphan notes')
			.setDesc('Notes without links');
		makeHelp(orphanSetting.nameEl, HELP.showOrphans);
		orphanSetting.addToggle(toggle => toggle
			.setValue(this.plugin.settings.showOrphans)
			.onChange(async (value) => {
				this.plugin.settings.showOrphans = value;
				await this.plugin.saveSettings();
				this.plugin.refreshGraphViews();
			}));

		const paletteSetting = new Setting(containerEl)
			.setName('Color palette')
			.setDesc('Tag color scheme');
		makeHelp(paletteSetting.nameEl, HELP.colorPalette);
		paletteSetting.addDropdown(dropdown => dropdown
			.addOption('set3', 'Set 3 (soft)')
			.addOption('category10', 'Category 10 (bold)')
			.addOption('pastel1', 'Pastel 1 (light)')
			.addOption('pastel2', 'Pastel 2 (warm)')
			.addOption('set1', 'Set 1 (vivid)')
			.addOption('set2', 'Set 2 (muted)')
			.addOption('accent', 'Accent (bright)')
			.addOption('dark2', 'Dark 2 (deep)')
			.addOption('paired', 'Paired (contrast)')
			.addOption('tableau10', 'Tableau 10')
			.addOption('monochrome', 'Monochrome')
			.setValue(this.plugin.settings.colorPalette)
			.onChange(async (value) => {
				this.plugin.settings.colorPalette = value as ColorPalette;
				await this.plugin.saveSettings();
				this.plugin.refreshGraphViews();
			}));

		new Setting(containerEl)
			.setName('Save settings')
			.setDesc('Settings auto-save on change. Click to confirm current values are stored.')
			.addButton(btn => btn
				.setButtonText('Save')
				.setCta()
				.onClick(async () => {
					await this.plugin.saveSettings();
					new Notice('Knowledge graph settings saved');
				}));
	}

	private debouncedRefresh(): void {
		if (this.debounceTimer) activeWindow.clearTimeout(this.debounceTimer);
		this.debounceTimer = window.setTimeout(() => {
			this.plugin.refreshGraphViews();
		}, 200);
	}
}
