modeem.define('spiffy_theme_backend.FormRendererInherit', function (require) {
    'use strict';

    var FormController = require('web.FormController');
    const config = require("web.config");
    var core = require('web.core');
    var qweb = core.qweb;

    FormController.include({
        saveRecord: async function () {
            const changedFields = await this._super(...arguments);
            $('.tree_form_split > .o_view_controller > .o_control_panel .reload_view').click()
            return changedFields;
        },

        createRecord: async function (parentID, additionalContext) {
            this.isNewRecord = true;
            this._super.apply(this, arguments);
        },

        _onDiscard: function () {
            this._super.apply(this, arguments);
            if (this.isNewRecord) {
                $('.close_form_view').click();
            }
            this.$el.find('.reload_view').click()
        },
    });
});