var _ = require('underscore');

var Auth = function(app) {
    this._passport = require('passport');
    this.init(app);
};

Auth.fn = Auth.prototype;
Auth.fn.SUPPORTED_STRATEGIES = ['local', 'facebook', 'twitter', 'google'];
Auth.fn._strategy = {
    local: function(rawConfig) {
        var strategy = require('passport-local').Strategy;
        var config = {
            usernameField: rawConfig.key || 'id'
        };
        this._passport.use(new strategy(config, rawConfig.process));
    },
    facebook: function(rawConfig) {
        var config = _.omit(rawConfig,'process');
        var strategy = require('passport-facebook').Strategy;
        this._passport.use(new strategy(config, function(access_token, refresh_token, profile, done) {
            rawConfig.process(profile, done);
        }));
    },
    twitter: function(rawConfig) {
        var config = _.omit(rawConfig,'process');
        var strategy = require('passport-twitter').Strategy;
        this._passport.use(new strategy(config, function(token, tokenSecret, profile, done) {
            rawConfig.process(profile, done);
        }));
    },
    google: function(rawConfig) {
        var config = _.omit(rawConfig,'process');
        var strategy = require('passport-google-oauth').OAuth2Strategy;
        this._passport.use(new strategy(config, function(token, tokenSecret, profile, done) {
            rawConfig.process(profile, done);
        }));
    }
};

Auth.fn.init = function(app) {
    var self = this,
        strategy = this._strategy,
        auth_config = app.config.auth;

    this._passport.serializeUser(auth_config.serialize.bind(app));
    this._passport.deserializeUser(auth_config.deserialize.bind(app));

    this.SUPPORTED_STRATEGIES.forEach(function(strategy_name) {
        if(strategy_name in auth_config) {
            if(typeof auth_config[strategy_name].process === 'function') {
                auth_config[strategy_name].process = auth_config[strategy_name].process.bind(app);
            }

            strategy[strategy_name].call(self, auth_config[strategy_name]);
        }
    });
};

Auth.fn.authenticate = function(strategy, options, cb) {
    return this._passport.authenticate(strategy, options, cb);
};
Auth.fn.initialize = function() {
    return this._passport.initialize(this._passport);
};
Auth.fn.session = function() {
    return this._passport.session(this._passport);
};

module.exports = function(auth_config) {
    return new Auth(auth_config);
};
