/** @modeem-module */

/**
 * This file is meant to load the different subparts of the module
 * to guarantee their plugins are loaded in the right order
 *
 * dependency:
 *             other plugins
 *                   |
 *                  ...
 *                   |
 *                filters
 *                /\    \
 *               /  \    \
 *           pivot  list  Modeem chart
 */

/** TODO: Introduce a position parameter to the plugin registry in order to load them in a specific order */
import spreadsheet from "@spreadsheet/o_spreadsheet/o_spreadsheet_extended";
const { corePluginRegistry, uiPluginRegistry } = spreadsheet.registries;

import { GlobalFiltersCorePlugin, GlobalFiltersUIPlugin } from "@spreadsheet/global_filters/index";
import { PivotCorePlugin, PivotUIPlugin } from "@spreadsheet/pivot/index"; // list depends on filter for its getters
import { ListCorePlugin, ListUIPlugin } from "@spreadsheet/list/index"; // pivot depends on filter for its getters
import {
    ChartModeemMenuPlugin,
    ModeemChartCorePlugin,
    ModeemChartUIPlugin,
} from "@spreadsheet/chart/index"; // Modeemchart depends on filter for its getters

corePluginRegistry.add("ModeemGlobalFiltersCorePlugin", GlobalFiltersCorePlugin);
corePluginRegistry.add("ModeemPivotCorePlugin", PivotCorePlugin);
corePluginRegistry.add("ModeemListCorePlugin", ListCorePlugin);
corePluginRegistry.add("modeemChartCorePlugin", ModeemChartCorePlugin);
corePluginRegistry.add("chartModeemMenuPlugin", ChartModeemMenuPlugin);

uiPluginRegistry.add("ModeemGlobalFiltersUIPlugin", GlobalFiltersUIPlugin);
uiPluginRegistry.add("ModeemPivotUIPlugin", PivotUIPlugin);
uiPluginRegistry.add("ModeemListUIPlugin", ListUIPlugin);
uiPluginRegistry.add("modeemChartUIPlugin", ModeemChartUIPlugin);
