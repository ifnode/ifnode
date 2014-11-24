//const STATUS = {
//    ok: 0,
//    fail: 1,
//    error: 2
//};
//
//var requestPopulate = function(request) {
//    if(request.method === 'GET') {
//        request.data = request.query;
//    } else {
//        request.data = request.body;
//    }
//};
//var responsePopulate = function(response) {
//    response.ok = function(data) {
//        var responseData = {status: STATUS.ok, version: config.VERSION};
//        if(data) {
//            responseData.data = data;
//        }
//        response.json(data);
//        //response.json(responseData);
//    };
//    response.fail = function(key) {
//        response.json({
//            status: STATUS.fail,
//            data: key
//        });
//    };
//    response.err = response.error = function(err) {
//        console.log(err);
//        throw err;
//        response.json({
//            status: STATUS.error,
//            version: config.VERSION,
//            data: err
//        });
//    };
//};
//var REST = function(request, response, next) {
//    if(
//        typeof request.data === 'undefined' &&
//        typeof response.ok === 'undefined' &&
//        typeof response.fail === 'undefined' &&
//        typeof response.err === 'undefined' &&
//        typeof response.error === 'undefined'
//    ) {
////    console.log('json', response.json);
//        requestPopulate(request);
//        responsePopulate(response);
//    } else {
//        throw 'Some module rewrite response';
//    }
//    next();
//};
//module.exports = function() {
//    return REST;
//};

var request_populate = function(request) {
    if(request.method === 'GET') {
        request.data = request.query;
    } else {
        request.data = request.body;
    }

    if(
        Object.prototype.toString.call(request.data) === '[object Object]' &&
        !Object.keys(request.data).length
    ) {
        request.data = null;
    }
};
var response_populate = function(response) {
    response.ok = function(data) {
        response.json(data);
    };
    response.fail = function(key) {
        response.json({
            status: 'fail',
            data: key
        });
    };
    response.err = response.error = function(err) {
        throw err;
    };
};
var REST = function(request, response, next) {
    if(
        typeof request.data === 'undefined' &&
        typeof response.ok === 'undefined' &&
        typeof response.fail === 'undefined' &&
        typeof response.err === 'undefined' &&
        typeof response.error === 'undefined'
    ) {
        request_populate(request);
        response_populate(response);
    } else {
        throw 'Some module rewrite response';
    }

    next();
};

module.exports = function() { return REST };
