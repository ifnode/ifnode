'use strict';

var debug = require('debug')('ifnode:config'),
    path = require('path'),
    _ = require('lodash'),
    helper = require('./helper'),

    set_defaults = function(params) {
        var obj = params.obj[0],
            prop = params.obj[1],
            defaults = params.defaults;

        obj[prop] = obj[prop]?
            _.defaults(obj[prop], defaults) :
            _.clone(defaults);
    },

    initialize_default_config = function(options) {
        var backend_folder = options.backend_folder,
            env = options.environment || 'local',

            view_path = path.resolve(backend_folder, 'views/');

        return {
            environment: env,
            site: {
                //ssl: {
                //    key: '',
                //    cert: ''
                //
                //    pfx: ''
                //},
                local: {
                    host: 'localhost',
                    port: 8080
                },
                global: {
                    host: 'localhost'
                }
            },
            application: {
                express: {
                    'env': env,
                    'views': view_path,
                    'view engine': 'jade',
                    'x-powered-by': false
                },
                folders: {
                    extensions: path.resolve(backend_folder, 'extensions/'),
                    components: path.resolve(backend_folder, 'components/'),
                    views: view_path,
                    controllers: path.resolve(backend_folder, 'controllers/'),
                    models: path.resolve(backend_folder, 'models/')
                }
            },

            db: {
                virtual: {
                    schema: 'virtual'
                }
            }
        };
    },

    initialize_properties_config = function(config, default_config, project_folder) {
        config.environment = config.env = config.environment || config.env || default_config.environment;
        config.application = config.application || {};
        config.components = config.components || {};

        if(config.application.folders) {
            Object.keys(config.application.folders).forEach(function(type) {
                var short_path = config.application.folders[type],
                    full_path = path.resolve(project_folder, short_path);

                config.application.folders[type] = full_path;
            });

            if(config.application.folders.views) {
                set_defaults({
                    obj: [config.application, 'express'],
                    defaults: {
                        views: config.application.folders.views
                    }
                });
            }
        } else {
            config.application.folders = {};
        }


        set_defaults({
            obj: [config.application, 'folders'],
            defaults: default_config.application.folders
        });

        set_defaults({
            obj: [config.application, 'express'],
            defaults: default_config.application.express
        });
    },
    initialize_site_config = function(config, default_config, project_folder) {
        var initialize_ssl_config = function() {
                var check_ssl_property = function(config, default_ssl_config) {
                    if(typeof config.ssl !== 'undefined') {
                        if(typeof config.ssl === 'boolean') {
                            return;
                        }

                        if(config.ssl.pfx) {
                            config.ssl.pfx = path.resolve(project_folder, config.ssl.pfx);
                        } else {
                            config.ssl.key = path.resolve(project_folder, config.ssl.key);
                            config.ssl.cert = path.resolve(project_folder, config.ssl.cert);
                        }
                    } else if(default_ssl_config) {
                        set_defaults({
                            obj: [config, 'ssl'],
                            defaults: default_ssl_config
                        });
                    }
                };

                check_ssl_property(config.site);
                check_ssl_property(config.site.local,  config.site.ssl);
                check_ssl_property(config.site.global, config.site.ssl);
            },
            set_default = function(site_config, default_config) {
                if(!site_config.host) {
                    site_config.host = default_config.host;
                }
                if(_.contains(['127.0.0.1', 'localhost'], site_config.host) &&
                    !site_config.port
                ) {
                    site_config.port = default_config.port;
                }
            };

        if(!config.site) {
            config.site = _.clone(default_config.site);
            return;
        }

        if(!config.site.local) {
            config.site.local = _.clone(default_config.site.local);
        } else {
            set_default(config.site.local, default_config.site.local);
        }

        if(!config.site.global) {
            config.site.global = _.clone(config.site.local);
        }

        initialize_ssl_config();

        helper.location_init(config.site.local, !!config.site.local.ssl);
        helper.location_init(config.site.global, !!config.site.global.ssl);
    },
    initialize_session_config = function(config, default_config) {
        var session_config = config.application.session,
            default_session_config = default_config.application.session;

        if(session_config && !session_config.secret) {
            session_config.secret = default_session_config.secret;
        }
    },
    initialize_db_config = function(config, default_config) {
        config.db = _.defaults(config.db || {}, default_config.db);
    },
    initialize_config_helpers = function(config, default_config) {
        config.by_path = function(path) {
            var parts = path.split('.'),
                tmp = this,
                part, i, len = parts.length;

            for(i = 0; i < len; ++i) {
                part = parts[i];
                tmp = tmp[part];

                if(typeof tmp === 'undefined') {
                    return null;
                }
            }

            return tmp;
        };
    },

    initialize_config = function(options) {
        var config,
            default_config = initialize_default_config(options);

        if(!options.config_path) {
            return helper.deep_freeze(default_config);
        }

        config = require(options.config_path);

        initialize_properties_config(config, default_config, options.project_folder);
        initialize_site_config(config, default_config, options.project_folder);
        initialize_session_config(config, default_config);
        initialize_db_config(config, default_config);
        initialize_config_helpers(config, default_config);

        return helper.deep_freeze(config);
    };

module.exports = function(options) {
    return initialize_config(options);
};
