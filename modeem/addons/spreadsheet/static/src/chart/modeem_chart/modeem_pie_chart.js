/** @modeem-module */

import spreadsheet from "@spreadsheet/o_spreadsheet/o_spreadsheet_extended";
import { _t } from "@web/core/l10n/translation";
import { ModeemChart } from "./modeem_chart";

const { chartRegistry } = spreadsheet.registries;

const { getDefaultChartJsRuntime, chartFontColor, ChartColors } = spreadsheet.helpers;

chartRegistry.add("modeem_pie", {
    match: (type) => type === "modeem_pie",
    createChart: (definition, sheetId, getters) => new ModeemChart(definition, sheetId, getters),
    getChartRuntime: createModeemChartRuntime,
    validateChartDefinition: (validator, definition) =>
        ModeemChart.validateChartDefinition(validator, definition),
    transformDefinition: (definition) => ModeemChart.transformDefinition(definition),
    getChartDefinitionFromContextCreation: () => ModeemChart.getDefinitionFromContextCreation(),
    name: _t("Pie"),
});

function createModeemChartRuntime(chart, getters) {
    const background = chart.background || "#FFFFFF";
    const { datasets, labels } = chart.dataSource.getData();
    const chartJsConfig = getPieConfiguration(chart, labels);
    const colors = new ChartColors();
    for (const { label, data } of datasets) {
        const backgroundColor = getPieColors(colors, datasets);
        const dataset = {
            label,
            data,
            borderColor: "#FFFFFF",
            backgroundColor,
        };
        chartJsConfig.data.datasets.push(dataset);
    }
    return { background, chartJsConfig };
}

function getPieConfiguration(chart, labels) {
    const fontColor = chartFontColor(chart.background);
    const config = getDefaultChartJsRuntime(chart, labels, fontColor);
    config.type = chart.type.replace("modeem_", "");
    const legend = {
        ...config.options.legend,
        display: chart.legendPosition !== "none",
        labels: { fontColor },
    };
    legend.position = chart.legendPosition;
    config.options.legend = legend;
    config.options.layout = {
        padding: { left: 20, right: 20, top: chart.title ? 10 : 25, bottom: 10 },
    };
    config.options.tooltips = {
        callbacks: {
            title: function (tooltipItems, data) {
                return data.datasets[tooltipItems[0].datasetIndex].label;
            },
        },
    };
    return config;
}

function getPieColors(colors, dataSetsValues) {
    const pieColors = [];
    const maxLength = Math.max(...dataSetsValues.map((ds) => ds.data.length));
    for (let i = 0; i <= maxLength; i++) {
        pieColors.push(colors.next());
    }

    return pieColors;
}
