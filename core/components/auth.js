var app = require('ifnode')(),
    _ = require('lodash'),
    passport = require('passport'),

    auth = app.Component({
        name: 'auth'
    });

auth._init_strategy = function(name, config, process) {
    var module_name = 'passport-' + name,
        module = require(module_name),
        strategy,

        default_passport_strategy = 'Strategy',
        custom_passport_strategy = config.passport_strategy || config.passportStrategy;

    strategy = module[custom_passport_strategy || default_passport_strategy];

    if(!strategy) {
        throw new Error('Cannot get module Strategy instance');
    }

    this._passport.use(new strategy(config, process));
};

auth._initialize = function(config) {
    var self = this,
        passport_instance = this._passport = passport,
        webuser = this._webuser_model = app.models.webuser,
        webuser_strategies = webuser.strategy/* || _.omit(webuser, ['serialize', 'deserialize'])*/,
        supported_strategies = config,
        supported_strategies_names = Object.keys(supported_strategies),
        auth_config = app.config.auth;

    passport_instance.serializeUser(webuser.serialize);
    passport_instance.deserializeUser(webuser.deserialize);

    supported_strategies_names.forEach(function(name) {
        var process = webuser_strategies[name];

        if(!process) {
            console.warn('Cannot find strategy process');
            process = function() {};
        }

        self._init_strategy(name, supported_strategies[name], process);
    });

};

auth.authenticate = function(strategy, options, cb) {
    return this._passport.authenticate(strategy, options, cb);
};
auth.attach = function(server) {
    this._initialize(this.config);
    server.use(this._passport.initialize(this._passport));
    server.use(this._passport.session(this._passport));

    return this;
};
