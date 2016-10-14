/**
 * @typedef {Object} IFSiteConnectionOptions
 *
 * @property {string}   [host=localhost]
 * @property {number}   [port=8080]
 * @property {boolean}  [ssl=false]
 */

/**
 * @typedef {Object} IFSiteSSLOptions
 *
 * @property {string}   [ssl.key]       Full or relative (at project_folder) path to key.pem  (just path, not need read as file)
 * @property {string}   [ssl.cert]      Full or relative (at project_folder) path to cert.pem (just path, not need read as file)
 * @property {string}   [ssl.pfx]       Full or relative (at project_folder) path to pfx.pem  (just path, not need read as file)
 */

/**
 * @callback IFSiteURLMethod
 *
 * @param {string}  pathname
 */

/**
 * @typedef {Object} IFSiteConfig
 *
 * @property {string}                   connection      Connection builder
 * @property {IFSiteSSLOptions}         ssl             SSL support (check https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener)
 * @property {IFSiteConnectionOptions}  local           Local url (use for start server)
 * @property {IFSiteConnectionOptions}  global          Global url ("nice" domain of site)
 *
 * @property {string}                   origin          Equal to: http(s)://${host}[:${port}] (if set site.ssl - https, other - http)
 * @property {IFSiteURLMethod}          url             Method for generate link
 */



/**
 * JSON object with all application options. Can contain any options (same of options parse by ifnode)
 * Path to config's folder - ${project_folder}/config
 *
 * @typedef {Object} IFConfig
 *
 * @property {string}       environment     Environment name
 * @property {IFSiteConfig} site            Description of site url
 * @property {Object}       application     Application specified options
 * @property {Object}       db              Data Access settings
 */
