/** @modeem-module **/
import { getModeemFunctions } from "@spreadsheet/helpers/modeem_functions_helpers";

/** @typedef  {import("@spreadsheet/helpers/modeem_functions_helpers").ModeemFunctionDescription} ModeemFunctionDescription*/

/**
 * @param {string} formula
 * @returns {number}
 */
export function getNumberOfAccountFormulas(formula) {
    return getModeemFunctions(formula, ["ODOO.BALANCE", "ODOO.CREDIT", "ODOO.DEBIT"]).filter(
        (fn) => fn.isMatched
    ).length;
}

/**
 * Get the first Account function description of the given formula.
 *
 * @param {string} formula
 * @returns {ModeemFunctionDescription | undefined}
 */
export function getFirstAccountFunction(formula) {
    return getModeemFunctions(formula, ["ODOO.BALANCE", "ODOO.CREDIT", "ODOO.DEBIT"]).find(
        (fn) => fn.isMatched
    );
}
