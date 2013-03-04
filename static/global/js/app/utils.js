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
    startTransaction: function(sender, key){
        var transaction = App.store.transaction();
        if (!this.get('model.isLoaded')) {
            transaction.add(this.get('model'));
        }
        return transaction;
    }.observes('model.isLoaded')
});


App.DeleteModelMixin = Em.Mixin.create(App.TransactionMixin, {
    deleteRecordOnServer: function(sender, key) {
        // If it has a belongsTo we should remove it from its parent's hasMany.
        var model = this.get('model');
        model.deleteRecord();
        this.get('transaction').commit();
        model.on('IsDeleted', function(){
            this.startTransaction();
        });
    }
});


App.UpdateModelMixin = Em.Mixin.create(App.TransactionMixin, {
    updateRecordOnServer: function(sender, key) {
        var model = this.get('model');
        this.get('transaction').commit();
        model.on('IsUpdated', function(){
            this.startTransaction();
        });
    }
});

App.UpdateDeleteMixin = Em.Mixin.create(App.UpdateModelMixin, App.DeleteModelMixin);
