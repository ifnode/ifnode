var _ = require('underscore'),

    config,
    default_config = {
        site: {
            local: {
                host: 'localhost',
                ssl: false
            },
            global: {
                host: 'localhost',
                ssl: false

                // TODO: support of https
                //ssl: {
                //    key: 'path/to/file',
                //    cert: ''path/to/file
                //}
            }
        },
        application: {
            session: {
                secret: 'it\'s secret'
            }
        },
        components: {
            emailer: {
                disabled: true
            }
        }
    },
    add_application_version = function(app_path) {
        var path = require('path'),
            application_package = require( path.join(app_path, 'package.json') );

        config.version = application_package.version;
    },
    initialize_site_config = function() {
        var origin_getter = function() {
                var protocol = this.ssl? 'https://' : 'http://',
                    port = this.port? ':' + this.port : '';

                return protocol + this.host + port;
            },
            generate_url = function(pathname) {
                return this.origin + pathname;
            },

            init_config = function(site_config, default_config) {
                site_config = site_config?
                    _.defaults(site_config, default_config) :
                    _.clone(default_config);

                Object.defineProperties(site_config, {
                    'origin': { enumerable: true, get: origin_getter },
                    'url': { enumerable: true, value: generate_url }
                });
            };

        init_config(config.site.local, default_config.site.local);
        init_config(config.site.global, default_config.site.global);
    },
    initialize_session_config = function() {
        var session_config = config.application.session,
            default_session_config = default_config.application.session;

        if(!session_config) {
            config.application.session = _.clone(default_session_config);
        } else if(!session_config.secret) {
            session_config.secret = default_session_config.secret;
        }
    },
    initialize_components_config = function() {
        if(!config.components) {
            config.components = _.clone(default_config.components);
        }
    },
    initialize_config_helpers = function() {
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
        if(!options.config_path) {
            config = default_config;
            return;
        }

        config = require(options.config_path);

        add_application_version(options.app_path);
        initialize_site_config();
        initialize_session_config();
        initialize_components_config();
        initialize_config_helpers();
    };

module.exports = function(options) {
    if(!config) {
        initialize_config(options);
    }

    return config;
};
