App.Country = DS.Model.extend({
    url: 'utils/countries',
    title: DS.attr('string'),
    value: DS.attr('string')
});

// FIXME: Ember data doesn't work this this:
//App.CountrySelect = Em.Select.extend({
//    content: App.Country.find(),
//    optionValuePath: "content.value",
//    optionLabelPath: "content.title"
//});


App.IsAuthorMixin = Em.Mixin.create({
    isAuthor: function() {
        var username = this.get('controllers.currentUser.username');
        var authorname = this.get('author.username');
        if (username) {
            return (username == authorname);
        }
        return false;
    }.property('author.username', 'controllers.currentUser.username')
});


App.TransactionMixin = Em.Mixin.create({

    addRecordToTransaction: function(sender, key){
        var model = this.get('model');
        // Check if the model is in the default transaction.
        // If so move it to the 'controller transaction'.
        if (model.transaction == 'defaultTransaction') {
            this.getTransaction().add(model);
        }
    }.observes('model.isLoaded'),

    // This can be overridden if you want to use a different (controllers) transaction, e.g. currentOrder.
    getTransaction: function(){
        if (this.get('transaction') == undefined || this.get('transaction') == 'defaultTransaction') {
            this.set('transaction', this.get('store').transaction());
        }
        return this.get('transaction');
    }
});


/**
 * Mixins for ObjectControllers.
 */
App.DeleteModelMixin = Em.Mixin.create(App.TransactionMixin, {
    deleteRecordOnServer: function(sender, key) {
        var model = this.get('model');
        model.deleteRecord();
        this.getTransaction().commit();
    }
});


App.EditModelMixin = Em.Mixin.create(App.TransactionMixin, {
    updateRecordOnServer: function(sender, key) {
        this.getTransaction().commit();
    }
});

App.EditDeleteMixin = Em.Mixin.create(App.EditModelMixin, App.DeleteModelMixin);


/**
 * Change how Transaction is working. We will never use the defaultTransaction.
 * After a commit put all records that are in a transaction into a newly created transaction.
 */
DS.Transaction.reopen({
    remove: function(record) {
        // Check if there's already a new transaction to move the records to or create one.
        if (typeof newTransaction == 'undefined') {
            newTransaction = this.get('store').transaction();
        }
        newTransaction.adoptRecord(record);
    }
});

