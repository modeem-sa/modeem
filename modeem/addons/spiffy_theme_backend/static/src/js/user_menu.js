/** @modeem-module **/
import { UserMenu } from "@web/webclient/user_menu/user_menu";
var { patch } = require("web.utils");
var session = require("@web/session");

patch(UserMenu.prototype, "spiffy_theme_backend.appsMenuJs", {
    setup() {
        this._super();
        //  greeting
        var current_time_hr = new Date().getHours().toLocaleString("en-US", { timeZone: session.session.user_context.tz });
        if ((parseInt(current_time_hr) >= 6) && (parseInt(current_time_hr) < 12)){
            var greeting = "Good Morning"
        } else if ((parseInt(current_time_hr) >= 12) && parseInt(current_time_hr) <= 18) {
            var greeting = "Good Afternoon"
        } else {
            var greeting = "Good Evening"
        }
        this.greeting = greeting
    }
});
