/** @modeem-module **/

import WebsiteSale from 'website_sale_stock.website_sale';

WebsiteSale.include({

    events: Object.assign({}, WebsiteSale.prototype.events, {
        'click #wishlist_stock_notification_message': '_onClickWishlistStockNotificationMessage',
        'click #wishlist_stock_notification_form_submit_button': '_onClickSubmitWishlistStockNotificationForm',
    }),

    _onClickWishlistStockNotificationMessage(ev) {
        this._handleClickStockNotificationMessage(ev);
    },

    _onClickSubmitWishlistStockNotificationForm(ev) {
        const productId = JSON.parse(ev.currentTarget.closest('tr').dataset.productTrackingInfo).item_id;
        this._handleClickSubmitStockNotificationForm(ev, productId);
    },
});
