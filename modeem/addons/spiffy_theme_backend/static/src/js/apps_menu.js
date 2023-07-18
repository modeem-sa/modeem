/** @modeem-module **/
import {fuzzyLookup} from "@web/core/utils/search";
var core = require('web.core');
var qweb = core.qweb;
var ajax = require('web.ajax');
var { NavBar } = require("@web/webclient/navbar/navbar");
var { patch } = require("web.utils");
const { useListener } = require("@web/core/utils/hooks");
const {useRef, useState } = owl;
import { browser } from "@web/core/browser/browser";
import body_color from "spiffy_theme_backend.MenuJs";

function AppDrawerfindNames(memo, menu) {
    if (menu.action) {
        var key = menu.parent_id ? menu.parent_id[1] + "/" : "";
        memo[key + menu.name] = menu;
    }
    if (menu.children) {
        _.reduce(menu.children, AppDrawerfindNames, memo);
    }
    return memo;
}

function findNames(memo, menu) {
    if (menu.actionID) {
        memo[menu.name.trim()] = menu;
    }
    if (menu.childrenTree) {
        const innerMemo = _.reduce(menu.childrenTree, findNames, {});
        for (const innerKey in innerMemo) {
            memo[menu.name.trim() + " / " + innerKey] = innerMemo[innerKey];
        }
    }
    return memo;
}

export function divertColorItem(env) {
    const route = "/primary_color/divertable_color";
    return {
        type: "item",
        id: "divert.account",
        description: env._t("Switch/Add Account"),
        href: `${browser.location.origin}${route}`,
        callback: () => {
            body_color.methods.divertColor();
        },
        sequence: 70,
    };
}

patch(NavBar.prototype, "spiffy_theme_backend.appsMenuJs", {
    setup() {
        this._super();
        
        var self = this;
        $(document).on("keydown", "#app_menu_search", function(ev){self._AppsearchResultsNavigate(ev)});
        $(document).on("input", "#app_menu_search", function(ev){self._searchAppDrawerTimeout(ev)});
        $(document).on("click", "#search_result .search_list_content a", function(ev){self._ToggleDrawer(ev)});
        $(document).on("click", ".fav_app_select", function(ev){self._AddRemoveFavApps(ev)});
        $(document).on("click", ".appdrawer_section .app-box .o_app", function(ev){self._ToggleDrawer(ev)});
        
        var menuData = this.menuService.getApps()

        this._search_def = false;

        this._GetFavouriteApps()
        // this._AppdrawerIcons()
        this._FavouriteAppsIsland()

        this.state = useState({
            results: [],
            offset: 0,
            hasResults: false,
        });

        this.searchBarInput = useRef("SearchBarInput");
        this._drawersearchableMenus = [];
        for (const menu of this.menuService.getApps()) {
            Object.assign(
                this._drawersearchableMenus,
                _.reduce([this.menuService.getMenuAsTree(menu.id)], findNames, {})
            );
        }
        $('.o_main_navbar').removeClass('d-none')

        $('.favorite_apps_section').scroll(function(){
            if ($('.favorite_apps_section').scrollTop() > 20) {
                $('.favorite_apps_section').css( { height: `calc(100vh - ${sidebar_systray_height}px)` } );
            } else {
                $('.favorite_apps_section').css( { height: `calc(100vh - ${sidebar_systray_height}px)` } );
            }
        });
    },

    _ToggleDrawer: function (ev) {
        $('.o_main_navbar').toggleClass('appdrawer-toggle')
        $('.appdrawer_section').toggleClass('toggle')
        $('.o_app_drawer a').toggleClass('toggle')

        // reset app drawer search details on drawer close
        if (!$('.appdrawer_section').hasClass('toggle')) {
            $("input[id='app_menu_search']").val("")
            $(".appdrawer_section #search_result").empty()
            $('.appdrawer_section .apps-list .row').removeClass('d-none');
            $('#searched_main_apps').empty().addClass('d-none').removeClass('d-flex');
        }
    },

    _FavouriteAppsIsland: function (ev){
        if (this.favappsdata) {
            var rec = this.favappsdata
            if (rec.app_list.length) {
                $('.fav_app_island .fav_apps').empty();
                $.each(rec.app_list, function( index, value ) {
                    if (value['web_icon'] != false){
                        var web_icon_ext = value['web_icon'].split('/icon.')[1]
                        var web_svg_src = value['web_icon'].replace(',', '/')
                    }
                    else {
                        var web_icon_ext = value['web_icon'].toString()
                        var web_svg_src = value['web_icon'].toString()
                    }
                    var favapps = $(qweb.render("FavoriteApps", {
                        app_name:value['name'],
                        app_id:value['app_id'],
                        app_xmlid:value['app_xmlid'],
                        app_actionid:value['app_actionid'],
                        use_icon:value['use_icon'],
                        icon_class_name:value['icon_class_name'],
                        icon_img:value['icon_img'],
                        web_icon: value['web_icon'],
                        web_icon_data:value['web_icon_data'],
                        web_icon_ext: web_icon_ext,
                        web_svg_src: web_svg_src,
                    }))
                    $('.fav_app_island .fav_apps').append(favapps)
                });
                $('.fav_app_island').removeClass('d-none')
            } else {
                $('.fav_app_island').addClass('d-none')
            }
        }
    },

    _GetFavouriteApps: function() {
        var apps = this.menuService.getApps()
        var self = this
        if (this.favappsdata) {
            var rec = this.favappsdata
            $.each(rec.app_list, function( index, value ) {
                $.each(apps, function( ind, val ) {
                    if (value['app_id'] == val.id) {
                        var target = ".o_app[data-menu-id="+val.id+"]";
                        var $target = $(target);
                        $target.parent().find('.fav_app_select .ri').addClass('active');
                    }
                });
            });
        } else {
            ajax.rpc('/get-favorite-apps').then(function(rec) {
                if (rec) {
                    self.favappsdata = rec
                    $.each(rec.app_list, function( index, value ) {
                        $.each(apps, function( ind, val ) {
                            if (value['app_id'] == val.id) {
                                var target = ".o_app[data-menu-id="+val.id+"]";
                                var $target = $(target);
                                $target.parent().find('.fav_app_select .ri').addClass('active');
                            }
                        });
                    });
                    self._FavouriteAppsIsland()
                }
            });
        }
    },

    get_user_data: function (ev) {
        var self = this
        var session = this.getSession();
        var $avatar = $('.user_image img');
        var avatar_src = session.url('/web/image', {
            model:'res.users',
            field: 'image_128',
            id: session.uid,
        });
        var value = {
            'avatar_src': avatar_src,
            'user_id': session.uid,
            'user_name': session.name,
            // 'greeting': greeting,
        }
        $avatar.attr('src', avatar_src);
        return value
    },

    _AddRemoveFavApps: function (ev) {
        var self = this 
        var app_id = $(ev.target).parent().find('.o_app').attr('data-menu-id')
        var app_name = $(ev.target).parent().find('.app-name').text()
        if ($(ev.target).find('.ri.active').length) {
            ajax.jsonRpc('/remove-user-fav-apps','call', {
                'app_id':app_id,
            }).then(function(rec) {
                $(ev.target).find('.ri').removeClass('active');
                self._FavouriteAppsIsland()
            });
        } else {
            ajax.jsonRpc('/update-user-fav-apps','call', {
                'app_name':app_name,
                'app_id':app_id,
            }).then(function(rec) {
                $(ev.target).find('.ri').addClass('active');
                self._FavouriteAppsIsland()
            });
        }
    },

    _getsearchedapps: function(searchvals) {
        var self = this
        var apps = this.menuService.getApps()
        if (searchvals === "") {
            $('#searched_main_apps').empty().addClass('d-none').removeClass('d-flex');
            return;
        }
        $('#searched_main_apps').empty().addClass('d-flex').removeClass('d-none');
        $.each(apps, function( index, value ) {
            if(value['name'].toLowerCase().indexOf(searchvals.toLowerCase()) != -1){
                var searchapps = $(qweb.render("SearchedApps", {
                    app_name:value['name'],
                    app_id:value['menuID'],
                    app_xmlid:value['xmlID'],
                    app_actionid:value['actionID'],
                }))
                if (value['use_icon']) {
                    if (value['icon_class_name']) {
                        var icon_span = "<span class='ri "+value['icon_class_name']+"'/>"
                        $(searchapps).find('.app-image').append($(icon_span))
                    } else if (value['icon_img']) {
                        var icon_image = "<img class='img img-fluid' src='/web/image/ir.ui.menu/"+value['id']+"/icon_img' />"
                        $(searchapps).find('.app-image').append($(icon_image))
                    } else if (value['webIconData'].toString() === 'false') {
                        var icon_image = "<img class='img img-fluid' src='/spiffy_theme_backend/static/description/bizople-icon.png' />"
                        $(searchapps).find('.app-image').append($(icon_image))
                    } else {
                        var icon_image = "<img class='img img-fluid use_icon' src='/web/image/ir.ui.menu/"+value['id']+"/web_icon_data' />"
                        $(searchapps).find('.app-image').append($(icon_image))
                    }
                } else {
                    if (value['icon_img']) {
                        var icon_image = "<img class='img img-fluid' src='/web/image/ir.ui.menu/"+value['id']+"/icon_img' />"
                        $(searchapps).find('.app-image').append($(icon_image))
                    } else if (value['webIconData'].toString() === 'false') {
                        var icon_image = "<img class='img img-fluid' src='/spiffy_theme_backend/static/description/bizople-icon.png' />"
                        $(searchapps).find('.app-image').append($(icon_image))
                    } else {
                        var icon_image = "<img class='img img-fluid else' src='/web/image/ir.ui.menu/"+value['id']+"/web_icon_data' />"
                        $(searchapps).find('.app-image').append($(icon_image))
                    }
                }
                $('.apps-list #searched_main_apps').append(searchapps);
            }
        });
        this._GetFavouriteApps();
    },

    _AppsearchResultsNavigate: function(ev) {
        // Find current results and active element (1st by default)
        const all = $(".appdrawer_section #search_result").find(".search_list_content"),
            pre_focused = all.filter(".navigate_active") || $(all[0]);
        let offset = all.index(pre_focused),
            key = ev.key;
        // Keyboard navigation only supports search results
        if (!all.length) {
            return;
        }
        // Transform tab presses in arrow presses
        if (key === "Tab") {
            ev.preventDefault();
            key = ev.shiftKey ? "ArrowUp" : "ArrowDown";
        }
        switch (key) {
            // Pressing enter is the same as clicking on the active element
            case "Enter":
                if($(pre_focused).length){
                    $(pre_focused).find('.autoComplete_highlighted')[0].click();
                    // $('.o_app_drawer .close_fav_app_btn')[0].click();
                }
                break;
            // Navigate up or down
            case "ArrowUp":
                offset--;
                break;
            case "ArrowDown":
                offset++;
                break;
            default:
                // Other keys are useless in this event
                return;
        }
        // Allow looping on results
        if (offset < 0) {
            offset = all.length + offset;
        } else if (offset >= all.length) {
            offset -= all.length;
        }
        // Switch active element
        const new_focused = $(all[offset]);
        pre_focused.removeClass("navigate_active");
        new_focused.addClass("navigate_active");
        $(".appdrawer_section #search_result").scrollTo(new_focused, {
            offset: {
                top: $(".appdrawer_section #search_result").height() * -0.5,
            },
        });
    },

    _menuInfo(key) {
        return this._drawersearchableMenus[key];
    },

    _searchAppDrawerTimeout: function (ev) {
        this._search_def = new Promise((resolve) => {
            setTimeout(resolve, 100);
        });
        this._search_def.then(this._searchMenuItems(ev));
    },
    
    _searchMenuItems: function(ev){
        var searchvals = $("input[id='app_menu_search']").val()
        this._getsearchedapps(searchvals);
        $(".appdrawer_section .apps-list .row").toggleClass('d-none',Boolean(searchvals.length));
        if (searchvals === "") {
            $(".appdrawer_section #search_result").empty();
            $(".appdrawer_section #searched_main_apps").empty().removeClass('d-flex').addClass('d-none');
            return;
        }
        const query = searchvals;
        this.state.hasResults = query !== "";
        var results = this.state.hasResults
            ? fuzzyLookup(searchvals, _.keys(this._drawersearchableMenus), (k) => k)
            : [];
        $(".appdrawer_section #search_result").html(
            core.qweb.render("spiffy_theme_backend.MenuSearchResults", {
                results: results,
                widget: this,
            })
        );
    },

    _AppdrawerIcons: function() {
        var self = this
        var apps = this.menuService.getApps()
        var rec_ids = []
        apps.map(app => rec_ids.push(app.id))
        ajax.jsonRpc('/get/irmenu/icondata','call', {
            'menu_ids':rec_ids,
        }).then(function(rec) {
            $.each(apps, function( key, value ) {
                var target_tag = '.appdrawer_section a.o_app[data-menu-id='+value.id+']'
                var $tagtarget = $(target_tag)
                $tagtarget.find('.app-image').empty()

                var current_record = rec[value.id][0]
                value.id = current_record.id
                value.use_icon = current_record.use_icon
                value.icon_class_name = current_record.icon_class_name
                value.icon_img = current_record.icon_img

                if (current_record.use_icon) {
                    if (current_record.icon_class_name) {
                        var icon_image = "<span class='ri "+current_record.icon_class_name+"'/>"
                    } else if (current_record.icon_img) {
                        var icon_image = "<img class='img img-fluid' src='/web/image/ir.ui.menu/"+current_record.id+"/icon_img' />"
                    } else if (current_record.web_icon != false) {
                        var icon_data = current_record.web_icon.split('/icon.')
                        if (icon_data[1] == 'svg'){
                            var web_svg_icon = current_record.web_icon.replace(',', '/')
                            var icon_image = "<img class='img img-fluid' src='"+web_svg_icon+"' />"
                        } else {
                            var icon_image = "<img class='img img-fluid' src='data:image/"+icon_data[1]+";base64,"+current_record.web_icon_data+"' />"
                        }
                    } else{
                        var icon_image = "<img class='img img-fluid' src='/spiffy_theme_backend/static/description/bizople-icon.png' />"
                        }
                    $tagtarget.find('.app-image').append($(icon_image))
                } else {
                    if (current_record.icon_img) {
                        var icon_image = "<img class='img img-fluid' src='/web/image/ir.ui.menu/"+current_record.id+"/icon_img' />"
                    } else if (current_record.web_icon != false){
                        var icon_data = current_record.web_icon.split('/icon.')
                        if (icon_data[1] == 'svg'){
                            var web_svg_icon = current_record.web_icon.replace(',', '/')
                            var icon_image = "<img class='img img-fluid' src='"+web_svg_icon+"' />"
                        } else {
                            var icon_image = "<img class='img img-fluid' src='data:image/"+icon_data[1]+";base64,"+current_record.web_icon_data+"' />"
                        }
                    } else{
                        var icon_image = "<img class='img img-fluid' src='/spiffy_theme_backend/static/description/bizople-icon.png' />"
                    }
                    $tagtarget.find('.app-image').append($(icon_image))
                }
            })
            
        })
    },
});