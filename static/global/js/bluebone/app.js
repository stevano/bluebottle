// We're gonna extend Backbone a bit...
// Let's get funky!


(function() {
    var Bluebone;
    Bluebone = this.Bluebone = Backbone;

    // We want all to be in our namespace
    Bluebone.routers = {};
    Bluebone.models = {};
    Bluebone.views = {};
    Bluebone.templates = {};
    Bluebone.snippets = {};
    
    // Function to run after HTML is rendered
    Bluebone.afterRender; 


	/* ERRORS */
	// Have one place to decide what to do with error messages.
	// In production we might not want to write those to console.
	Bluebone.throwError = function(message, level) {
		if (undefined == level) {
			level = 'ERROR';
		}
		console.log(level + ': ' + message);
		return false;
	} 
	


    /* MODELS */

    // Shortcut to load a model class
    Bluebone.getModels = function(model) {
        if (undefined === Bluebone.models[model]) {
            Bluebone.throwError('Model [' + model + '] not defined.');
        }
        return Bluebone.models[model];
    };

    // Add a Collection with REST connection for a given name
    Bluebone.addCollection = function(name, cfg) {
        if (undefined == cfg || undefined == cfg.url) {
            Bluebone.throwError('Need some configuration to set a resource. Trye {url: <apiUrl>}');
        }
        if (undefined == cfg.method) {
            cfg.method = 'rest'
        }
        Bluebone.models[name] = new(Bluebone.Collection.extend(cfg));
        return Bluebone.models[name];
    };

    /* TEMPLATES */
    // Load a template either from memory or through ajax
    Bluebone.loadTemplate = function(name, callback) {
        if (undefined == Bluebone.templates[name]) {
            $.get('/static/assets/global/tpl/' + name + '.tpl', function(data) {
                Bluebone.templates[name] = data;
                callback(data);
            });
        } else {
            callback(Bluebone.templates[name]);
        }

    }

    /* VIEWS */
    // We set a standard behavior for our Views
    Bluebone.View = Backbone.View.extend({
        initialize: function() {
            return this;
        },
        renderTo: function(el, model) {
            var self = this;
            Bluebone.loadTemplate(this.tpl, function(template){
                if (undefined == model) {
                    $(el).html(template);
	                if (undefined != Bluebone.afterRender) {
	                	Bluebone.afterRender(el);
	                }
                } else {
                    $(el).html(_.template(template, model.attributes));
	                if (undefined != Bluebone.afterRender) {
	                	Bluebone.afterRender(el);
	                }
                }
            });
            return this;
        },

    });
	
    // Get a view from views array
    Bluebone.getView = function(view) {
        if (undefined === Bluebone.views[view]) {
            Bluebone.throwError('View [' + view + '] not loaded!');
        }
        return Bluebone.views[view];
    };

    // Add a view to views array
    Bluebone.addView = function(name, cfg) {
        if (undefined == cfg) {
            cfg = {};
        }
        // Use the same 'name' for template if none set.
        if (undefined === cfg.tpl) {
            cfg.tpl = name;
        }
        // Initiate the view
        Bluebone.views[name] = new (Bluebone.View.extend(cfg));
    };
    
    // Set the callback function to call after a view/snippet is rendered
    // This in mainly to run animations and other events on the 
    // the rendered HTML.
	Bluebone.setAfterRender = function(func) {
		Bluebone.afterRender = func;
	}

	// Add a list view 
	// This will load a view for the list and a view for 
	// list items.
    Bluebone.addListView = function(name, cfg) {
        if (undefined == cfg) {
            var cfg = {};
        }
        if (undefined == cfg.itemView) {
            cfg.itemView = name + 'Item';
        }
        if (undefined == cfg.tpl) {
            cfg.tpl = name
        }
        if (undefined == cfg.resource) {
            cfg.resource = name
        }
        var itemCfg = {tpl: cfg.itemView};
        Bluebone.views[cfg.itemView] = new(Bluebone.ListItemView.extend(itemCfg));
        Bluebone.views[name] = new(Bluebone.Listview.extend(cfg));
    }


    // Create a view with a list of items
    // cfg will need 
    // url: Url to the API
    // resource: a name for the resource
    Bluebone.Listview = Bluebone.View.extend({
        class: 'list',
        initialize: function() {
        	if (undefined == this.resource) {
        		Bluebone.throwError('We need a name for resource to initiate a ListView');
        	}
        	if (undefined == this.url) {
        		Bluebone.throwError('We need a url for resource to initiate a ListView');
        	}
        	// Add a collection
            var collectionName = this.resource + 'Collection';
            this.collection = Bluebone.addCollection(collectionName, {url: this.url});
            return this;
        },
        renderTo: function(el, getparams) {
        	if (undefined == getparams) {
        		params = this.params;
        	} else {
        		// Convert a getstring to a an array
        		// a kind of inverted jQuery.serialize()
        		// example: name=bart&colors[]=pink&colors[]=green
        		// is converted to:
        		// {name:'bart', colors: ['pink', 'green']}
				var params = {};
				var components = getparams.split("&");
				for (c in components) {
					var d = components[c].split("=");
					// Now deal with arrays (mutliple checkboxes)
					var param = d[0].replace(/%5B%5D/, '');
					if (param != d[0]) {
						if (undefined == params[param]) {
							params[param] = new Array();
						}
						params[param].push(d[1]);
					} else {
						params[d[0]] = d[1];
					}
				}
        		
        	}
        	if (undefined == params.limit) {
        		params.limit = 9;
        	}
            var thisView = this;
            var ul = $('<ul></ul>').addClass(thisView.class);
            Bluebone.loadTemplate(thisView.tpl, function(template){
                $(el).html(_.template(template, {list: ul.wrap('<p>').parent().html()}));
            });
            this.collection.fetch({
            	data: params,
                success: function(){
                    var items = thisView.collection.models;
                    // Get the template for ListItems
                    // Rather do it here than in ItenView, so it's only loaded once
                    Bluebone.loadTemplate(thisView.itemView, function(template){
                        for (item in items) {
                            Bluebone.getView(thisView.itemView).render(template, items[item], function(item){
                                var li = $('<li />').append(item);
                                $('ul.' + thisView.class, el).append(li);
                            })
                        }
		                if (undefined != Bluebone.afterRender) {
		                	Bluebone.afterRender(el);
		                }
                    });
                }
            });

        }
    });

    // ListItemView. This should be only called from ListView
    Bluebone.ListItemView = Bluebone.View.extend({
        initialize: function() {
            return this;
        },

        render: function(template, model, callback) {
            callback(_.template(template, model.attributes));
        }
    });


    // Load mulitple views
    // 'view' is the view (view) to use
    // 'container' the DOM element to put it in
    // 
    Bluebone.views.load = function(cfg) {
        $.each(cfg, function(i, container){
        	if (undefined == container.wrapper) {
				var target = $(container.container);        		
        	} else {
        		var wrapper = $('<' + container.wrapper + '/>');
        		if (container.className) {
        			wrapper.addClass(container.className);
        		}	
        		wrapper.appendTo(container.container)
        		var target = wrapper;
        	}
            $.each(container.widgets, function(j, widget) {
                if (target.children('#' + widget.name).attr('id')) {
                    Bluebone.throwError('view ' + widget.name + ' already loaded...', 'info');
                } else {
                	if (undefined == widget.className) {
                		widget.className = 'widget';
                	};
                    $('<div />', {class: widget.className, id: widget.name}).appendTo(target);
                    Bluebone.getView(widget.name).renderTo('#' + widget.name);
                }
            });
        });
    };
    

	/* SNIPPETS */

	// Special view for loading HTML snippets
    Bluebone.Snippet = new (Backbone.View.extend({

        initialize: function() {
            return this;
        },

        renderTo: function(el, url) {
            var self = this;
            Bluebone.loadSnippet(url, function(html){
                $(el).html(html);
                if (undefined !== Bluebone.afterRender) {
                	Bluebone.afterRender(el);
                }
            });
            return this;
        },

    }));


    // Load a html snippets either from memory or through ajax
    Bluebone.loadSnippet = function(url, callback) {
    	var name = url.replace(/\//g, ".");
        if (undefined == Bluebone.templates[name]) {
            $.get(url, function(data) {
                Bluebone.templates[name] = data;
                callback(data);
            });
        } else {
            callback(Bluebone.templates[name]);
        }

    }

	Bluebone.renderSnippetTo = function(el, url){
		Bluebone.Snippet.renderTo(el, url);
	}



}).call(this);