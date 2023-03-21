/** @modeem-module */
import spreadsheet from "../../o_spreadsheet/o_spreadsheet_extended";
import ChartDataSource from "../data_source/chart_data_source";
import { globalFiltersFieldMatchers } from "@spreadsheet/global_filters/plugins/global_filters_core_plugin";
import { sprintf } from "@web/core/utils/strings";
import { _t } from "@web/core/l10n/translation";
import { checkFilterFieldMatching } from "@spreadsheet/global_filters/helpers";
import CommandResult from "../../o_spreadsheet/cancelled_reason";

const { CorePlugin } = spreadsheet;

/**
 * @typedef {Object} Chart
 * @property {string} dataSourceId
 * @property {Object} fieldMatching
 *
 * @typedef {import("@spreadsheet/global_filters/plugins/global_filters_core_plugin").FieldMatching} FieldMatching
 */

export default class ModeemChartCorePlugin extends CorePlugin {
    constructor(getters, history, range, dispatch, config, uuidGenerator) {
        super(getters, history, range, dispatch, config, uuidGenerator);
        this.dataSources = config.dataSources;

        /** @type {Object.<string, Chart>} */
        this.charts = {};

        globalFiltersFieldMatchers["chart"] = {
            geIds: () => this.getters.getModeemChartIds(),
            getDisplayName: (chartId) => this.getters.getModeemChartDisplayName(chartId),
            getTag: async (chartId) => {
                const model = await this.getChartDataSource(chartId).getModelLabel();
                return sprintf(_t("Chart - %s"), model);
            },
            getFieldMatching: (chartId, filterId) =>
                this.getModeemChartFieldMatching(chartId, filterId),
            waitForReady: () => this.getModeemChartsWaitForReady(),
            getModel: (chartId) =>
                this.getters.getChart(chartId).getDefinitionForDataSource().metaData.resModel,
            getFields: (chartId) => this.getChartDataSource(chartId).getFields(),
        };
    }

    allowDispatch(cmd) {
        switch (cmd.type) {
            case "ADD_GLOBAL_FILTER":
            case "EDIT_GLOBAL_FILTER":
                if (cmd.chart) {
                    return checkFilterFieldMatching(cmd.chart);
                }
        }
        return CommandResult.Success;
    }

    /**
     * Handle a spreadsheet command
     *
     * @param {Object} cmd Command
     */
    handle(cmd) {
        switch (cmd.type) {
            case "CREATE_CHART": {
                switch (cmd.definition.type) {
                    case "modeem_pie":
                    case "modeem_bar":
                    case "modeem_line":
                        this._addModeemChart(cmd.id);
                        break;
                }
                break;
            }
            case "UPDATE_CHART": {
                switch (cmd.definition.type) {
                    case "modeem_pie":
                    case "modeem_bar":
                    case "modeem_line":
                        this._setChartDataSource(cmd.id);
                        break;
                }
                break;
            }
            case "DELETE_FIGURE": {
                const charts = { ...this.charts };
                delete charts[cmd.id];
                this.history.update("charts", charts);
                break;
            }
            case "REMOVE_GLOBAL_FILTER":
                this._onFilterDeletion(cmd.id);
                break;
            case "ADD_GLOBAL_FILTER":
            case "EDIT_GLOBAL_FILTER":
                if (cmd.chart) {
                    this._setModeemChartFieldMatching(cmd.filter.id, cmd.chart);
                }
                break;
        }
    }

    // -------------------------------------------------------------------------
    // Getters
    // -------------------------------------------------------------------------

    /**
     * Get all the modeem chart ids
     * @returns {Array<string>}
     */
    getModeemChartIds() {
        const ids = [];
        for (const sheetId of this.getters.getSheetIds()) {
            ids.push(
                ...this.getters
                    .getChartIds(sheetId)
                    .filter((id) => this.getters.getChartType(id).startsWith("modeem_"))
            );
        }
        return ids;
    }

    /**
     * @param {string} chartId
     * @returns {string}
     */
    getChartFieldMatch(chartId) {
        return this.charts[chartId].fieldMatching;
    }

    /**
     * @param {string} id
     * @returns {ChartDataSource|undefined}
     */
    getChartDataSource(id) {
        const dataSourceId = this.charts[id].dataSourceId;
        return this.dataSources.get(dataSourceId);
    }

    /**
     *
     * @param {string} chartId
     * @returns {string}
     */
    getModeemChartDisplayName(chartId) {
        return this.getters.getChart(chartId).title;
    }

    /**
     * Import the pivots
     *
     * @param {Object} data
     */
    import(data) {
        for (const sheet of data.sheets) {
            if (sheet.figures) {
                for (const figure of sheet.figures) {
                    if (figure.tag === "chart" && figure.data.type.startsWith("modeem_")) {
                        this._addModeemChart(figure.id, figure.data.fieldMatching);
                    }
                }
            }
        }
    }
    /**
     * Export the pivots
     *
     * @param {Object} data
     */
    export(data) {
        for (const sheet of data.sheets) {
            if (sheet.figures) {
                for (const figure of sheet.figures) {
                    if (figure.tag === "chart" && figure.data.type.startsWith("modeem_")) {
                        figure.data.fieldMatching = this.getChartFieldMatch(figure.id);
                    }
                }
            }
        }
    }
    // -------------------------------------------------------------------------
    // Private
    // -------------------------------------------------------------------------

    /**
     *
     * @return {Promise[]}
     */
    getModeemChartsWaitForReady() {
        return this.getModeemChartIds().map((chartId) =>
            this.getChartDataSource(chartId).loadMetadata()
        );
    }

    /**
     * Get the current pivotFieldMatching of a chart
     *
     * @param {string} chartId
     * @param {string} filterId
     */
    getModeemChartFieldMatching(chartId, filterId) {
        return this.charts[chartId].fieldMatching[filterId];
    }

    /**
     * Sets the current pivotFieldMatching of a chart
     *
     * @param {string} filterId
     * @param {Record<string,FieldMatching>} chartFieldMatches
     */
    _setModeemChartFieldMatching(filterId, chartFieldMatches) {
        const charts = { ...this.charts };
        for (const [chartId, fieldMatch] of Object.entries(chartFieldMatches)) {
            charts[chartId].fieldMatching[filterId] = fieldMatch;
        }
        this.history.update("charts", charts);
    }

    _onFilterDeletion(filterId) {
        const charts = { ...this.charts };
        for (const chartId in charts) {
            this.history.update("charts", chartId, "fieldMatching", filterId, undefined);
        }
    }

    /**
     * @param {string} chartId
     * @param {string} dataSourceId
     */
    _addModeemChart(chartId, fieldMatching = {}) {
        const dataSourceId = this.uuidGenerator.uuidv4();
        const charts = { ...this.charts };
        charts[chartId] = {
            dataSourceId,
            fieldMatching,
        };
        const definition = this.getters.getChart(chartId).getDefinitionForDataSource();
        if (!this.dataSources.contains(dataSourceId)) {
            this.dataSources.add(dataSourceId, ChartDataSource, definition);
        }
        this.history.update("charts", charts);
        this._setChartDataSource(chartId);
    }

    /**
     * Sets the catasource on the corresponding chart
     * @param {string} chartId
     */
    _setChartDataSource(chartId) {
        const chart = this.getters.getChart(chartId);
        chart.setDataSource(this.getters.getChartDataSource(chartId));
    }
}

ModeemChartCorePlugin.getters = [
    "getChartDataSource",
    "getModeemChartIds",
    "getChartFieldMatch",
    "getModeemChartDisplayName",
    "getModeemChartFieldMatching",
];
