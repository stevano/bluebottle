/*
 Models
 */

App.Order = DS.Model.extend({
    url: 'fund/orders',

    status: DS.attr('string'),
    recurring: DS.attr('boolean'),
    vouchers: DS.hasMany('App.Voucher'),
    donations: DS.hasMany('App.Donation')
});


App.Donation = DS.Model.extend({
    url: 'fund/donations',

    project: DS.belongsTo('App.Project'),
    amount: DS.attr('number', {defaultValue: 20}),
    status: DS.attr('string'),
    type: DS.attr('string'),
    order: DS.belongsTo('App.Order')
});

App.DonationPreview =  DS.Model.extend({
    url: 'projects/donations',
    project: DS.belongsTo('App.ProjectPreview'),
    member: DS.belongsTo('App.UserPreview'),

    date_donated: DS.attr('date'),
    time_since: function(){
        return Globalize.format(this.get('date_donated'), 'X');
    }.property('date_donated')
});

App.Voucher =  DS.Model.extend({
    url: 'fund/vouchers',

    receiver_name: DS.attr('string', {defaultValue: ''}),
    receiver_email: DS.attr('string'),
    sender_name: DS.attr('string', {defaultValue: ''}),
    sender_email: DS.attr('string'),
    message: DS.attr('string', {defaultValue: ''}),
    language: DS.attr('string', {defaultValue: 'en'}),
    amount: DS.attr('number', {defaultValue: 25}),
    status: DS.attr('string'),

    order: DS.belongsTo('App.Order'),
    donations: DS.hasMany('App.VoucherDonation')

});


/* Models with CurrentOrder relations and urls. */

App.CurrentOrder = App.Order.extend({
    url: 'fund/orders',

    vouchers: DS.hasMany('App.CurrentOrderVoucher'),
    donations: DS.hasMany('App.CurrentOrderDonation')
});


App.CurrentOrderDonation = App.Donation.extend({
    url: 'fund/orders/current/donations',

    order: DS.belongsTo('App.CurrentOrder')
});


App.CurrentOrderVoucher = App.Voucher.extend({
    url: 'fund/orders/current/vouchers',

    order: DS.belongsTo('App.CurrentOrder')
});


/* Models related to payments. */

App.PaymentProfile = DS.Model.extend({
    url: 'fund/paymentprofiles',

    firstName: DS.attr('string'),
    lastName: DS.attr('string'),
    email: DS.attr('string'),
    address: DS.attr('string'),
    postalCode: DS.attr('string'),
    city: DS.attr('string'),
    country: DS.attr('string')
});


App.Payment = DS.Model.extend({
    url: 'fund/payments',

    paymentMethod: DS.attr('string'),
    paymentSubmethod: DS.attr('string'),
    paymentUrl: DS.attr('string'),
    availablePaymentMethods: DS.attr('array')
});


App.DocDataDirectDebit = DS.Model.extend({
    url: 'fund/docdatadirectdebit',

    bank_account_number: DS.attr('string'),
    bank_account_name: DS.attr('string'),
    bank_account_city: DS.attr('string')
});


/*
 Controllers
 */

App.CurrentOrderDonationListController = Em.ArrayController.extend({
    // The CurrentOrderController is needed for the single / monthly radio buttons.
    needs: ['currentOrder'],

    total: function() {
        return this.get('model').getEach('amount').reduce(function(accum, item) {
            // Use parseInt like this so we don't have a temporary string concatenation briefly displaying in the UI.
            return parseInt(accum) + parseInt(item);
        }, 0);
    }.property('model.@each.amount', 'model.length')
});


App.CurrentOrderDonationController = Em.ObjectController.extend({
    updateDonation: function(newAmount) {
        var donation = this.get('model');
        donation.set('errors', []);
        donation.on("becameInvalid", function(record){
            donation.set('errors', record.get('errors'));
        });
        // Renew the transaction as needed.
        // If we have an error the record will stay 'dirty' and we can't put it into a new transaction.
        if (donation.transaction.isDefault) {
            var transaction = this.get('store').transaction();
            transaction.add(donation);
        }
        donation.set('amount', newAmount);
        donation.transaction.commit();
    },

    deleteDonation: function() {
        var transaction = this.get('store').transaction();
        var donation = this.get('model');
        transaction.add(donation);
        // Hack: Remove the donation from the current order so that ember-data doesn't get confused. This needs to be
        // done because we're not setting the proper order id (i.e. 'current') in the donation json from the server.
        var order = App.CurrentOrder.find('current');
        order.get('donations').removeObject(donation);
        donation.deleteRecord();
        transaction.commit();
    },

    neededAfterDonation: function() {
        return this.get('project.money_needed') - this.get('amount');
    }.property('amount', 'project.money_needed')
});


App.CurrentOrderVoucherListController = Em.ArrayController.extend({
    total: function() {
        return this.get('model').getEach('amount').reduce(function(accum, item) {
            // Use parseInt like this so we don't have a temporary string concatenation briefly displaying in the UI.
            return parseInt(accum) + parseInt(item);
        }, 0);
    }.property('model.@each.amount', 'model.length')
});


App.CurrentOrderVoucherController = Em.ObjectController.extend({
    deleteVoucher: function() {
        var transaction = this.get('store').transaction();
        var voucher = this.get('model');
        transaction.add(voucher);
        // Hack: Remove the voucher from the current order so that ember-data doesn't get confused. This needs to be
        // done because we're not setting the proper order id (i.e. 'current') in the voucher json from the server.
        var order = App.CurrentOrder.find('current');
        order.get('vouchers').removeObject(voucher);
        voucher.deleteRecord();
        transaction.commit();
    }
});


App.CurrentOrderVoucherNewController = Em.ObjectController.extend({
    needs: ['currentUser', 'currentOrder'],

    init: function() {
        this._super();
        this.createNewVoucher();
    },

    createNewVoucher: function() {
        var transaction = this.get('store').transaction();
        var voucher =  transaction.createRecord(App.CurrentOrderVoucher);
        voucher.set('sender_name', this.get('controllers.currentUser.full_name'));
        voucher.set('sender_email', this.get('controllers.currentUser.email'));
        voucher.set('receiver_name', '');
        voucher.set('receiver_email', '');
        this.set('model', voucher);
        this.set('transaction', transaction);
    },

    updateSender: function(){
        // Make sure the sender info is fully loaded on refresh
        voucher = this.get('model');
        voucher.set('sender_name', this.get('controllers.currentUser.full_name'));
        voucher.set('sender_email', this.get('controllers.currentUser.email'));
    }.observes('controllers.currentUser.email', 'controllers.currentUser.full_name'),

    addVoucher: function() {
        var voucher = this.get('model');
        // Set the order so the list gets updated in the view
        var order = this.get('controllers.currentOrder.model');
        voucher.set('order', order);

        var controller = this;
        voucher.on('didCreate', function(record) {
            controller.createNewVoucher();
            controller.set('sender_name', record.get('sender_name'));
            controller.set('sender_email', record.get('sender_email'));
        });
        voucher.on('becameInvalid', function(record) {
            controller.createNewVoucher();
            controller.get('model').set('errors', record.get('errors'));
            record.deleteRecord();
        });

        this.get('transaction').commit();
    }
});


App.PaymentProfileController = Em.ObjectController.extend({
    initTransaction: function() {
        var transaction = this.get('store').transaction();
        this.set('transaction', transaction);
        transaction.add(this.get('model'));
    }.observes('model'),

    updateProfile: function() {
        var profile = this.get('model');
        // Set profile model to the 'updated' state so that the 'didUpdate' callback will always be run.
        profile.get('stateManager').goToState('updated');
        var controller = this;
        profile.one('didUpdate', function(record) {
            controller.transitionToRoute('payment');
        });
        profile.one('becameInvalid', function(record) {
            controller.get('model').set('errors', record.get('errors'));
            // Note: We're reusing the transaction in this case but it seems to work.
        });
        this.get('transaction').commit();
    }
});

App.PaymentController = Em.ObjectController.extend({
    hasIdeal: function() {
        var availPMs = this.get('availablePaymentMethods');
        if (availPMs) {
            return (availPMs.contains('dd-ideal'));
        }
        return false;
    }.observes('availablePaymentMethods'),

    hasWebMenu: function() {
        var availPMs = this.get('availablePaymentMethods');
        if (availPMs) {
            return (availPMs.contains('dd-direct-debit'));
        }
        return false;
    }.observes('availablePaymentMethods'),

    initTransaction: function() {
        var transaction = this.get('store').transaction();
        this.set('transaction', transaction);
        transaction.add(this.get('model'));
    }.observes('model'),

    proceedWithPayment: function() {
        this.set('paymentInProgress', true);
//        var payment = this.get('model');
//        payment.set('paymentMethod', payment.get('availablePaymentMethods').objectAt(0));
//        var controller = this;
//        payment.one('didUpdate', function(record) {
//            var paymentUrl = record.get('paymentUrl');
//            if (paymentUrl) {
//                document.location = paymentUrl;
//        });
//        this.get('transaction').commit();

        // Use jQuery directly to avoid the problems with updating server-side data.
        var payment = this.get('model');
        var controller = this;
        jQuery.ajax({
            url: '/i18n/api/fund/payments/current',
            type: 'PUT',
            data: JSON.stringify({ payment_method:  payment.get('availablePaymentMethods').objectAt(0)}),
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            context: this,
            success: function(json) {
                if (json['payment_url']) {
                    document.location = json['payment_url'];
                } else {
                    controller.set('paymentError', true);
                    controller.set('paymentInProgress', false);
                }
            },
            error: function(xhr) {
                controller.set('paymentError', true);
                controller.set('paymentInProgress', false);
            }
        });
    }
});


App.CurrentOrderController = Em.ObjectController.extend({
    donationType: 'single',  // The default donation type.

    updateOrder: function() {
        var order = this.get('model');
        var transaction = this.get('store').transaction();
        transaction.add(order);
        order.set('recurring', (this.get('donationType') == 'monthly'));
        transaction.commit();
    }.observes('donationType')
});


/*
 Views
 */

App.CurrentOrderView = Em.View.extend({
    templateName: 'current_order'
});


App.PaymentProfileView = Em.View.extend({
    templateName: 'payment_profile',
    tagName: 'form',

    submit: function(e) {
        e.preventDefault();
        this.get('controller').updateProfile();
    }
});


App.CurrentOrderDonationListView = Em.View.extend({
    templateName: 'current_order_donation_list',
    tagName: 'form',

    submit: function(e) {
        e.preventDefault();
    }
});


App.CurrentOrderVoucherListView = Em.View.extend({
    templateName: 'current_order_voucher_list',
    classNames: ['content']
});


App.OrderThanksView = Em.View.extend({
    templateName: 'order_thanks'
});



App.CurrentOrderDonationView = Em.View.extend({
    templateName: 'current_order_donation',
    tagName: 'li',
    classNames: 'donation-project control-group',

    change: function(e) {
        this.get('controller').updateDonation(Em.get(e, 'target.value'));
    },

    delete: function(item) {
        var controller = this.get('controller');
        this.$().slideUp(500, function() {
            controller.deleteDonation();
        });
    }
});


App.CurrentOrderVoucherView = Em.View.extend({
    templateName: 'current_order_voucher',
    tagName: 'li',
    classNames: ['voucher-item'],

    delete: function() {
        var controller = this.get('controller');
        this.$().slideUp(500, function() {
            controller.deleteVoucher()
        });
    }
});


App.CurrentOrderVoucherNewView = Em.View.extend({
    templateName: 'current_order_voucher_new',
    tagName: 'form',
    classNames: ['labeled'],

    submit: function(e) {
        e.preventDefault();
    }
});


App.OrderNavView = Ember.View.extend({
    tagName: 'li',

    didInsertElement: function () {
        this._super();
        if (this.get('childViews.firstObject.active')) {
            this.setOrderProgress();
        }
    },

    childBecameActive: function(sender, key) {
        if (this.get(key) && this.state == "inDOM") {
            this.setOrderProgress()
        }
    }.observes('childViews.firstObject.active'),

    setOrderProgress: function() {
        var highlightClassName = 'is-selected';
        this.$().prevAll().addClass(highlightClassName);
        this.$().nextAll().removeClass(highlightClassName);
        this.$().addClass(highlightClassName);
    }
});


App.PaymentView = Em.View.extend({
    templateName: 'payment',
    classNames: ['content']
});


App.IdealPaymentMethodInfoView = Em.View.extend({
    templateName: 'ideal_payment_method_info',
    tagName: 'form',

    submit: function(e) {
        e.preventDefault();
    }
});


App.DirectDebitPaymentMethodInfoView = Em.View.extend({
    templateName: 'direct_debit_payment_method_info',
    tagName: 'form',

    submit: function(e){
        e.preventDefault();
    }
});

