var mysql = require('mysql');

var connection = mysql.createConnection({
    user: 'root',
    password: ''
});

var Model = function(options) {
    if( !(this instanceof Model) ) { return new Model(options); }

    this._adapter = connection;
    this._options = options;
    this._initialize();
};

Model.fn = Model.prototype;
Model.fn = {
    initialize: function(options) {
        this._table_name = options.table;
        this._initialize_by_tables_data();
    }
};

Model.fn._initialize_by_tables_data = function() {
    this._adapter.query('show columns', function(err, columns) {

    });
};

var check_options = function() {

};
var init_hasMany = function() {

};
var init_belongTo = function() {

};

Model.__defineGetter__('TYPES', function() {
    return {
        String: String,
        Number: Number,
        Date: Date,
        Enum: schema.EnumFactory
    }
});

module.exports = Model;

//var mysql      = require('mysql');
//var connection = mysql.createConnection({
//    host     : 'localhost',
//    user     : 'root',
//    password : '',
//    database: 'anibel'
//});
//
//connection.connect();
//
//connection.query('show columns from `users`', function(err, rows, fields) {
//    if (err) throw err;
//
//    console.log(rows);
//});
//
//connection.end();
//
