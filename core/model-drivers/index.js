var _ = require('lodash'),
    diread = require('diread'),

    drivers = {},
    initialize = function(options) {

        drivers = _.extend(
            initialize_core_model_drivers(),
            initialize_user_drivers(options)
        );
    },
    initialize_user_drivers = function(options) {
        var user_drivers_dir = options.user_model_drivers_folder,
            user_drivers = {};

        diread({ src: user_drivers_dir }).each(function(driver_path, file_name) {
            user_drivers[file_name] = require(driver_path);
        });

        return user_drivers;
    },
    initialize_core_model_drivers = function() {
        return {
            mongoose: require('./mongoose'),
            knex: require('./knex'),
            redis: require('./redis'),
            virtual: require('./virtual')
        };
    },

    get_driver = function(db) {
        var driver = drivers[db.type];

        if(!driver) {
            throw Error('Cannot find driver: %s', db.type);
        }

        return driver(db.config);
    };

module.exports = function(options) {
    initialize(options);

    return get_driver;
};
