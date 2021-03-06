var get = Ember.get, set = Ember.set;

DS.DRF2Serializer = DS.RESTSerializer.extend({

    /**
     * Add serialization support for arrays.
     */
    init: function() {
        this._super();
        this.registerTransform('array', {
            deserialize: function(serialized) {
                return Ember.isNone(serialized) ? null : Em.A(serialized);
            },
            serialize: function(deserialized) {
                // FIXME: deserialized doesn't have a toJSON() method.
                return Ember.isNone(deserialized) ? null : deserialized.toJSON();
            }
        });
    },

    /**
     * Changes from default:
     * - Don't call sideload() because DRF2 doesn't support it.
     * - Get results directly from json.
     */
    extract: function(loader, json, type, record) {

        this.extractMeta(loader, type, json);

        if (json) {
            if (record) {
                loader.updateId(record, json);
            }
            this.extractRecordRepresentation(loader, type, json);
        }
    },

    /**
     * Changes from default:
     * - Don't call sideload() because DRF2 doesn't support it.
     * - Get results from json.results or directly from json.
     */
    extractMany: function(loader, json, type, records) {

        this.extractMeta(loader, type, json);

        if (json['results'] || !Em.isEmpty(json)) {
            var references = [];
            var objects = json['results'] ? json['results'] : json;

            if (records) {
                records = records.toArray();
            }

            for (var i = 0; i < objects.length; i++) {
                if (records) {
                    loader.updateId(records[i], objects[i]);
                }
                var reference = this.extractRecordRepresentation(loader, type, objects[i]);
                references.push(reference);
            }

            loader.populateArray(references);
        }
    },

    /**
     * Changes from default:
     * - Don't append '_id' to the end of the key.
     */
    keyForBelongsTo: function(type, name) {
        return this.keyForAttributeName(type, name);
    },

    /**
     * Changes from default:
     * - Add support for marking attributes as readOnly.
     * https://github.com/emberjs/data/pull/303#issuecomment-14649231
     */
    addAttributes: function(data, record) {
        record.eachAttribute(function(name, attribute) {
            // Skip serializing the attribute if 'readOnly' is true in its mapping
            if (!this.mappingOption(record.constructor, name, 'readOnly')) {
                this._addAttribute(data, record, name, attribute.type);
            }
        }, this);
    }
});



DS.DRF2Adapter = DS.RESTAdapter.extend({

    /**
     * Use a custom serializer for DRF2.
     */
    serializer: DS.DRF2Serializer,

    /**
     * Bulk commits are not supported by this adapter.
     */
    bulkCommit: false,

    /**
     * DRF2 uses the 'next' keyword for paginating results.
     */
    since: 'next',


    /**
     * Changes from default:
     * - Don't embed record within 'root' in the json.
     * - Add support for multipart/form-data form submission.
     */
    createRecord: function(store, type, record) {
        var root = this.rootForType(type, record);

        var data = {};
        data = this.serialize(record, { includeId: true });

        // TODO: Create a general solution for detecting when to use multipart/form-data (i.e. detecting
        //       when there are files that need to be sent).
        if (type.toString() == "App.ProjectWallPostPhoto" && record.get('photo') != "") {
            // TODO: Implement this polyfill for older browsers:
            // https://github.com/francois2metz/html5-formdata
            var formdata = new FormData();
            Object.keys(data).forEach(function(key) {
                if (data[key] !== undefined) {
                    // TODO: This won't be hardcoded when a general solution for detecting when to use
                    //       multipart/form-data is worked out.
                    if (key == 'photo') {
                        var file = record.get('file');
                        formdata.append('photo', file);
                    } else {
                        formdata.append(key, data[key]);
                    }
                }
            });

            this.ajaxFormData(this.buildURL(root), "POST", {
                data: formdata,
                context: this,
                success: function(json) {
                    Ember.run(this, function() {
                        this.didCreateRecord(store, type, record, json);
                    });
                },
                // Make sure we parse any errors.
                error: function(xhr) {
                    this.didError(store, type, record, xhr);
                }
            });

        } else if (type.toString() == "App.TaskFile" && record.get('file')) {
            // TODO: Implement this polyfill for older browsers:
            // https://github.com/francois2metz/html5-formdata
            var formdata = new FormData();
            Object.keys(data).forEach(function(key) {
                if (data[key] !== undefined) {
                    // TODO: This won't be hardcoded when a general solution for detecting when to use
                    //       multipart/form-data is worked out.
                    if (key == 'file') {
                        var file = record.get('file');
                        formdata.append('file', file);
                    } else {
                        formdata.append(key, data[key]);
                    }
                }
            });

            this.ajaxFormData(this.buildURL(root), "POST", {
                data: formdata,
                context: this,
                success: function(json) {
                    Ember.run(this, function() {
                        this.didCreateRecord(store, type, record, json);
                    });
                },
                // Make sure we parse any errors.
                error: function(xhr) {
                    this.didError(store, type, record, xhr);
                }
            });

        } else {
            // Regular json POST (i.e. not multipart/form-data POST).
            this.ajax(this.buildURL(root), "POST", {
                data: data,
                context: this,
                success: function(json) {
                    Ember.run(this, function() {
                        this.didCreateRecord(store, type, record, json);
                    });
                },
                error: function(xhr) {
                    this.didError(store, type, record, xhr);
                }
            });
        }
    },

    /**
     * Changes from default:
     * - Don't embed record within 'root' in the json.
     * TODO: Add support for multipart/form-data form submission.
     */
    updateRecord: function(store, type, record) {
        var id = get(record, 'id');
        var root = this.rootForType(type);

        var data = {};
        data = this.serialize(record);

        if (type == 'App.User' && record.get('file')) {
            var formdata = new FormData();
            Object.keys(data).forEach(function(key) {
                if (data[key] !== undefined) {
                    if (key == 'picture') {
                        var file = record.get('file');
                        formdata.append('picture', file);
                    } else {
                        formdata.append(key, data[key]);
                    }
                }
            });

            this.ajaxFormData(this.buildURL(root, id), "POST", {
                data: formdata,
                context: this,
                headers: {'X-HTTP-Method-Override': 'PUT'},
                success: function(json) {
                    Ember.run(this, function() {
                        this.didSaveRecord(store, type, record, json);
                    });
                },
                error: function(xhr) {
                    this.didError(store, type, record, xhr);
                }
            });
        } else {
            this.ajax(this.buildURL(root, id), "PUT", {
                data: data,
                context: this,
                success: function(json) {
                    Ember.run(this, function() {
                        this.didSaveRecord(store, type, record, json);
                    });
                },
                error: function(xhr) {
                    this.didError(store, type, record, xhr);
                }
            });
        }
    },


    /**
     * A custom version of the ember-data ajax() method to set the hash up correctly for doing
     * a multipart/form-data submission with data generated by FormData.
     */
    ajaxFormData: function(url, type, hash) {
        hash.url = url;
        hash.type = type;
        hash.processData = false;  // tell jQuery not to process the data
        hash.contentType = false;  // tell jQuery not to set contentType
        hash.context = this;

        jQuery.ajax(hash);
     },

    /**
     * Changes from default:
     * - Check for status code 400 instead of 422.
     * - Set the response text directly, not from the 'errors' property.
     */
    didError: function(store, type, record, xhr) {
        if (xhr.status === 400) {
            var data = JSON.parse(xhr.responseText);
            store.recordWasInvalid(record, data);
        } else {
            // TODO: what does this do? Do we want the console log?
            this._super.apply(this, arguments);
            console.error("Unhandled server error with status code: " + xhr.status);
        }
    },

    /**
     * Changes from default:
     * - Don't replace CamelCase with '_'.
     * - Use the record's url field first if it's there.
     * - Check for 'url' defined in the class.
     */
    rootForType: function(type, record) {
        if (record !== undefined && record.hasOwnProperty('url')) {
            return record.url;
        }
        if (type.url) {
            return type.url;
        }
        if (type.proto().url) {
            return type.proto().url;
        }
        // use the last part of the name as the URL
        var parts = type.toString().split(".");
        var name = parts[parts.length - 1];
        return name.toLowerCase();
    },

    /**
     * Changes from default:
     * - Don't add 's' if the url name already ends with 's'.
     */
    pluralize: function(name) {
        if (this.plurals[name])
            return this.plurals[name];
        else if (name.charAt(name.length - 1) === 's')
            return name;
        else
            return name + 's';
    },

    /**
     * Changes from default:
     * - Add trailing slash for lists.
     */
    buildURL: function(record, suffix) {
        var url = this._super(record, suffix);
        if (suffix === undefined && url.charAt(url.length - 1) !== '/') {
            url += '/';
        }
        return url;
    }
});


// Make sure we (de)serialize 'date' attributes the right way.
// DRF2 expects yyy-mm-ddThh:ii:ssZ
// Ember wants an js Date()
DS.DRF2Adapter.registerTransform("date", {
    deserialize: function (serialized) {
        if (serialized == undefined) {
            return null;
        }
        return new Date(serialized);
    },

    serialize: function (date) {
        if (date == null) {
            return null;
        }
        var pad = function (num) {
            return num < 10 ? "0" + num : "" + num;
        };

        var utcYear = date.getUTCFullYear(),
            utcMonth = date.getUTCMonth() +1,
            utcDayOfMonth = date.getUTCDate(),
            utcDay = date.getUTCDay(),
            utcHours = date.getUTCHours(),
            utcMinutes = date.getUTCMinutes(),
            utcSeconds = date.getUTCSeconds();

        return utcYear + "-" + pad(utcMonth) + "-" + pad(utcDayOfMonth) + "T" + pad(utcHours) + ":" + pad(utcMinutes) + ":" + pad(utcSeconds) + "Z";
    }
});
