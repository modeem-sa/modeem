modeem.define('spiffy_theme_backend.MenuJs', function (require) {
    'use strict';

     var {fuzzyLookup} = require("@web/core/utils/search");
     var ajax = require('web.ajax');
     var core = require('web.core');
     var qweb = core.qweb;
     var ColorPallet = require('spiffy_theme_backend.ColorPalletJS')
     const config = require("web.config");
 
     var { NavBar } = require("@web/webclient/navbar/navbar");
     var { patch } = require("web.utils");
     const { useListener } = require("@web/core/utils/hooks");
     var session = require("@web/session");

     var { browser } = require("@web/core/browser/browser");
     var { useService } = require("@web/core/utils/hooks");

     var { loadCSS, loadJS } = require("@web/core/assets");

     const {useExternalListener, onMounted } = owl;
 
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

    var session_dict = {'demo':'demo'}
    var methods = {}
    /**
     * Responsible for invoking native methods which called from JavaScript
     *
     * @param {String} name name of action want to perform in mobile
     * @param {Object} args extra arguments for mobile
     *
     * @returns Promise Object
     */

    methods['divertColor'] = function () {
        return divertColor('divert_color', session_dict);
    };
 
     patch(NavBar.prototype, "theme_backend.MenuJs", {
         async setup(parent, menuData) {
             this._super();
            var self = this
            this.companyService = useService("company");
            this.currentCompany = this.companyService.currentCompany;

             $(document).on('click', '.bookmark_section .dropdown-toggle', function(ev){self._getCurrentPageName(ev)});
             $(document).on('click', '.bookmark_section .add_bookmark', function(ev){self._saveBookmarkPage(ev)});
             $(document).on('contextmenu', '.bookmark_list .bookmark_tag', function(ev){self._showbookmarkoptions(ev)});
             $(document).on('click', '.magnifier_section .minus', function(ev){self._magnifierZoomOut(ev)});
             $(document).on('click', '.magnifier_section .plus', function(ev){self._magnifierZoomIn(ev)});
             $(document).on('click', '.magnifier_section .reset', function(ev){self._magnifierZoomReset(ev)});
             $(document).on('click', '.fullscreen_section > a.full_screen', function(ev){self._FullScreenMode(ev)});
             $(document).on("click", ".theme_selector a", function(ev){self._openConfigModal(ev)})
             $(document).on('click', '#dark_mod', function(ev){self._ChangeThemeModeCLicked(ev)});
             $(document).on('click', '.pin_sidebar', function(ev){self._ChangeSidebarBehaviour(ev)});
            //  $(document).on('click', '.lang_selector', function(ev){self._GetLanguages(ev)});
 
             $(document).on('click', '.o_navbar_apps_menu .main_link', function(ev){self._ShowCurrentMenus(ev)});

             // SPIFFY MULTI TAB START
             $(document).on('click', '.o_navbar_apps_menu .child_menus', function(ev){self._childMenuClick(ev)});
             $(document).on('click', '.o_menu_sections .o_menu_entry_lvl_2, .o_menu_sections .o_nav_entry', function(ev){self._childMenuClick(ev)});
             $(document).on('click', '.multi_tab_section .multi_tab_div a', function(ev){self._TabClicked(ev)});
             $(document).on('click', '.multi_tab_section .remove_tab', function(ev){self._RemoveTab(ev)});
             // SPIFFY MULTI TAB END

             $(document).on('click', '.search_bar, .close-search-bar', function(ev){self._showSearchbarModal(ev)});
             $(document).on('shown.bs.modal', '#search_bar_modal', function(ev){self._searchModalFocus(ev)});
             $(document).on('hidden.bs.modal', '#search_bar_modal', function(ev){self._searchModalReset(ev)});
 
             $(document).on('keydown', '#searchPagesInput', function(ev){self._searchResultsNavigate(ev)});
             $(document).on('input', '#searchPagesInput', function(ev){self._searchMenuTimeout(ev)});
             $(document).on('click', '#searchPagesResults .autoComplete_highlighted', function(ev){self._searchResultChosen(ev)});
 
             $(document).on('click', '.o_app_drawer a', function(ev){self._OpenAppdrawer(ev)});
             $(document).on('click', '.mobile-header-toggle #mobileMenuToggleBtn', function(ev){self._mobileHeaderToggle(ev)});
             $(document).on('click', '.o_menu_sections #mobileMenuclose', function(ev){self._mobileHeaderClose(ev)});
             $(document).on('click', '.fav_app_drawer .fav_app_drawer_btn', function(ev){self._OpenFavAppdrawer(ev)});
             $(document).on('click', '.appdrawer_section .close_fav_app_btn', function(ev){self._CloseAppdrawer(ev)});
 
             $(document).on('click', '.debug_activator .activate_debug', function(ev){self._DebugToggler(ev)});

             $(document).on("click", ".header_to_do_list .to_do_list", function(ev){self._openToDoList(ev)});
 
             this._searchableMenus = [];
             var menu = this.menuService.getApps()
            for (const menu of this.menuService.getApps()) {
                Object.assign(
                    this._searchableMenus,
                    _.reduce([this.menuService.getMenuAsTree(menu.id)], findNames, {})
                );
            }
             this._search_def = false;
 
             // on reload get mode color
             this._getModeData();
             // on reload add backend theme class
             this.addconfiguratorclass()
             // on reload add bookmark tags in menu
             this.addbookmarktags()
             
             // get all apps menu data
             this._all_apps_menu_data()
             
             // SPIFFY MULTI TAB START - on reload add multi tabs
             this.addmultitabtags()
             // SPIFFY MULTI TAB END
             this._GetLanguages()

             // close magnifier when clicked outside the magnifer div
             $(document).on("click", function(e) {
                 if (!$(e.target).closest('.magnifier_section').length) {
                     $('#magnifier').collapse("hide")
                 }
               });
 
             /* EVENTS FOR WINDOW FULLSCREEN WITH ESC BUTTON TRIGGER */
             document.addEventListener("fullscreenchange", function() {
                if (!document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement){
                    var fullScreenBtn = $('.fullscreen_section .full_screen');
                    if($(fullScreenBtn).hasClass('fullscreen-exit')){
                        $(fullScreenBtn).removeClass('fullscreen-exit')
                    }
                }
            });
            document.addEventListener("mozfullscreenchange", function() {
                if (!document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement){
                    var fullScreenBtn = $('.fullscreen_section .full_screen');
                    if($(fullScreenBtn).hasClass('fullscreen-exit')){
                        $(fullScreenBtn).removeClass('fullscreen-exit')
                    }
                }
            });
            document.addEventListener("webkitfullscreenchange", function() {
                if (!document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement){
                    var fullScreenBtn = $('.fullscreen_section .full_screen');
                    if($(fullScreenBtn).hasClass('fullscreen-exit')){
                        $(fullScreenBtn).removeClass('fullscreen-exit')
                    }
                }
            });
            document.addEventListener("msfullscreenchange", function() {
                if (!document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement){
                    var fullScreenBtn = $('.fullscreen_section .full_screen');
                    if($(fullScreenBtn).hasClass('fullscreen-exit')){
                        $(fullScreenBtn).removeClass('fullscreen-exit')
                    }
                }
            });

            var size = $(window).width();
            var upTo1200 = size <= 1023.98

            this.isIpad = upTo1200
            this.$search_modal_popup = $(this.root.el).find("#search_bar_modal");
            this.$search_modal_input = $(this.root.el).find("#search_bar_modal input");
            this.$search_modal_select = $(this.root.el).find("#search_bar_modal select");
            this.$search_modal_results = $(this.root.el).find("#search_bar_modal #searchPagesResults");
            this.$search_modal_Noresults = $(this.root.el).find("#search_bar_modal .searchNoResult");

            var currentapp = this.menuService.getCurrentApp();
         },

         _DebugToggler: function (ev) {
             $(ev.currentTarget).toggleClass('toggle');
             if ($(ev.currentTarget).hasClass('toggle')) {
                 var current_href = window.location.href;
                 window.location.search = "?debug=1"
             } else {
                 window.location.search = "?debug="
             }
         },
 
         _on_secondary_menu_click: function (menu_id, action_id) {
             this._super.apply(this, arguments);
             $('.o_menu_sections').removeClass('toggle');
             $('body').removeClass('backdrop');
         },
 
         _mobileHeaderToggle: function (ev) {
             var menu_brand = $('.o_main_navbar > a.o_menu_brand').clone()
             $('.o_menu_sections > a.o_menu_brand').remove()
             $('#mobileMenuclose').before(menu_brand)
             $('.o_menu_sections').addClass('toggle');
             $('body').addClass('backdrop');
         },
         _mobileHeaderClose: function (ev) {
             $('.o_menu_sections').removeClass('toggle');
             $('body').removeClass('backdrop');
         },
         _OpenAppdrawer: function (ev) {
            this._AppdrawerIcons()

             $('.o_main_navbar').toggleClass('appdrawer-toggle')
             // $(ev.currentTarget).toggleClass('toggle')
             $('.appdrawer_section').toggleClass('toggle')
 
             if ($(".appdrawer_section").hasClass('toggle')) {
                 var size = $(window).width();
                 if (size > 992){
                     setTimeout(() => $(".appdrawer_section input").focus(), 100);
                 }
             } else {
                 $(".appdrawer_section input").val("");
                 $(".appdrawer_section #search_result").empty();
                 $('#searched_main_apps').empty().addClass('d-none').removeClass('d-flex');
                 $('.appdrawer_section .apps-list .row').removeClass('d-none');
             }
         },
         _OpenFavAppdrawer: function (ev) {
             this._OpenAppdrawer(ev)
             $('.appdrawer_section').toggleClass('show_favourite_apps')
         },
 
         _CloseAppdrawer: function (ev) {
             $('.o_main_navbar').removeClass('appdrawer-toggle')
             $('.appdrawer_section').removeClass('show_favourite_apps')
             $('.appdrawer_section').removeClass('toggle')
             $(".appdrawer_section input").val("");
             $(".appdrawer_section #search_result").empty();
             $('#searched_main_apps').empty().addClass('d-none').removeClass('d-flex');
             $('.appdrawer_section .apps-list .row').removeClass('d-none');
         },
 
         _ShowCurrentMenus: function (ev) {
             $(ev.target).parent().parent().find('ul').removeClass('show')
             $(ev.target).parent().parent().find('a.main_link').removeClass('active')
             $(ev.target).parent().find('ul').addClass('show')
             $(ev.target).addClass('active')

             // SPIFFY MULTI TAB START
             if (ev.shiftKey) {
                this._createMultiTab(ev)
                ev.preventDefault()
             } else {
             }
             // SPIFFY MULTI TAB END
         },

         _all_apps_menu_data: function () {
            var menu_data = this.menuService.getApps()
            var self = this;
            var rec_ids = []
            menu_data.map(app => rec_ids.push(app.id))
            // menu_data.children.map(app => rec_ids.push(app.id))
            ajax.jsonRpc('/get/irmenu/icondata','call', {
                'menu_ids':rec_ids,
            }).then(function(rec) {
                $.each(menu_data, function( key, value ) {
                    var target_tag = '.o_navbar_apps_menu a.main_link[data-menu='+value.id+']'
                    var $tagtarget = $(self.root.el).find(target_tag)

                    $tagtarget.find('.app_icon').empty()
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
                        $tagtarget.find('.app_icon').append($(icon_image))
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
                        $tagtarget.find('.app_icon').append($(icon_image))
                    }
                });
            })
        },

         // SPIFFY MULTI TAB START
         _childMenuClick: function (ev){
            ev.preventDefault();
            var menu = this.menuService.getMenu($(ev.target).data('menu'))
            if (menu) {
                this.onNavBarDropdownItemSelection(menu)
            }
            
            if (ev.shiftKey) {
                this._createMultiTab(ev)
                ev.preventDefault()
             } else {
             }
         },

         _createMultiTab: function (ev) {
            var tab_name = $(ev.target).find('.app_name').text() || $(ev.target).text()
            var url = $(ev.target).attr('href')
            var actionId = $(ev.target).data('action-id')
            var menuId = $(ev.target).data('menu')
            var menu_xmlid = $(ev.target).data('menu-xmlid')
            var menu_xmlid = menu_xmlid.split('.')[0]
            var self = this
            localStorage.setItem('LastCreatedTab',actionId)

            ajax.jsonRpc('/add/mutli/tab','call', {
                'name':tab_name,
                'url':url,
                'actionId':actionId,
                'menuId':menuId,
                'menu_xmlid':menu_xmlid,
            }).then(function(rec) {
                self.addmultitabtags(ev)
            });
         },

         addmultitabtags: function (ev) {
            var self = this
            ajax.jsonRpc('/get/mutli/tab','call', {
            }).then(function(rec) {
                if (rec){
                    $('.multi_tab_section').empty()
                    $.each(rec, function( key, value ) {
                        var tab_tag = '<div class="d-flex justify-content-between multi_tab_div"><a href="'+ value.url +'"'+' class="flex-fill" data-xml-id="'+ value.menu_xmlid +'" data-menu="'+ value.menuId +'" data-action-id="'+ value.actionId +'" multi_tab_id="'+value.id+'" multi_tab_name="'+value.name+'"><span>'+value.name+'</span></a><span class="remove_tab ml-4">X</span></div>'
                        $('.multi_tab_section').append(tab_tag)
                    })
                    var SpiffystoredActionId = sessionStorage.getItem("spiffy_current_action_id");
                    var SpiffystoredAction = sessionStorage.getItem("spiffy_current_action");

                    if (SpiffystoredActionId){
                        var TabDiv = $('.multi_tab_section .multi_tab_div');
                        var ActiveMenu = TabDiv.find('a[data-action-id="'+ SpiffystoredActionId +'"]');
                        ActiveMenu.parent().addClass('tab_active')
                    }

                    if (ev) {
                        var actionId = $(ev.target).data('action-id')
                        var menu_xmlid = $(ev.target).attr('data-menu-xmlid')
                        var menu_xmlid = menu_xmlid.split('.')[0]

                        if(localStorage.getItem('LastCreatedTab')){
                            var target = '.multi_tab_section .multi_tab_div a[data-action-id="'+ localStorage.getItem('LastCreatedTab') +'"]'
                            $(target).parent().addClass('tab_active')
                            $(target)[0].click()
                            localStorage.removeItem('LastCreatedTab')
                        } else {
                            var target = '.multi_tab_section .multi_tab_div a[data-xml-id="'+ menu_xmlid +'"]'
                            $(target).parent().addClass('tab_active')
                            $(target)[0].click()
                        }
                    }
                    $('body').addClass("multi_tab_enabled");
                } else {
                    $('body').removeClass("multi_tab_enabled");
                }
            });
         },

         _RemoveTab: function (ev) {
            var self = this
            var multi_tab_id = $(ev.target).parent().find('a').attr('multi_tab_id')
            ajax.jsonRpc('/remove/multi/tab','call', {
                'multi_tab_id':multi_tab_id,
            }).then(function(rec) {
                if (rec){
                    if(rec['removeTab']){
                        $(ev.target).parent().remove()
                        var FirstTab = $('.multi_tab_section').find('.multi_tab_div:first-child')
                        if(FirstTab.length){
                            $(FirstTab).find('a')[0].click()
                            $(FirstTab).addClass('tab_active')
                        }
                    }
                    if(rec['multi_tab_count'] == 0){
                        $('body').removeClass("multi_tab_enabled");
                    }
                }
            });
         },
         _TabClicked: function (ev){
             localStorage.setItem("TabClick", true);
             localStorage.setItem("TabClickTilteUpdate", true);
            if($(ev.target).data('action-id')){
                $('.multi_tab_section').find('.tab_active').removeClass('tab_active');
                $(ev.target).parent().addClass('tab_active')
            }
         },
         // SPIFFY MULTI TAB END

         change_menu_section: function (primary_menu_id) {
             this._super.apply(this, arguments);
             var target_tag = '.o_navbar_apps_menu a.main_link[data-menu='+primary_menu_id+']'
             var $tagtarget = $(target_tag)
             $tagtarget.parent().find('ul').addClass('show')
             $tagtarget.addClass('active')
         },
         _getModeData: function() {
            var self = this
             ajax.rpc('/get/dark/mode/data').then(function(rec) {
                 var dark_mode = rec
                 self._ChangeThemeMode(dark_mode)
             })
         },
         addconfiguratorclass: function (){
             ajax.rpc('/get/model/record').then(function(rec) {
                 $("body").addClass(rec.record_dict[0].separator);
                 $("body").addClass(rec.record_dict[0].tab);
                 $("body").addClass(rec.record_dict[0].checkbox);
                 $("body").addClass(rec.record_dict[0].button);
                 $("body").addClass(rec.record_dict[0].radio);
                 $("body").addClass(rec.record_dict[0].popup);
                 $("body").addClass(rec.record_dict[0].font_size);
                 $("body").addClass(rec.record_dict[0].login_page_style);
                 $("body").addClass(rec.record_dict[0].chatter_position);
                 $("body").addClass(rec.record_dict[0].list_view_density);
 
                 // Load Font size file based on selected option
                 if(rec.record_dict[0].font_size){
                    loadCSS(`/spiffy_theme_backend/static/src/scss/font_sizes/${rec.record_dict[0].font_size}.css`);
                 }
 
                 var size = $(window).width();
                 if (size <= 992){
                     $("body").addClass('top_menu_horizontal');
                     $("html").attr('data-menu-position','top_menu_horizontal')
                     $("html").attr('data-view-type','mobile')
                 } else {
                     $("body").addClass(rec.record_dict[0].top_menu_position);
                     $("html").attr('data-menu-position',rec.record_dict[0].top_menu_position)
                     $("html").attr('data-view-type','desktop')
                 }
 
                 $("body").addClass(rec.record_dict[0].theme_style);
                 $("body").addClass(rec.record_dict[0].loader_style);
                 $("body").addClass('font_family_'+rec.record_dict[0].font_family);
 
                 $("html").attr('data-font-size',rec.record_dict[0].font_size)
                 $("html").attr('data-theme-style',rec.record_dict[0].theme_style)
                 
                 if (rec.record_dict[0].use_custom_drawer_color) {
                     $("body").addClass('custom_drawer_color');
                 } else {
                     $("body").addClass(rec.record_dict[0].drawer_color_pallet);
                 }
                 
                 if (rec.record_dict[0].attachment_in_tree_view) {
                     $("body").addClass("show_attachment");
                 }
                 if (rec.darkmode) {
                     $("body").addClass(rec.darkmode);
                 }
                 if (rec.prevent_auto_save) {
                    $("body").addClass(rec.prevent_auto_save);
                 }
                 if (!rec.todo_list_enable) {
                    // $("body").addClass(rec.todo_list_enable);
                    $('.header_to_do_list').remove()
                 }
                 if (rec.pinned_sidebar) {
                     $("body").addClass(rec.pinned_sidebar);
                     $("header .pin_sidebar").addClass('pinned');
                 }
                 if (rec.record_dict[0].tree_form_split_view) {
                     $("body").addClass("tree_form_split_view");
                 }
                 if (rec.record_dict[0].list_view_sticky_header) {
                    $("body").addClass("list_view_sticky_header");
                 }
                 if (rec.record_dict[0].apply_light_bg_img){
                     if (rec.record_dict[0].light_bg_image){
                         $(".appdrawer_section").attr("style", "background-image: url('/web/image/backend.config/"+rec.record_dict[0].id+"/light_bg_image')");
                     }
                 }

                 if (!rec.show_edit_mode){
                    $('.theme_selector').remove()
                }
                if (!rec.is_admin) {
                   $('.debug_activator').remove()
                }
                var pallet_name = rec.record_dict[0].color_pallet
                var apply_color = new ColorPallet(this)
                if (rec.record_dict[0].use_custom_colors) {
                    apply_color['custom_color_pallet'](rec.record_dict[0])
                } else {
                    apply_color[pallet_name]()
                }

                var app_drawer_pallet_name = rec.record_dict[0].drawer_color_pallet
                var app_drawer_apply_color = new ColorPallet(this)
                if (rec.record_dict[0].use_custom_drawer_color) {
                    app_drawer_apply_color['custom_app_drawer_color_pallet'](rec.record_dict[0])
                }

                $('body').attr('headerMode', 'visible');
                // $('.o_main_navbar').removeClass('d-none');
             })
         },
         addbookmarktags: function(){
             ajax.jsonRpc('/get/bookmark/link','call', {
             }).then(function(rec) {
                 $('.bookmark_list').empty()
                 $.each(rec, function( key, value ) {
                     var anchor_tag = '<div class="d-inline-block bookmark_div"><a href="'+ value.url +'"'+' class="bookmark_tag btn-light btn demo_btn" bookmark-id="'+value.id+'" bookmark-name="'+value.name+'" title="'+value.name+'">'+value.title+'</a></div>'
                     $('.bookmark_list').append(anchor_tag)
                 })
             });
         },
         _getCurrentPageName: function(){
             var breadcrumbs = $('.o_control_panel ol.breadcrumb li')
             var bookmark_name = ""
             $(breadcrumbs).each(function( index ) {
                 if (index > 0) {
                     bookmark_name = bookmark_name + ' | ' + $(this).text()
                 } else {
                     bookmark_name = $(this).text()
                 }
             });
 
             $('input#bookmark_page_name').val(bookmark_name)
         },
         _saveBookmarkPage: function(){
             var self = this
             var pathname = window.location.pathname
             var hash = window.location.hash
             var url = pathname + '?' + hash
             var name = $('input#bookmark_page_name').val()
             var title = $('input#bookmark_page_name').val().substr(0, 2)
             ajax.jsonRpc('/add/bookmark/link','call', {
                 'name':name,
                 'url':url,
                 'title':title,
             }).then(function(rec) {
                 self.addbookmarktags()
             });
         },
         _showbookmarkoptions: function(ev) {
             var self = this
             ev.preventDefault();
             var bookmark_id = $(ev.target).attr('bookmark-id')
             var bookmark_name = $(ev.target).attr('bookmark-name')
             $('.bookmark_list .bookmark_options').remove()
             $('.bookmark_list .bookmark_rename_section').remove()
             var bookmark_options = $(qweb.render("BookmarkOptions", {
                 bookmark_id:bookmark_id,
             }))
             $(ev.target).parent().append(bookmark_options)
             $('.bookmark_list .rename_bookmark').on("click", function(e) {
                 self._RenameBookmark(ev.target,bookmark_id,bookmark_name);
             });
 
             $('.bookmark_list .remove_bookmark').on("click", function(e) {
                 self._RemoveBookmark(bookmark_id);
             });
            //  document.addEventListener("click", function(){
            //      $('.bookmark_list .bookmark_options').remove()
            //  });
            //  useExternalListener(document, "click", () => {
            //     $('.bookmark_list .bookmark_options').remove()
            //  });
             ev.preventDefault();
         },
         _RenameBookmark: function(elem,bookmark_id,bookmark_name) {
             var self = this
             var bookmark_rename = $(qweb.render("BookmarkRename", {
                 bookmark_id:bookmark_id,
                 bookmark_name:bookmark_name,
             }))
             $(elem).parent().append(bookmark_rename)
 
             $('.bookmark_list .bookmark_rename_cancel').on("click", function(e) {
                 $('.bookmark_list .bookmark_rename_section').remove()
             });
             $('.bookmark_list .bookmark_rename').on("click", function(e) {
                 var new_bookmark_name = $('input#bookmark_rename').val()
                 self._UpdateBookmark(bookmark_id,new_bookmark_name);
             });
         },
         _RemoveBookmark: function(bookmark_id) {
             var self = this
             ajax.jsonRpc('/remove/bookmark/link','call', {
                 'bookmark_id':bookmark_id,
             }).then(function(rec) {
                 self.addbookmarktags()
             });
         },
         _UpdateBookmark: function(bookmark_id,bookmark_name) {
             var self = this
             var title = bookmark_name.substr(0, 2)
             ajax.jsonRpc('/update/bookmark/link','call', {
                 'bookmark_id':bookmark_id,
                 'bookmark_name':bookmark_name,
                 'bookmark_title':title,
             }).then(function(rec) {
                 self.addbookmarktags()
             });
         },
         _magnifierZoomOut: function(){
             var current_zoom = parseInt($('.zoom_value').text())
             var current_zoom = current_zoom - 10
             if (current_zoom > 20) {
                 $('.zoom_value').text(current_zoom)
                 var scale_value = current_zoom/100
                 var width_value = ((100/current_zoom)*100).toFixed(4)
                 if ($('.o_content > div').length > 1) {
                     var target = $('.o_action_manager > .o_view_controller > .o_content')
                 } else {
                     var target = $('.o_content > div')
                 }
                 $(target).css({
                     'width': width_value+'%',
                     'transform-origin': 'left top',
                     'transform': 'scale('+scale_value+')',
                 })
             }
         },
         _magnifierZoomIn: function(){
             var current_zoom = parseInt($('.zoom_value').text())
             var current_zoom = current_zoom + 10
             if (current_zoom < 210) {
                 $('.zoom_value').text(current_zoom)
                 var scale_value = current_zoom/100
                 var width_value = ((100/current_zoom)*100).toFixed(4)
                 if ($('.o_content > div').length > 1) {
                     var target = $('.o_action_manager > .o_view_controller > .o_content')
                 } else {
                     var target = $('.o_content > div')
                 }
                 $(target).css({
                     'width': width_value+'%',
                     'transform-origin': 'left top',
                     'transform': 'scale('+scale_value+')',
                 })
             }
         },
         _magnifierZoomReset: function(){
             $('.zoom_value').text('100')
             if ($('.o_content > div').length > 1) {
                 var target = $('.o_action_manager > .o_view_controller > .o_content')
             } else {
                 var target = $('.o_content > div')
             }
             $(target).css({
                 'width': '100%',
                 'transform-origin': 'left top',
                 'transform': 'scale(1)',
             })
         },
         _FullScreenMode: function(ev) {
             var elem = document.documentElement;
             if ($(ev.currentTarget).hasClass('fullscreen-exit')) {
                 if (document.exitFullscreen) {
                     document.exitFullscreen();
                     $(ev.currentTarget).removeClass('fullscreen-exit')
                 } else if (document.webkitExitFullscreen) { /* Safari */
                     document.webkitExitFullscreen();
                     $(ev.currentTarget).removeClass('fullscreen-exit')
                 } else if (document.msExitFullscreen) { /* IE11 */
                     document.msExitFullscreen();
                     $(ev.currentTarget).removeClass('fullscreen-exit')
                 }
             } else {
                 if (elem.requestFullscreen) {
                     elem.requestFullscreen();
                     $(ev.currentTarget).addClass('fullscreen-exit')
                 } else if (elem.webkitRequestFullscreen) { /* Safari */
                     elem.webkitRequestFullscreen();
                     $(ev.currentTarget).addClass('fullscreen-exit')
                 } else if (elem.msRequestFullscreen) { /* IE11 */
                     elem.msRequestFullscreen();
                     $(ev.currentTarget).addClass('fullscreen-exit')
                 }
             }
         },
         _openConfigModal: function() {
             var self = this
             self.showeditmodal();
             $('.dynamic_data').toggleClass('visible')
             $('body.o_web_client').toggleClass('backdrop')
         },
         showeditmodal: function (ev) {
             $.get('/color/pallet/data/', 'call', {}).then(function(data) {
           
                 $(".dynamic_data").empty()
                 $(".dynamic_data").append(data)
 
                 $('#theme_color_pallets #use_custom_color_config').unbind().on('change', function(e) {
                     if($(this).prop("checked") == true){
                         $('#theme_color_pallets .custom_color_config').removeClass('d-none')
                         $('#theme_color_pallets .predefined_color_pallets').addClass('d-none')
                     } else {
                         $('#theme_color_pallets .custom_color_config').addClass('d-none')
                         $('#theme_color_pallets .predefined_color_pallets').removeClass('d-none')
                     }
                 });
                 
 
                 $('#app_drawer #use_custom_drawer_color').unbind().on('change', function(e) {
                     if($(this).prop("checked") == true){
                         $('#app_drawer .custom_color_config').removeClass('d-none')
                         $('#app_drawer .predefined_color_pallets').addClass('d-none')
                     } else {
                         $('#app_drawer .custom_color_config').addClass('d-none')
                         $('#app_drawer .predefined_color_pallets').removeClass('d-none')
                     }
                 });
 
                 $('#app_drawer #apply_light_bg').unbind().on('change', function(e) {
                     if($(this).prop("checked") == true){
                         $('#app_drawer .app-drawer-bg-image-content').removeClass('d-none')
                     } else {
                         $('#app_drawer .app-drawer-bg-image-content').addClass('d-none')
                     }
                 });
 
                 $('.app_bg_img_light').unbind().on('change', function(e) {
                     var upload_image = document.querySelector('#light_bg_image').files[0];
                         var reader1 = new FileReader();
                         var bg_data = reader1.readAsDataURL(upload_image);
                         reader1.onload = function(e){
                         var selected_bg_image = e.target.result;
                         window.app_light_bg_image =  selected_bg_image
                     }
                     var fileName = $(this).val().split("\\").pop();
                     $(this).siblings(".custom-file-label").addClass("selected").html(fileName);
                 });
 
                 $('.app_bg_img_dark').unbind().on('change', function(e) {
                     var upload_image = document.querySelector('#dark_bg_image').files[0];
                         var reader1 = new FileReader();
                         var bg_data = reader1.readAsDataURL(upload_image);
                         reader1.onload = function(e){
                         var selected_bg_image = e.target.result;
                         window.app_dark_bg_image =  selected_bg_image
                     }
                 });
 
                 $('#separator').unbind().on('change', function(){
                     $("#theme_separator_style .preview").removeClass("separator_style_4 separator_style_3 separator_style_2 separator_style_1");
                     var current_separator_style = $('#separator').val()
                     $("#theme_separator_style .preview").addClass(current_separator_style);
                 });
 
                 $('#tab').unbind().on('change', function(){
                     $("#theme_tab_style .preview").removeClass("tab_style_4 tab_style_3 tab_style_2 tab_style_1");
                     var current_tab_style = $('#tab').val()
                     $("#theme_tab_style .preview").addClass(current_tab_style);
                 });
 
                 $('#checkbox').unbind().on('change', function(){
                     $("#theme_checkbox_style .preview").removeClass("checkbox_style_4 checkbox_style_3 checkbox_style_2 checkbox_style_1");
                     var current_checkbox_style = $('#checkbox').val()
                     $("#theme_checkbox_style .preview").addClass(current_checkbox_style);
                 });
 
                 $('#radio').unbind().on('change', function(){
                     $("#theme_radio_style .preview").removeClass("radio_style_4 radio_style_3 radio_style_2 radio_style_1");
                     var current_radio_style = $('#radio').val()
                     $("#theme_radio_style .preview").addClass(current_radio_style);
                 });
                 $('#button').unbind().on('change', function(){
                     $("#theme_buttons_style .preview").removeClass("button_style_4 button_style_3 button_style_2 button_style_1");
                     var current_button_style = $('#button').val()
                     $("#theme_buttons_style .preview").addClass(current_button_style);
                 });
 
                 $('#popup').unbind().on('change', function(){
                     $("#theme_popup_style .preview").removeClass("popup_style_4 popup_style_3 popup_style_2 popup_style_1");
                     var current_popup_style = $('#popup').val()
                     $("#theme_popup_style .preview").addClass(current_popup_style);
                 });
 
                 $(".selected_value").on('click', function(){
                     var light_primary_bg_color = $("input[id='primary_bg']").val()
                     var light_primary_text_color = $("input[id='primary_text']").val()
                     var light_secondry_bg_color = $("input[id='secondry_bg']").val()
                     var light_secondry_text_color = $("input[id='secondry_text']").val()
 
                     var custom_color_pallet = $("input[id='use_custom_color_config']").is(':checked')
                     var selected_color_pallet = $("input[name='color_pallets']:checked").val()
 
                     var custom_drawer_bg = $("input[id='custom_drawer_bg']").val()
                     var custom_drawer_text = $("input[id='custom_drawer_text']").val()
 
                     var custom_drawer_color_pallet = $("input[id='use_custom_drawer_color']").is(':checked')
                     var selected_drawer_color_pallet = $("input[name='drawer_color_pallets']:checked").val()
                     
                     var apply_light_bg_img = $("input[id='apply_light_bg']").is(':checked')
                     
                     var tree_form_split_view = $("input[id='tree_form_split_view']").is(':checked')
                     var attachment_in_tree_view = $("input[id='attachment_in_tree_view']").is(':checked')
 
                     if (window.app_light_bg_image) {
                         var app_light_bg_img = window.app_light_bg_image
                     } else if ($("input[id='light_bg_image']").attr('value')){
                         var app_light_bg_img = $("input[id='light_bg_image']").attr('value')
                     }
                     else {
                         var app_light_bg_img = false
                     }
                     var light_body_bg_color = $("input[id='body_bg']").val()
                     var light_body_text_color = $("input[id='body_text']").val()
 
                     var dark_primary_bg_color = $("input[id='dark_primary_bg']").val()
                     var dark_primary_text_color = $("input[id='dark_primary_text']").val()
                     var dark_secondry_bg_color = $("input[id='dark_secondry_bg']").val()
                     var dark_secondry_text_color = $("input[id='dark_secondry_text']").val()
 
                     if (window.app_dark_bg_image) {
                         var app_dark_bg_img = window.app_dark_bg_image
                     } else if ($("input[id='dark_bg_image']").attr('value')){
                         var app_dark_bg_img = $("input[id='dark_bg_image']").attr('value')
                     }
                     else {
                         var app_dark_bg_img = false
                     }
                     var dark_body_bg_color = $("input[id='dark_body_bg']").val()
                     var dark_body_text_color = $("input[id='dark_body_text']").val()
 
                     var selected_separator = $("input[name='separator']:checked").val()
                     var selected_tab = $("input[name='tab']:checked").val()
                     var selected_checkbox = $("input[name='checkbox']:checked").val()
                     var selected_radio = $("input[name='radio']:checked").val()
                     var selected_popup = $("input[name='popup']:checked").val()
                     var selected_loader = $("input[name='loader_style']:checked").val()
                     var selected_login = $("input[name='login_page_style']:checked").val()
                     var selected_fonts = $("input[name='font_family']:checked").val()
                     var selected_fontsize = $("input[name='font_size']:checked").val()
                     var selected_chatter_position = $("input[name='chatter_position']:checked").val()
                     var selected_top_menu_position = $("input[name='top_menu_position']:checked").val()
                     var selected_theme_style = $("input[name='theme_style']:checked").val()
                     var selected_list_view_density = $("input[name='list_view_density']:checked").val()
                     var selected_list_view_sticky_header = $("input[id='list_view_sticky_header']:checked").val()
                     
                     ajax.rpc('/color/pallet/', {
                         'light_primary_bg_color': light_primary_bg_color,
                         'light_primary_text_color': light_primary_text_color,
                         'light_secondry_bg_color': light_secondry_bg_color,
                         'light_secondry_text_color': light_secondry_text_color,
                         'light_body_bg_color':light_body_bg_color,
                         'light_body_text_color': light_body_text_color,
 
                         'apply_light_bg_img': apply_light_bg_img,
                         'app_light_bg_image': app_light_bg_img,
 
                         'dark_primary_bg_color': dark_primary_bg_color,
                         'dark_primary_text_color': dark_primary_text_color,
                         'dark_secondry_bg_color': dark_secondry_bg_color,
                         'dark_secondry_text_color': dark_secondry_text_color,
                         'dark_body_bg_color':dark_body_bg_color,
                         'dark_body_text_color': dark_body_text_color,
 
                         'app_dark_bg_image': app_dark_bg_img,
 
                         'tree_form_split_view': tree_form_split_view,
                         'attachment_in_tree_view': attachment_in_tree_view,
 
                         'selected_separator':selected_separator,
                         'selected_tab':selected_tab,
                         'selected_checkbox':selected_checkbox,
                         'selected_radio': selected_radio,
                         'selected_popup': selected_popup,
                         'custom_color_pallet': custom_color_pallet,
                         'selected_color_pallet': selected_color_pallet,
 
                         'custom_drawer_bg': custom_drawer_bg,
                         'custom_drawer_text': custom_drawer_text,
                         'custom_drawer_color_pallet': custom_drawer_color_pallet,
                         'selected_drawer_color_pallet': selected_drawer_color_pallet,
                         
                         'selected_loader': selected_loader,
                         'selected_login': selected_login,
                         'selected_fonts': selected_fonts,
                         'selected_fontsize': selected_fontsize,
                         'selected_chatter_position': selected_chatter_position,
                         'selected_top_menu_position': selected_top_menu_position,
                         'selected_theme_style': selected_theme_style,
                         'selected_list_view_density': selected_list_view_density,
                         'selected_list_view_sticky_header': selected_list_view_sticky_header,
                     }).then(function (data) {
                         window.location.reload()
                     })
                 });
                 $('.backend_configurator_close').unbind().click(function(e) {
                     $('.dynamic_data').toggleClass('visible')
                     $('body.o_web_client').toggleClass('backdrop')
                 });
               
             
             })
             $('#myModal').modal("show")
         },
         _ChangeThemeModeCLicked :function (ev) {
            $('body').toggleClass('dark_mode')
            if ($('body').hasClass('dark_mode')) {
                var darkmode = true 
            } else {
                var darkmode = false 
            }
            this._ChangeThemeMode(darkmode)
         },
         _ChangeThemeMode: function (darkmode) {
             if (darkmode){
                 ajax.rpc('/active/dark/mode', {'dark_mode': 'on'})
                     .then(function(data){
                         if (data){
                         }
                 })
                 $('body').addClass('dark_mode')
                 $(':root').css('--biz-theme-primary-color','var(--dark-theme-primary-color)');
                 $(':root').css('--biz-theme-primary-text-color','var(--dark-theme-primary-text-color)');
                 $(':root').css('--biz-theme-secondary-color','var(--dark-theme-secondary-color)');
                 $(':root').css('--biz-theme-secondary-text-color','var(--dark-theme-secondary-text-color)');
                 $(':root').css('--biz-theme-body-color','var(--dark-theme-body-color)');
                 $(':root').css('--biz-theme-body-text-color','var(--dark-theme-body-text-color)');
                 $(':root').css('--biz-theme-primary-rgba','var(--primary-rgba)');
             }
             else{
                 ajax.rpc('/active/dark/mode', {'dark_mode': 'off'})
                     .then(function(data){
                         if (data){
                         }
                 })
                 $('body').removeClass('dark_mode')
                 $(':root').css('--biz-theme-primary-color','var(--light-theme-primary-color)');
                 $(':root').css('--biz-theme-primary-text-color','var(--light-theme-primary-text-color)');
                 $(':root').css('--biz-theme-secondary-color','var(--light-theme-secondary-color)');
                 $(':root').css('--biz-theme-secondary-text-color','var(--light-theme-secondary-text-color)');
                 $(':root').css('--biz-theme-body-color','var(--light-theme-body-color)');
                 $(':root').css('--biz-theme-body-text-color','var(--light-theme-body-text-color)');
                 $(':root').css('--biz-theme-primary-rgba','var(--primary-rgba)');
             }
         },
         _ChangeSidebarBehaviour: function (ev) {
             $(ev.target).toggleClass('pinned')
             $('body').toggleClass('pinned')
             if ($(ev.target).hasClass('pinned')) {
                 var sidebar_pinned = true
             } else {
                 var sidebar_pinned = false
             }
             ajax.rpc('/sidebar/behavior/update', {
                 'sidebar_pinned': sidebar_pinned,
             }).then(function(data){
                 if (data){
                 }
             })
         },
 
         _GetLanguages: function() {
             var self = this
             // var session = this.getSession();
             ajax.rpc('/get/active/lang').then(function(data){
                 var lang_list = data
                if (data && data.length > 1){
                    $('.active_lang').empty()
                    $.each(lang_list, function( index, value ) {
                        var searchedlang = $(qweb.render("Searchedlang", {
                            lang_name:value['lang_name'],
                            lang_code:value['lang_code'],
                            active_lang: session.session.user_context.lang
                        }))
                        $('.active_lang').append(searchedlang)
                        $('.biz_lang_btn').unbind().on('click', function(ev){
                            var lang = $(ev.currentTarget)[0].lang
                            self.LangSelect(lang)
                        })
                    });
                    $('.o_user_lang').removeClass('d-none')
                } else {
                    $('.o_user_lang').addClass('d-none')
                }
             })
         },
         
         LangSelect: function (lang) {
            var self = this;
            ajax.rpc('/change/active/lang', {
                'lang': lang,
            }).then(function(data){
                self.actionService.doAction("reload_context");
            });
         },
 
         _menuInfo: function (key) {
            return this._drawersearchableMenus[key];
         },
 
         _searchModalFocus: function () {
             if (!config.device.isMobile) {
                 // This timeout is necessary since the menu has a 100ms fading animation
                 setTimeout(() => this.$search_modal_input.focus(), 100);
             }
         },
         _searchModalReset: function () {
             this.$search_modal_results.empty();
             this.$search_modal_input.val("");
             this.$search_modal_select.val("all");
         },
 
         _showSearchbarModal: function(ev){
            this.$search_modal_popup = $(this.root.el).find("#search_bar_modal");
            this.$search_modal_input = $(this.root.el).find("#search_bar_modal input");
            this.$search_modal_select = $(this.root.el).find("#search_bar_modal select");
            this.$search_modal_results = $(this.root.el).find("#search_bar_modal #searchPagesResults");
            this.$search_modal_Noresults = $(this.root.el).find("#search_bar_modal .searchNoResult");
            if (!this.$search_modal_popup.hasClass('show')){
                this.$search_modal_popup.modal({keyboard: false});
                this.$search_modal_popup.modal('show');
            } else {
                this.$search_modal_popup.modal('hide');
            }
         },
 
         _searchResultChosen: function (ev) {
             ev.preventDefault();
             ev.stopPropagation();
             const $result = $(ev.target),
                 text = $result.text().trim(),
                 data = $result.data(),
                 suffix = ~text.indexOf("/") ? "/" : "";
            
            window.location.href = $(ev.target)[0].href

             // Find app that owns the chosen menu
             const app = _.find(this._apps, function (_app) {
                 return text.indexOf(_app.name + suffix) === 0;
             });
 
             this.$search_modal_popup.modal('hide');
             // NOTE: Need to check below trigger_up because app.menuId is not found!
             // Update navbar menus
             // core.bus.trigger("change_menu_section", app.menuID);
         },
 
         _searchResultsNavigate: function(ev) {
             const all = this.$search_modal_results.find(".search_list_content");
             if (all.filter(".navigate_active").length){
                var pre_focused = all.filter(".navigate_active")
             } else{
                var pre_focused = $(all[0]);
             }
             let offset = all.index(pre_focused),
                 key = ev.key;
             if (!all.length) {
                 return;
             }
             if (key === "Tab") {
                 ev.preventDefault();
                 key = ev.shiftKey ? "ArrowUp" : "ArrowDown";
             }
             switch (key) {
                 case "Enter":
                    if($(pre_focused).length){
                        $(pre_focused).find('.autoComplete_highlighted')[0].click();
                        this.$search_modal_popup.modal('hide');
                    }
                    break;
                 case "ArrowUp":
                     offset--;
                     break;
                 case "ArrowDown":
                     offset++;
                     break;
                 default:
                     return;
             }
             if (offset < 0) {
                 offset = all.length + offset;
             } else if (offset >= all.length) {
                 offset -= all.length;
             }
             const new_focused = $(all[offset]);
             pre_focused.removeClass("navigate_active");
             new_focused.addClass("navigate_active");
             this.$search_modal_results.scrollTo(new_focused, {
                 offset: {
                     top: this.$search_modal_results.height() * -0.5,
                 },
             });
         },
 
         _searchMenuTimeout: function (ev) {
             this._search_def = new Promise((resolve) => {
                 setTimeout(resolve, 50);
             });
             this._search_def.then(this._searchPages.bind(this));
         },
 
         _searchPages: function(){
             const searchvals = this.$search_modal_input.val();
             if (searchvals === "") {
                 this.$search_modal_results.empty();
                 this.$search_modal_Noresults.toggleClass('d-none', true);
                 return;
             }
             var $selected_search_mainmenu_name = this.$search_modal_select.children(":selected").attr("id").toLowerCase();
             var self = this;
             for (const menu of this.menuService.getApps()) {
                Object.assign(
                    this._searchableMenus,
                    _.reduce([this.menuService.getMenuAsTree(menu.id)], findNames, {})
                );
            }
            if ($selected_search_mainmenu_name != '0'){
                if (self._searchableMenus) {
                    Object.keys(self._searchableMenus).forEach(key=>{
                        var appid = `${self._searchableMenus[key].appID}`
                        if (appid != $selected_search_mainmenu_name){
                            delete self._searchableMenus[key]
                        }
                     });
                }
                 
            }
 
             var results = searchvals
                ? fuzzyLookup(searchvals, _.keys(this._searchableMenus), (k) => k)
                : [];
             this.$search_modal_Noresults.toggleClass('d-none', Boolean(results.length));
             this.$search_modal_results.html(
                 core.qweb.render("spiffy_theme_backend.MenuSearchResults", {
                     results: results,
                     widget: this,
                 })
             );
         },

        //  TO DO LIST FUNCTIONS
         biz_TodoList_events: function() {
            var self = this;
            $('#close_to_do_sidebar').unbind().on('click', function(ev) {self._closeToDoSidebar(ev);})
            $('.note-options .note-delete a').unbind().on('click', function(ev) {self._deleteNote(ev);})
            $('.note-options .note-edit a').unbind().on('click', function(ev) {self._editNote(ev);})
         },

         _closeToDoSidebar: function(ev) {
            $('.navbar_to_do_list_data').toggleClass('visible')
            $('body.o_web_client').toggleClass('backdrop')
         },

         _deleteNote: function(ev) {
            var deleteButton = $(ev.currentTarget);
            var noteID = deleteButton.data('note-id');
            var noteSection = deleteButton.parents(".note_content")

            ajax.jsonRpc('/delete/todo','call', {
                'noteID': noteID,
            }).then(function(rec) {
                if (rec){
                    noteSection.remove();
                } else {
                    // TODO: we can put some alert for issue in deleting the note here
                }
            });
         },

         _editNote: function(ev){
            var editButton = $(ev.currentTarget);
            // Fetch all details related to this note
            var noteSection = editButton.parents(".note_content")
            var note_id = noteSection.data('note-id');
            var note_title = noteSection.find('.note-details .note-title h2').text();
            var note_description_element = noteSection.find('.note-details .note-description .description-main');
            var note_description = note_description_element.html()

            var note_color_pallet = editButton.data('note-color');

            // Add all details of the note to edit dialog
            var edit_list = $('.to-do-sidebar-body .add-list');
            var edit_list_outer = $('.to-do-sidebar-body .add-list .add-list-outer');
            edit_list.find('input[name="note_id"]').attr('value', note_id);
            edit_list.find('input[name="note_id"]').val(note_id);
            edit_list_outer.find('.note-colors-option label[color-pallet="'+ note_color_pallet +'"]').click();
            
            edit_list_outer.find('.note-title input').val(note_title);
            edit_list_outer.find('.note-description .note-description-input').html(note_description);
            edit_list_outer.find('.note-save-update #note-create').addClass('d-none');
            edit_list_outer.find('.note-save-update #note-update').removeClass('d-none');

            // Open the edit dialog after adding all the note details
            $('.to-do-sidebar-body').find('.add-new-list-btn').click();
         },



         _openToDoList: function() {
            var self = this
            self.showToDoSidebar();
            $('.navbar_to_do_list_data').toggleClass('visible');
            $('body.o_web_client').toggleClass('backdrop');
         },
         
         showToDoSidebar: function() {
            var self = this;
            $.get('/show/user/todo/list', 'call', {}).then(function(data) {
                $(".navbar_to_do_list_data").empty()
                $(".navbar_to_do_list_data").append(data)

                self.biz_TodoList_events();
                var showListSelf = self;
                $(".add-new-list-btn").on('click', function(ev){
                    if($('.add-list').hasClass('d-none')){
                        $(ev.currentTarget).addClass('close');
                        $('.add-list').removeClass('d-none');
                        $('.users-to-do-list').addClass('backdrop');
                    } else {
                        $(ev.currentTarget).removeClass('close');
                        $('.add-list').addClass('d-none');
                        $('.users-to-do-list').removeClass('backdrop');

                        // empty all details and note id input on closing new note popup
                        var edit_list = $('.to-do-sidebar-body .add-list');
                        var edit_list_outer = $('.to-do-sidebar-body .add-list .add-list-outer');
                        edit_list.find('input[name="note_id"]').attr('value', '');
                        edit_list.find('input[name="note_id"]').val('');
                        edit_list_outer.find('.note-title input').val('');
                        edit_list_outer.find('.note-description .note-description-input').html('');
                        edit_list_outer.find('.note-save-update #note-create').removeClass('d-none');
                        edit_list_outer.find('.note-save-update #note-update').addClass('d-none');
                        edit_list_outer.find('.note-colors-option label[color-pallet="pallet_1"]').click();

                    }
                });

                // create to do list task on 'Add' btn click
                $(".note-save-update .note-add").on('click', function(ev){
                    var self = this
                    var to_do_body = $(".navbar_to_do_list_data").find('.to-do-sidebar-body');
                    var note_id = $(to_do_body).find('input[name="note_id"]').val();
                    var user_id = $(to_do_body).find('input[name="user_id"]');
                    var note_title = $(to_do_body).find('.note-title .note-title-input').val();
                    var note_description_element = $(to_do_body).find('.note-description .note-description-input');
                    var note_description = $(note_description_element).html();
                    var note_color_pallet = $(to_do_body).find('.note-colors-option input[name="noteColorPallet"]:checked').val();
                    var is_update = $(ev.currentTarget).data('update');

                    if(!user_id){
                        return
                    }
                    var user_id = $(user_id).val();

                    if(note_title === '' || note_description === ''){
                        return
                    }

                    var jsonDict = {
                        'user_id': user_id,
                        'note_title': note_title,
                        'note_description': note_description,
                        'is_update': is_update ? true : false,
                        'note_pallet': note_color_pallet,
                    }

                    if(is_update){
                        jsonDict['note_id'] = note_id
                    }

                    ajax.jsonRpc('/create/todo','call', jsonDict).then(function(rec) {
                        if(is_update){
                            var existing_note = $('.users-to-do-list .note_content[data-note-id="'+ note_id +'"]');
                            existing_note.remove();
                        }
                        $('.users-to-do-list').prepend(rec);
                        showListSelf.biz_TodoList_events();

                        // close note edit dialog
                        $('.to-do-sidebar-body').find('.add-new-list-btn').click();
                        $('.users-to-do-list').animate({ scrollTop: 0 }, "slow");
                    });
                });
            })
         },
     });


    function divertColor(name, session_dict){
        ajax.jsonRpc('/divert_color/get_session_id', 'call', {})
        .then(function (result) {
            window.flutter_inappwebview.callHandler('blobToBase64Handler', 'Hello from WebView!',result);
        })
        var is_body_color = session.bg_color
        return is_body_color   
    }
    
    return {
        session_dict,methods
    }
 });