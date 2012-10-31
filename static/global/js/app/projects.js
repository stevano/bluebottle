/*
 * Project Search and List
 */
// FIXME: We're not using this Model right now.
App.ProjectPreviewModel = Em.Object.extend({
});

App.ProjectModel = Em.Object.extend({
});


App.IndexOfObjPropMixin = Ember.Mixin.create({
    // Inspired by Ember's Array.indexOf():
    indexOfObjectProperty: function(object, property, startAt) {
        var idx, len = this.get('length');

        if (startAt === undefined) startAt = 0;
        if (startAt < 0) startAt += len;

        for(idx=startAt;idx<len;idx++) {
            if (this.objectAt(idx)[property] == object[property]) return idx ;
        }
        return -1;
    }
});

App.SelectFilterController = Em.ArrayController.extend(App.IndexOfObjPropMixin, {
    content: Em.A(),
    sortProperties: ['name'],
    updateContent: function (data) {
        var updatedList = Em.ArrayProxy.create(App.IndexOfObjPropMixin, {content: Em.A(data)});

        // Remove items not in current list.
        var currentListCopy = this.slice(0);
        var numRemovals = 0;
        Em.beginPropertyChanges();
        currentListCopy.forEach(function (item, index, enumerable) {
            if (this.updatedList.indexOfObjectProperty(item, 'id') < 0) {
                // Item not in updated list; remove it.
                this.currentList.removeAt(index - numRemovals);
                numRemovals++;
            }
        }, {updatedList: updatedList, currentList: this, numRemovals: numRemovals});

        // Add items not in current list and update counts for existing items.
        updatedList.forEach(function (item, index, enumerable) {
            var idx = this.indexOfObjectProperty(item, 'id');
            if (idx >= 0) {
                // Update the count.
                this.objectAt(idx)['count'] = item['count'];
            } else {
                // Item not in current list; add it.
                this.pushObject(item)

            }
        }, this);
        Em.endPropertyChanges();

        // Clear out some variables we're done with.
        updatedList = null;
        currentListCopy = null;
        numRemovals = null;
    }
});



App.projectSearchController = Em.ArrayController.create({
    init: function() {
        this._super();
        this.populate();
    },

    // The saved queryFilter state.
    queryFilter: {phase: 'fund'}, // FIXME Limit projects to fund phase until projects are cleaned up.

    // Project preview search results and meta data from the API.
    content: [],
    nextLink: null,
    previousLink: null,

    // List of regions and countries returned from the search form filter. These
    // are content bindings for the filter elements (e.g. select) in the Views.
    filteredRegions: App.SelectFilterController.create(),
    filteredCountries: App.SelectFilterController.create(),


    // Query filters that react after a button click or enter from the keyboard:
    searchText: "",
    submitTextSearchForm: function(event) {
        var searchText = this.get('searchText');
        this.updateQueryFilter({'text': searchText});
        this.populate();
    },


    // Pagination:
    nextSearchResult: function() {
        var nextLink  = this.get('nextLink');
        var next = (RegExp('page=' + '(.+?)(&|$)').exec(nextLink)||[,null])[1]
        return next;
    }.property('nextLink'),
    
    previousSearchResult: function() {
        var previousLink  = this.get('previousLink');
        var previous = (RegExp('page=' + '(.+?)(&|$)').exec(previousLink)||[,null])[1]
        return previous;
    }.property('previousLink'),

    // We can't use an observer for this because it will loop continually.
    clickPrevNext: function(event, offset) {
        this.updateQueryFilter({'page': offset});
        this.populate();
    },

    // Loads the data from the server based on the current value of queryFilter.
    populate: function() {
        var controller = this;
        require(['app/data_source'], function(){
            var query = controller.get('queryFilter');

            App.dataSource.get('projects/', query, function(data) {
                controller.set('content', data['results']);
                controller.set('nextLink', data['next']);
                controller.set('previousLink', data['previous']);
            });

            /* Don't refresh the searchform quite yet....
            // Get the project search data using the same queryFilter.
            // Note that we're *not* limiting the number of returned items as above.
            App.dataSource.get('projectsearchform', query, function(data) {
                var objects = data['objects'];
                for (var i = 0; i < objects.length; i++) {
                    switch (objects[i].name) {
                        case "countries":
                            controller.get('filteredCountries').updateContent(objects[i].options);
                            break;
                        case "regions":
                            controller.get('filteredRegions').updateContent(objects[i].options);
                            break;
                        default:
                            break;
                    }
                }

            });
            */
        });
    },

    // Updates the queryFilter based on the queryParam. Parameters  with a null
    // or empty value are removed from the filter list.
    updateQueryFilter: function(queryParam) {
        var query = this.get('queryFilter');
        var tempQuery = $.extend({}, query);

        // Delete the param if it's already in the queryFilter. This lets us update
        // the param or leave it deleted depending on what's requested.
        var i = 0;
        for (var property in queryParam) {
            if (i > 0) {
                // TODO: Support multiple queryFilter parameter updates.
                break;  // Only use the first property in queryParam.
            }
            if (undefined != tempQuery[property]) {
                delete tempQuery[property];
            }
            i++;
        }

        // The offset parameter needs to be deleted on every filter update.
        if (undefined != tempQuery['offset']) {
            delete tempQuery['offset'];
        }

        // Create an updated queryFilter.
        if (queryParam[property] == null || queryParam[property].length == 0 ) {
            // QueryParam[property] is null or empty string. Ignore it.
            var updatedQuery = tempQuery;
        } else {
            var updatedQuery = $.extend(queryParam, tempQuery);
        }

        // Set the updated queryFilter and populate the data.
        this.set('queryFilter', updatedQuery);
    },

    // Convenience method that combines updateQueryFilter() and populate().
    applyFilter: function(queryParam) {
        this.updateQueryFilter(queryParam);
        this.populate();
    }
});

/* The search form. */
App.ProjectSearchFormView = Em.View.extend({
    tagName : 'form',
    templateName: 'project-search-form',
    classNames: ['search'],

    submit: function(event) {
        // inspired by http://jsfiddle.net/dgeb/RBbpS/
        event.preventDefault();
        App.projectSearchController.submitTextSearchForm(event);
//        We want to do something generic like this:
//
//        this.get('controller').update();
//        this.get('controller').addPerson(this.getPath('textField.value'));
//        this.setPath('textField.value', null);
//
//        This can't be done right now because the tplhandlebars doesn't support
//        anonymous handlebar scripts which means we can't define a controllerBinding
//        in the template:
//
//          {{#view App.ProjectSearchFormView controllerBinding="App.projectSearchController"}}
//
//        We can either (1) add anonymous handlebar scripts into the tplhandlebars django
//        template tag or (2) create the anonymous handlebar scripts in HTML and load
//        them manually. The best option is probably (2) because we want that functionality
//        for other reasons.

    }
});


App.progressBarAnimationMixin = Em.Mixin.create({
    donatedPercentage: function(){
        var project = this.get('content');
        if (project.money_asked) {
            return 100 * project.money_donated / project.money_asked;
        }
        return 0;
    }.property('content'),
    animateBar: function() {
        var p = this.get('donatedPercentage');
        var bar = this.$('.donated-bar');
        var label = this.$('.donated-text');
        // Only animate
        if (p > 0) {
            label.fadeTo(0,0);
            if (p < 40) {
                label.css({marginRight: '-1px', marginLeft: p + '%'});
                label.removeClass('right');
                label.addClass('left');
            } else {
                var pr = 100 - p;
                label.css({marginLeft: '-1px',marginRight : pr + '%'});
                label.removeClass('left');
                label.addClass('right');
            }
            bar.animate({width: p +'%'}, 1000,
                function(){label.fadeTo(200, 1);}
            );
        }
    }.observes('donatedPercentage')
    
});


/* The search results. */
App.ProjectSearchResultsSectionView  = Em.View.extend({
    tagName: 'div',
    classNames: ['lightgray', 'section', 'results'],
    templateName: 'project_searchresults',

});


App.ProjectSearchResultsNextView = Em.View.extend({
    tagName: 'div',
    classNames: ['paginator', 'next'],

    nextBinding: 'App.projectSearchController.nextSearchResult',
    //TODO: Do hidden smarter (template?)
    classNameBindings:['disabled'],

    disabled: function () {
        if (this.get('next') == null) return true;
        return false;
    }.property('next'),

    click: function(event) {
        if (this.next) {
            // TODO: Can we make this independent of the controller?
            App.projectSearchController.clickPrevNext(event, this.next);
        }
    }
});


App.ProjectSearchResultsPreviousView = Em.View.extend({
    tagName: 'div',
    classNames: ['paginator', 'previous'],

    previousBinding: 'App.projectSearchController.previousSearchResult',
    // TODO: Do hidden smarter (template?)
    classNameBindings: ['disabled'],

    disabled: function() {
        if (this.get('previous') == null) return true;
        return false;
    }.property('previous'),

    click: function(event) {
        if (this.previous) {
            // TODO: Can we make this independent of the controller?
            App.projectSearchController.clickPrevNext(event, this.previous);
        }
    }
});


App.ProjectSearchResultsView = Em.CollectionView.extend({
    tagName: 'ul',
    templateName: 'project-search-results',
    classNames: ['row'],
    emptyView: Em.View.extend({
      templateName: 'project-no-results'
    }),
    contentBinding: 'App.projectSearchController.content',
    itemViewClass: 'App.ProjectPreviewView',


});



App.ProjectPreviewView = Em.View.extend(App.progressBarAnimationMixin, {
    tagName: 'li',
    templateName: 'project-preview',
    classNames: ['project-mid', 'grid_1', 'column'],
    // Trigger animateBar manualy because it doesn't get
    // called properly (content trigger on donatedPercentage doesn't work)
    didInsertElement: function() {
        this._super();
        this.animateBar();
    }
});


// Views that change the query filter.
App.FilterSelect = Em.Select.extend({
    change: function(event){
        event.preventDefault();
        var queryParam = {};
        // TODO Add support for multi-selection by looping through selection object.
        var selection = this.get('selection')
        queryParam[this.get('name')] = selection != null ? selection.id : null;
        this.get('controller').applyFilter(queryParam);
    }
});

App.ProjectRegionSelect = App.FilterSelect.extend({
    controller: App.projectSearchController,
    name: "regions",
    viewName: "ProjectRegionSelect",
    contentBinding: "App.projectSearchController.filteredRegions",
    optionLabelPath: "content.name",
    optionValuePath: "content.id",
    prompt: "Region"
});

App.ProjectCountrySelect = App.FilterSelect.extend({
    controller: App.projectSearchController,
    name: "countries",
    viewName: "ProjectCountrySelect",
    contentBinding: "App.projectSearchController.filteredCountries",
    optionLabelPath: "content.name",
    optionValuePath: "content.id",
    prompt: "Country"
});



App.ProjectStartView = Em.View.extend({
    templateName:'project-start'
});



/*
 * Project Detail
 */
App.projectModel = Em.Object.create({});

App.projectDetailController = Em.ObjectController.create({
    content: null,
    activePane: 'pictures',

    populate: function(slug){
        var controller = this;
        require(['app/data_source'], function(){
            App.dataSource.get('projects/' + slug, {}, function(data) {
                controller.set('content', data);
            });
        })
    }
});


App.ProjectDetailView = Em.View.extend({
    contentBinding: 'App.projectDetailController',
    templateName: 'project_detail',
    classNames: ['lightgreen', 'section'],
 
    templateForName: function(name, type) {
        if (!name) {
            return "";
        }
        var templates = Em.get(this, 'templates'),
            template = Em.get(templates, name),
            view = this;
        if (template) {
            return template;
        } else {
            view.set('templateName', 'waiting');
            require(['app/data_source'], function(){
                App.dataSource.getTemplate(name, function(data) {
                    // Iterate through handlebar tags
                    $(data).filter('script[type="text/x-handlebars"]').each(function() {
                        // Only load the template we're looking for
                        if (name == $(this).attr('data-template-name')) {
                            var raw = $(this).html();
                            var template = Em.Handlebars.compile(raw);
                            Em.TEMPLATES[name] = template;
                            view.set('templateName', name);
                            view.rerender();
                            
                        }
                    });
                });
            });
        }
    }
    
});

App.ProjectStatsView = Em.View.extend({
    contentBinding: 'App.projectDetailController',
    templateName:'project-stats'
});


App.ProjectProgressBarView = Em.View.extend(App.progressBarAnimationMixin, {
    contentBinding: 'App.projectDetailController.content',
    templateName:'project-progress-bar'
});


/* 
 * Media Viewer 
 */
App.projectMediaViewerController = Em.ObjectController.create({
    contentBinding: 'App.projectDetailController',
    activePane: 'pictures'
});

App.ProjectMediaView = Em.View.extend({
    contentBinding: 'App.projectMediaViewerController',
    templateName:'project-media'
});

App.ProjectMediaPicturesView = Em.View.extend({
    contentBinding: 'App.projectMediaViewerController',
    templateName:'project-media-pictures'
});

App.ProjectMediaPlanView = Em.View.extend({
    contentBinding: 'App.projectMediaViewerController',
    templateName:'project-media-plan'
});

App.ProjectMediaVideosView = Em.View.extend({
    contentBinding: 'App.projectMediaViewerController',
    templateName:'project-media-videos'
});

// MediaViewer: panes with media come after this
App.ProjectMediaMapView = Em.View.extend({
    // Explicit call to App.projectDetailController.content
    // because it doesn't work with App.projectMediaViewerController
    //contentBinding: 'App.projectMediaViewerController',
    contentBinding: 'App.projectDetailController.content',
    templateName:'project-media-map',
    map: {},
    loadMap: function(){
        var view = this;
        // Delayed loading here so we're sure it's rendered
        // Otherwise gmap might cough
        var project = view.get('content');
        this.map = new BlueMap('bigmap', {
            slug: project.slug,
            latitude: project.latitude,
            longitude: project.longitude
        }).showProjects(); 
    }.observes('content')
});

// Used as Mediaviewer panes
App.ProjectMediaPaneView = Em.View.extend({
    contentBinding: 'App.projectMediaViewerController',
    activePaneBinding: 'App.projectMediaViewerController.activePane',
    classNames: ['pane'],
    classNameBindings: ['active'], 
    active: function(){
        if (this.get('activePane') == this.get('value')) {
            return true;
        }
        return false;
    }.property('activePane'),
    tagName: 'div'
});


// Used for Mediaviewer buttons to switch panes
App.ProjectMediaButtonView = Em.View.extend({
    contentBinding: 'App.projectMediaViewerController',
    activePaneBinding: 'App.projectMediaViewerController.activePane',
    classNameBindings: ['active'], 
    tagName: 'button',
    active: function(){
        if (this.get('activePane') == this.get('value')) {
            return true;
        }
        return false;
    }.property('activePane'),
    classNameBindings: ['active'],
    click: function(){
        this.set('activePane', this.get('value'));
    }
});


