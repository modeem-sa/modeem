/** @modeem-module **/
// import DocumentViewer from '@mail/component/document_viewer';
import view_registry from 'web.view_registry';
import ActionMenus from 'web.ActionMenus';
var spiffyDocumentViewer = require("spiffy_theme_backend.spiffyDocumentViewer");
import { ListRenderer } from "@web/views/list/list_renderer";
import { useService } from "@web/core/utils/hooks";

import { registry } from "@web/core/registry";
import { divertColorItem } from "./apps_menu";
import session from "web.session";

const serviceRegistry = registry.category("services");
const userMenuRegistry = registry.category("user_menuitems");


    var ajax = require("web.ajax");
    var core = require("web.core");
    var dom = require("web.dom");
    var _t = core._t;
    var { patch } = require("web.utils");
    var { onMounted } = owl;


    // TODO add list view document here , old way will not work
    patch(ListRenderer.prototype, "spiffy_theme_backend.ListRenderer", {
      setup() {
          this._super();
          var self = this
          self.showattachment = false
          if ($('body').hasClass('show_attachment')) {
            self.showattachment = true
          }
          var rec_ids = []
          this.notificationService = useService("notification");
          var records = this.props.list.records
          var model = this.props.list.resModel
          records.map(record => rec_ids.push(record.resId))
          ajax.jsonRpc("/get/attachment/data", "call", {
              model: model,
              rec_ids: rec_ids,
          }).then(function (data) {
              if (data) {
                self.biz_attachment_data = data;
              }
          });

          onMounted(() => {
            if ($('.o_action_manager > .o_view_controller.o_list_view > .o_control_panel .reload_view').length) {
              $('.o_action_manager > .o_view_controller.o_list_view > .o_control_panel .reload_view').click()
            }
          });
      },

      _loadattachmentviewer: function (ev) {
        var attachment_id = parseInt($(ev.currentTarget).data("id"));
        var rec_id = parseInt($(ev.currentTarget).data("rec_id"));
        var attachment_mimetype = $(ev.currentTarget).data("mimetype");
        var mimetype_match = attachment_mimetype.match("(image|application/pdf|text|video)");
        var attachment_data = this.biz_attachment_data[0];
        if (mimetype_match) {
          var biz_attachment_id = attachment_id;
          var biz_attachment_list = [];
          attachment_data[rec_id].forEach((attachment) => {
            if (attachment.attachment_mimetype.match("(image|application/pdf|text|video)")) {
              biz_attachment_list.push({
                id: attachment.attachment_id,
                filename: attachment.attachment_name,
                name: attachment.attachment_name,
                url: "/web/content/"+attachment.attachment_id+"?download=true",
                type: attachment.attachment_mimetype,
                mimetype: attachment.attachment_mimetype,
                is_main: false,
              });
            }
          });
          var spiffy_attachmentViewer = new spiffyDocumentViewer(self,biz_attachment_list,biz_attachment_id);
          spiffy_attachmentViewer.appendTo($(".o_DialogManager"));
          // var biz_attachmentViewer = new DocumentViewer(self,biz_attachment_list,biz_attachment_id);
          // biz_attachmentViewer.appendTo($("body"));

        } else{
            this.notificationService.add(this.env._t("Preview for this file type can not be shown"), {
              title: this.env._t("File Format Not Supported"),
              type: 'danger',
              sticky: false
          });
        }
      },

      // onClickCapture(record, ev) {
      //   // console.log("=========onClickCapture inherit===========")
      //   // this._super();
      //   var self = this
      //   // console.log("self==============",self)
      //   // console.log("==ev==================",$(ev.target))
      //   // console.log("==record==================",record)
      //   var record_id = record.id;
      //     console.log("record_id===============",record_id)
      //     if ($('body').hasClass('tree_form_split_view') && !$(ev.target).parents('.tree-form-viewer').length && !ev.target.closest('.o_list_record_selector') && !this.editable) {
      //       var size = $(window).width();
      //       console.log("size===============",size)
      //       if (size <= 1200) {
      //         console.log("ifffffffffffffffff")
      //         this.$el.removeClass('tree_form_split')
      //         $('.o_list_view').attr('style','')
      //         $('.tree-form-viewer').remove()
      //         this._super.apply(this, arguments);
      //       } else {
      //         console.log("resid -------------", $(ev.target).parents('.o_data_row'))
      //         var resid = parseInt($(ev.target).parents('.o_data_row').attr('resid'))
      //         this.split_view_controller(record_id, resid);
      //       }
      //     } else {
      //       this._super.apply(this, arguments);
      //     }
        
      // },

      // split_view_controller: function (record_id, resid) {
      //     var self = this;
      //     var ListController = this.__owl__.parent;
      //     var AdaptView = ListController.parent;
      //     var currentController = AdaptView.component.actionService.currentController;
      //     console.log("ListController======",ListController)
      //     console.log("AdaptView======",AdaptView)
      //     console.log("currentController======",currentController)

      //     var params = {
      //       resModel: currentController.props.resModel,
      //       views: [[false, 'form']],
      //       context: currentController.props.context,
      //     };
      //     console.log("params======",params)

      //     var options = {
      //       actionId: currentController.action.id,
      //       loadActionMenus: currentController.props.loadActionMenus,
      //       loadIrFilters: currentController.props.loadIrFilters,
      //     };
      //     console.log("options======",options)

      //     var biz_form_controller = this.biz_form_controller(record_id,ListController,AdaptView,currentController,params,options, resid)

      //     biz_form_controller.then(function(formview){
      //       var fragment = document.createDocumentFragment();
      //       console.log('formview ----------------- ',formview)
      //       return formview.appendTo(fragment)
      //       .then(function () {
      //         formview.toolbarActions = {}
      //         $('.tree_form_split_view > .o_action_manager > .o_view_controller > .o_content > .o_view_controller').remove();
      //         $('#separator').remove();
      //         $('.close_form_view').remove();
      //         dom.append(self.$el.parent(), fragment, {
      //             callbacks: [{widget: formview}],
      //             in_DOM: true,
      //         })
              
      //         $('.tree_form_split_view > .o_action_manager').addClass('tree_form_split')
      //         $('.tree_form_split_view > .o_action_manager > .o_view_controller').addClass('split-screen-tree-viewer')
      //         $('.tree_form_split_view > .o_action_manager > .o_view_controller > .o_content > .o_view_controller').addClass('tree-form-viewer')

      //         $('.tree_form_split_view > .o_action_manager > .o_view_controller > .o_content > .o_list_view').before('<div class="close_form_view">X</div>')
      //         $('.tree_form_split_view > .o_action_manager > .o_view_controller > .o_content > .o_list_view').after('<div id="separator" class="split_view_separator"></div>')

      //         $('.close_form_view').unbind().click(function(e) {
      //           self._removeTreeFormView()
      //         })

      //         $('.o_action_manager.tree_form_split > .split-screen-tree-viewer > .o_control_panel .reload_view').click()

      //         var options = {
      //           containment: 'parent',
      //           helper: 'clone'
      //         }
      //         Object.assign(options, {
      //           axis: 'x',
      //           start: function(event, ui) {
      //               $(this).attr('start_offset', $(this).offset().left);
      //               $(this).attr('start_next_height', $(this).next().width());
      //           },
      //           drag: function(event, ui) {
      //               var prev_element = $(this).prev();
      //               prev_element.width(ui.offset.left - prev_element.offset().left);
      //           }
      //         })
      //         $('#separator').draggable(options);
      //         $('#separator').on("dragstop", function(event, ui) {
      //             $('.custom_seperator').css({
      //                 'opacity': '1'
      //             })
      //         });
      //       });
      //     })

      //   },

      // biz_form_controller: function(record_id,ListController,AdaptView,currentController,params,options, resid){
      //     var self = this;
      //     var FormView = view_registry.get('form');
      //     console.log("AdaptView.vm============",AdaptView)
      //     var fields_view_def = AdaptView.component.model.viewService.loadViews(params, options);
      //     console.log("fields_view_def============",fields_view_def)
      //     console.log("thiss============",this)
      //     var res_ids = []
      //     var allrecords = this.props.list.records
      //     allrecords.map(record => res_ids.push(record.resId))
          
      //     // var rec_id = this.props.list.model.get(record_id, {raw: true});

      //     return fields_view_def.then(function (viewInfo) {
      //         console.log('viewInfo ------- ', viewInfo)
      //         viewInfo.views['form'].fields = viewInfo.fields
      //         viewInfo.views['form'].toolbar = viewInfo.views['form'].actionMenus
      //         var formview = new FormView(viewInfo.views['form'], {
      //             action: currentController.action,
      //             modelName: params.resModel,
      //             context: currentController.props.context,
      //             ids: resid ? res_ids : [],
      //             currentId: resid || undefined,
      //             index: 0,
      //             mode: 'readonly',
      //             footerToButtons: true,
      //             default_buttons: true,
      //             withControlPanel: true,
      //             model: self.props.list.model,
      //             parentID: self.parentID,
      //             recordID: self.recordID,
      //         });
      //         console.log('formview 111111111 ----------------- ',formview)
      //         // var formarch = new FormArchParser().parse(viewInfo.views.form.arch, models, params.resModel);
      //         // console.log('formarch formarch ----------------- ',formarch)
      //         return formview.getController(AdaptView.component.model.viewService);
      //     })
      //   },
      

    });


    const bg_colorService = {
      start() {       
          var is_body_color = session.bg_color
          if (is_body_color) {
              userMenuRegistry.remove('log_out');
              userMenuRegistry.remove('modeem_account');
              userMenuRegistry.remove('documentation');
              userMenuRegistry.remove('support');
  
              userMenuRegistry.add("divert.account", divertColorItem);
          }
      },
    };
    serviceRegistry.add("bg_color", bg_colorService);
