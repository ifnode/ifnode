var helper = require('./helper'),
    _ = require('lodash'),

    config,
    default_config = {
        site: {
            local: {
                host: 'localhost',
                port: 8080
            },
            global: {
                host: 'localhost',
                port: 8080

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

        db: {
            virtual: {
                type: 'virtual'
            }
        }
    },

    initialize_properties_config = function() {
        config.application = config.application || {};
        config.components = config.components || {};
    },
    initialize_site_config = function() {
        var set_default = function(site_config, default_config) {
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

        helper.location_init(config.site.local);
        helper.location_init(config.site.global);
    },
    initialize_session_config = function() {
        var session_config = config.application.session,
            default_session_config = default_config.application.session;

        if(session_config && !session_config.secret) {
            session_config.secret = default_session_config.secret;
        }
    },
    initialize_db_config = function() {
        var db_config = config.db;

        if(!db_config) {
            _.defaults(config.db, default_config.db);
        } else {
            _.extend(config.db, default_config.db);
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

        initialize_properties_config();
        initialize_site_config();
        initialize_session_config();
        initialize_db_config();
        initialize_config_helpers();
    };

module.exports = function(options) {
    if(!config) {
        initialize_config(options);
    }

    return config;
};
