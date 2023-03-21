/** @modeem-module */
import spreadsheet from "@spreadsheet/o_spreadsheet/o_spreadsheet_extended";
const { coreTypes } = spreadsheet;

/** Plugin that link charts with Modeem menus. It can contain either the Id of the modeem menu, or its xml id. */
export default class ChartModeemMenuPlugin extends spreadsheet.CorePlugin {
    constructor() {
        super(...arguments);
        this.modeemMenuReference = {};
    }

    /**
     * Handle a spreadsheet command
     * @param {Object} cmd Command
     */
    handle(cmd) {
        switch (cmd.type) {
            case "LINK_ODOO_MENU_TO_CHART":
                this.history.update("modeemMenuReference", cmd.chartId, cmd.modeemMenuId);
                break;
            case "DELETE_FIGURE":
                this.history.update("modeemMenuReference", cmd.id, undefined);
                break;
        }
    }

    /**
     * Get modeem menu linked to the chart
     *
     * @param {string} chartId
     * @returns {object | undefined}
     */
    getChartModeemMenu(chartId) {
        const menuId = this.modeemMenuReference[chartId];
        return menuId ? this.getters.getIrMenu(menuId) : undefined;
    }

    import(data) {
        if (data.chartModeemMenusReferences) {
            this.modeemMenuReference = data.chartModeemMenusReferences;
        }
    }

    export(data) {
        data.chartModeemMenusReferences = this.modeemMenuReference;
    }
}
ChartModeemMenuPlugin.modes = ["normal", "headless"];
ChartModeemMenuPlugin.getters = ["getChartModeemMenu"];

coreTypes.add("LINK_ODOO_MENU_TO_CHART");
