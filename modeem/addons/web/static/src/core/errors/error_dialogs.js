/** @modeem-module **/

import { browser } from "../browser/browser";
import { Dialog } from "../dialog/dialog";
import { _lt } from "../l10n/translation";
import { registry } from "../registry";
import { useService } from "@web/core/utils/hooks";
import { capitalize } from "../utils/strings";

import { Component, useState } from "@modeem/owl";

export const modeemExceptionTitleMap = new Map(
    Object.entries({
        "modeem.addons.base.models.ir_mail_server.MailDeliveryException": _lt(
            "MailDeliveryException"
        ),
        "modeem.exceptions.AccessDenied": _lt("Access Denied"),
        "modeem.exceptions.MissingError": _lt("Missing Record"),
        "modeem.exceptions.UserError": _lt("User Error"),
        "modeem.exceptions.ValidationError": _lt("Validation Error"),
        "modeem.exceptions.AccessError": _lt("Access Error"),
        "modeem.exceptions.Warning": _lt("Warning"),
    })
);

// -----------------------------------------------------------------------------
// Generic Error Dialog
// -----------------------------------------------------------------------------
export class ErrorDialog extends Component {
    setup() {
        this.state = useState({
            showTraceback: false,
        });
    }
    onClickClipboard() {
        browser.navigator.clipboard.writeText(
            `${this.props.name}\n${this.props.message}\n${this.props.traceback}`
        );
    }
}
ErrorDialog.template = "web.ErrorDialog";
ErrorDialog.components = { Dialog };
ErrorDialog.title = _lt("Modeem Error");

// -----------------------------------------------------------------------------
// Client Error Dialog
// -----------------------------------------------------------------------------
export class ClientErrorDialog extends ErrorDialog {}
ClientErrorDialog.title = _lt("Modeem Client Error");

// -----------------------------------------------------------------------------
// Network Error Dialog
// -----------------------------------------------------------------------------
export class NetworkErrorDialog extends ErrorDialog {}
NetworkErrorDialog.title = _lt("Modeem Network Error");

// -----------------------------------------------------------------------------
// RPC Error Dialog
// -----------------------------------------------------------------------------
export class RPCErrorDialog extends ErrorDialog {
    setup() {
        super.setup();
        this.inferTitle();
        this.traceback = this.props.traceback;
        if (this.props.data && this.props.data.debug) {
            this.traceback = `${this.props.data.debug}\nThe above server error caused the following client error:\n${this.traceback}`;
        }
    }
    inferTitle() {
        // If the server provides an exception name that we have in a registry.
        if (this.props.exceptionName && modeemExceptionTitleMap.has(this.props.exceptionName)) {
            this.title = modeemExceptionTitleMap.get(this.props.exceptionName).toString();
            return;
        }
        // Fall back to a name based on the error type.
        if (!this.props.type) {
            return;
        }
        switch (this.props.type) {
            case "server":
                this.title = this.env._t("Modeem Server Error");
                break;
            case "script":
                this.title = this.env._t("Modeem Client Error");
                break;
            case "network":
                this.title = this.env._t("Modeem Network Error");
                break;
        }
    }

    onClickClipboard() {
        browser.navigator.clipboard.writeText(
            `${this.props.name}\n${this.props.message}\n${this.traceback}`
        );
    }
}

// -----------------------------------------------------------------------------
// Warning Dialog
// -----------------------------------------------------------------------------
export class WarningDialog extends Component {
    setup() {
        this.title = this.inferTitle();
        const { data, message } = this.props;
        if (data && data.arguments && data.arguments.length > 0) {
            this.message = data.arguments[0];
        } else {
            this.message = message;
        }
    }
    inferTitle() {
        if (this.props.exceptionName && modeemExceptionTitleMap.has(this.props.exceptionName)) {
            return modeemExceptionTitleMap.get(this.props.exceptionName).toString();
        }
        return this.props.title || this.env._t("Modeem Warning");
    }
}
WarningDialog.template = "web.WarningDialog";
WarningDialog.components = { Dialog };

// -----------------------------------------------------------------------------
// Redirect Warning Dialog
// -----------------------------------------------------------------------------
export class RedirectWarningDialog extends Component {
    setup() {
        this.actionService = useService("action");
        const { data, subType } = this.props;
        const [message, actionId, buttonText, additionalContext] = data.arguments;
        this.title = capitalize(subType) || this.env._t("Modeem Warning");
        this.message = message;
        this.actionId = actionId;
        this.buttonText = buttonText;
        this.additionalContext = additionalContext;
    }
    async onClick() {
        const options = {};
        if (this.additionalContext) {
            options.additionalContext = this.additionalContext;
        }
        await this.actionService.doAction(this.actionId, options);
        this.props.close();
    }
}
RedirectWarningDialog.template = "web.RedirectWarningDialog";
RedirectWarningDialog.components = { Dialog };

// -----------------------------------------------------------------------------
// Error 504 Dialog
// -----------------------------------------------------------------------------
export class Error504Dialog extends Component {}
Error504Dialog.template = "web.Error504Dialog";
Error504Dialog.components = { Dialog };
Error504Dialog.title = _lt("Request timeout");

// -----------------------------------------------------------------------------
// Expired Session Error Dialog
// -----------------------------------------------------------------------------
export class SessionExpiredDialog extends Component {
    onClick() {
        browser.location.reload();
    }
}
SessionExpiredDialog.template = "web.SessionExpiredDialog";
SessionExpiredDialog.components = { Dialog };
SessionExpiredDialog.title = _lt("Modeem Session Expired");

registry
    .category("error_dialogs")
    .add("modeem.exceptions.AccessDenied", WarningDialog)
    .add("modeem.exceptions.AccessError", WarningDialog)
    .add("modeem.exceptions.MissingError", WarningDialog)
    .add("modeem.exceptions.UserError", WarningDialog)
    .add("modeem.exceptions.ValidationError", WarningDialog)
    .add("modeem.exceptions.RedirectWarning", RedirectWarningDialog)
    .add("modeem.http.SessionExpiredException", SessionExpiredDialog)
    .add("werkzeug.exceptions.Forbidden", SessionExpiredDialog)
    .add("504", Error504Dialog);
