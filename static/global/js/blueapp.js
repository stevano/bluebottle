// Have a NameSpaced App
var BlueApp = Bluebone;

BlueApp.views.add('TopMenu');

BlueApp.views.addList('RecentProjects', {
    resource: 'Project',
    itemView: 'ProjectListItem',
    url: '/projects/api/project/'
});

BlueApp.views.add('About');

BlueApp.views.add('New', {tpl: 'About'});

BlueApp.views.add('Project');

BlueApp.snippets.setCallback(function(){
	init();
});

BlueApp.routers.Main = new (Bluebone.Router.extend({
    routes: {
        ""                   : "home",
        "projects/:slug/"     : "project",
        "projects/:slug/map/" : "projectMap",
    },

    initialize: function () {
        console.log('Initializing BlueApp');
    },
	

    project: function(slug) {
	    BlueApp.snippets.renderTo('#toppanel', '/projects/' +  slug );
    },


    projectMap: function(slug) {
    	var url = '/projects/' + slug + '/map';
    	BlueApp.snippets.renderTo('#toppanel', url);
    }

}));

Backbone.history.start();
