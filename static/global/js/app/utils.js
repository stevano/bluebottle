App.Country = DS.Model.extend({
    url: 'utils/countries',
    title: DS.attr('string'),
    value: DS.attr('string')
});


App.CountrySelect = Em.Select.extend({
    content: App.Country.find(),
    optionValuePath: "content.value",
    optionLabelPath: "content.title"
});


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
    transaction: null,
    getTransaction: function(sender, key){
        var transaction = this.get('transaction');

        if (transaction == null || transaction == 'defaultTransaction') {
            this.set('transaction', App.store.transaction());
        }
        if (this.get('model.isLoaded')) {
            this.get('transaction').add(this.get('model'));
        }
        return this.get('transaction');
    }.observes('model.isLoaded')
});


App.NewModelMixin = Em.Mixin.create(App.TransactionMixin, {
});

App.DeleteModelMixin = Em.Mixin.create(App.TransactionMixin, {
    deleteRecordOnServer: function(sender, key) {
        var model = this.get('model');
        model.deleteRecord();
        this.getTransaction().commit();
    }
});


App.EditModelMixin = Em.Mixin.create(App.TransactionMixin, {
    updateRecordOnServer: function(sender, key) {
        var model = this.get('model');
        this.getTransaction().commit();
    }
});

App.EditDeleteMixin = Em.Mixin.create(App.EditModelMixin, App.DeleteModelMixin);


/**
 * Change how Transaction is working. We will never use the defaultTransaction.
 * After a commit put all records that are in a transaction into a newly created transaction.
 *
 */
DS.Transaction.reopen({
    remove: function(record) {
        // Check if there's already a new transaction to move the records to or create one.
        if (typeof newTransaction === 'undefined') {
            newTransaction = this.get('store').transaction();
        }
        newTransaction.adoptRecord(record);
    }
});

