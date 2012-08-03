var BlueApp = Bluebone;

BlueApp.addListView('ProjectsSearchResults', {
    resource: 'Project',
    itemView: 'ProjectSearchItem',
    url: '/projects/api/project/',
    params: {'phases[]': 'plan'},
    order: 'title',
    tpl: 'ProjectSearch',
});

BlueApp.addListView('ProjectSearchForm', {
    resource: 'ProjectSearchForm',
    url: '/projects/api/projectsearchform/',
    params: {'phases[]': 'plan'},
    tpl: 'ProjectSearchForm',
});


BlueApp.setAfterRender(function(el){
	init(el);
});


BlueApp.routers.Main = new (Bluebone.Router.extend({
    routes: {
        ""                    : "home",
        "projects/:slug/"     : "project",
        "projects/:slug/map/" : "projectMap",
        "projects/?:params"	  : "projectSearch",
        "projects/api/project/?:params"	  : "projectSearch",
    },

    initialize: function () {
        console.log('Initializing BlueApp');
    },
	

    project: function(slug) {
	    BlueApp.renderSnippetTo('#toppanel', '/projects/' +  slug );
    },


    projectMap: function(slug) {
    	var url = '/projects/' + slug + '/map';
    	BlueApp.renderSnippetTo('#toppanel', url);
    },

	projectSearch: function(getstring) {
		BlueApp.views.ProjectsSearchResults.renderTo('.searchResults', getstring)
	}
	

}));

Backbone.history.start();
