'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _package = require('../../../../package.json');

var _package2 = _interopRequireDefault(_package);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultsBasePath = __dirname + '/defaults';

/**
 * The default configuration for the webServer
 *
 *  {
 *      app: {
 *          name: {String},             // The name of the generator tool
 *          version: {String}           // The version of the generator tool
 *      },
 *      configFileName: {String},       // The name of the config file '.rest-tool.yml',
 *      logLevel: {String},             // The log level: (info | warn | error | debug)
 */
module.exports = {
    webServer: {
        users: process.env.EASER_USERS || defaultsBasePath + '/users.yml',
        port: process.env.EASER_PORT || 3007,
        viewsPath: process.env.EASER_VIEWSPATH || defaultsBasePath + '/views',
        publicPagesPath: process.env.EASER_CONTENTPATH_PUBLIC || defaultsBasePath + '/content/public',
        privatePagesPath: process.env.EASER_CONTENTPATH_PRIVATE || defaultsBasePath + '/content/private'
    }
};