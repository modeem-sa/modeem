/** @modeem-module */

import spreadsheet from "@spreadsheet/o_spreadsheet/o_spreadsheet_extended";

const { chartComponentRegistry } = spreadsheet.registries;
const { ChartJsComponent } = spreadsheet.components;

chartComponentRegistry.add("modeem_bar", ChartJsComponent);
chartComponentRegistry.add("modeem_line", ChartJsComponent);
chartComponentRegistry.add("modeem_pie", ChartJsComponent);

import ModeemChartCorePlugin from "./plugins/modeem_chart_core_plugin";
import ChartModeemMenuPlugin from "./plugins/chart_modeem_menu_plugin";
import ModeemChartUIPlugin from "./plugins/modeem_chart_ui_plugin";

export { ModeemChartCorePlugin, ChartModeemMenuPlugin, ModeemChartUIPlugin };
