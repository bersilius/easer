'use strict';

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _restToolCommon = require('rest-tool-common');

var _auth = require('../auth/');

var _monitoring = require('../monitoring');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getEndpointMap = function getEndpointMap(container) {
    var makeJsonicFriendly = function makeJsonicFriendly(uri) {
        //return uri.replace(/\{|\}/g, ':')
        return uri.replace(/\{/g, ':').replace(/\}/g, '');
    };

    // Load services config and service descriptors
    //const endpoints = services.load(__dirname, '../config/defaults/restapi/services')
    var endpoints = _restToolCommon.services.load(container.config.webServer.restApiPath, '');
    console.log('endpoints', container.config.webServer.restApiPath, _lodash2.default.keys(endpoints));
    return _lodash2.default.flatMap(endpoints, function (endpoint) {
        var uri = endpoint.uriTemplate;
        var methods = endpoint.methodList;
        return _lodash2.default.map(methods, function (method) {
            return {
                method: method.methodName.toLowerCase(),
                uri: uri,
                jsfUri: makeJsonicFriendly(uri),
                endpointDesc: endpoint
            };
        });
    });
};

var mkHandlerFun = function mkHandlerFun(endpoint, container) {
    return function (req, res) {
        container.logger.info('REQ method:"' + endpoint.method + '" uri:"' + endpoint.uri + '"');

        if (container.config.webServer.usePdms) {
            container.logger.info('PDMS.ACT topic: "' + endpoint.uri + '" method:"' + endpoint.method + '" uri:"' + endpoint.uri + '"');
            container.pdms.act({
                topic: endpoint.uri,
                method: endpoint.method,
                uri: endpoint.uri,
                endpointDesc: endpoint,
                request: {
                    user: req.user,
                    cookies: req.cookies,
                    headers: req.headers,
                    parameters: {
                        query: req.query,
                        uri: req.params
                    },
                    body: req.body
                }
            }, function (err, resp) {
                if (err) {
                    container.logger.info('ERR ' + JSON.stringify(err, null, ''));
                    res.set(_lodash2.default.get(err, 'details.headers', {})).status(_lodash2.default.get(err, 'details.status', 500)).send(_lodash2.default.get(err, 'details.body', {}));
                } else {
                    container.logger.info('RES ' + JSON.stringify(resp, null, ''));
                    res.set(resp.headers || {}).status(_lodash2.default.get(resp, 'status', 200)).send(resp.body);
                }
            });
        } else {
            var userId = _lodash2.default.hasIn(req, 'user.id') ? req.user.id : 'unknown';

            if (endpoint.method === 'get' && endpoint.uri === '/auth/profile') {
                (0, _auth.getProfile)(userId, function (err, resp) {
                    if (err) {
                        res.set(_lodash2.default.get(err, 'details.headers', {})).status(_lodash2.default.get(err, 'details.status', 404)).json(err.details.body);
                    } else {
                        res.set(resp.headers || {}).status(_lodash2.default.get(resp, 'status', 200)).json(resp.body);
                    }
                });
            } else if (endpoint.method === 'post' && endpoint.uri === '/auth/registration') {
                //            console.log('POST /auth/registration:', req.body)
                (0, _auth.postRegistration)(req.body.username, req.body.password, function (err, resp) {
                    if (err) {
                        res.set(_lodash2.default.get(err, 'details.headers', {})).status(_lodash2.default.get(err, 'details.status', 409)).json(_lodash2.default.get(err, 'details.body', {}));
                    } else {
                        res.set(resp.headers || {}).status(_lodash2.default.get(resp, 'status', 201)).json(resp.body);
                    }
                });
            } else if (endpoint.method === 'get' && endpoint.uri === '/monitoring/isAlive') {
                (0, _monitoring.getMonitoringIsAlive)(userId, function (err, resp) {
                    // This function always returns with OK
                    res.set(resp.headers || {}).status(200).json(resp.body);
                });
            } else {
                console.log('endpoint: ', JSON.stringify(endpoint, null, '  '));
                var responseHeaders = _restToolCommon.services.getResponseHeaders(endpoint.method, endpoint.endpointDesc);
                var responseBody = _restToolCommon.services.getMockResponseBody(endpoint.method, endpoint.endpointDesc) || endpoint;
                res.set(responseHeaders).status(200).json(responseBody);

                //res.status(500).json({ error: `${endpoint.method} ${endpoint.uri} endpoint is not implemented` })
            }
        }
    };
};

var set = function set(server, authGuard, container) {
    if (container.config.webServer.usePdms) {
        // Add built-in profile service
        container.pdms.add({ topic: '/auth/profile', method: 'get', uri: '/auth/profile' }, function (data, cb) {
            container.logger.info('Profile handler called with ' + JSON.stringify(data.request.user, null, '') + ', ' + data.method + ', ' + data.uri + ', ...');
            var userId = _lodash2.default.hasIn(data.request, 'user.id') ? req.user.id : 'unknown';
            (0, _auth.getProfile)(userId, cb);
        });

        // Add built-in registration service
        container.pdms.add({ topic: '/auth/registration', method: 'post', uri: '/auth/registration' }, function (data, cb) {
            container.logger.info('User registration handler called with ' + JSON.stringify(data.request.body, null, '') + ', ' + data.method + ', ' + data.uri + ', ...');
            //            const userId = _.hasIn(data.request, 'user.id') ? req.user.id : 'unknown'
            //            getProfile(userId, cb)
            (0, _auth.postRegistration)(data.request.body.username, data.request.body.password, cb);
        });

        // Add built-in monitoring service
        container.pdms.add({ topic: '/monitoring/isAlive', method: 'get', uri: '/monitoring/isAlive' }, function (data, cb) {
            container.logger.info('Monitoring handler called with ' + JSON.stringify(data.request, null, '') + ', ' + data.method + ', ' + data.uri + ', ...');
            (0, _monitoring.getMonitoringIsAlive)(data.request, cb);
        });
    }

    var endpointMap = getEndpointMap(container);
    container.logger.info('restapi.set/endpointMap ' + JSON.stringify(_lodash2.default.map(endpointMap, function (ep) {
        return [ep.method, ep.uri];
    }), null, ''));
    _lodash2.default.map(endpointMap, function (endpoint) {
        server[endpoint.method](endpoint.jsfUri, /*authGuard,*/mkHandlerFun(endpoint, container));
    });
};

module.exports = {
    set: set
};