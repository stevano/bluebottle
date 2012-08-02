var BlueApp = Bluebone;

BlueApp.addListView('ProjectsSearchResults', {
    resource: 'Project',
    itemView: 'ProjectSearchItem',
    url: '/projects/api/project/',
    params: {'phases[]': 'plan'},
    order: 'title',
    tpl: 'ProjectSearch',
});

BlueApp.addView('ProjectSearchForm');


BlueApp.setAfterRender(function(el){
	init(el);
});


BlueApp.routers.Main = new (Bluebone.Router.extend({
    routes: {
        ""                    : "home",
        "projects/:slug/"     : "project",
        "projects/:slug/map/" : "projectMap",
        "project/search/?:params"	  : "projectSearch",
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
