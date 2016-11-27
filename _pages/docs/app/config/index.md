## Config

Config is `js` or `json` object with all application options. Can contain any and same of options specialized for `ifnode`.

Path to config's folder `${project_folder}/config`

### Specialized ifnode options

#### site

Option | Type | Description | Default
:------ | :----- | :----------- | :-------
`site` | Object | Description of site url | -
`site.local` | Object | Local url (use for start server) | `{ host: 'localhost', port: 8080 }`
`site.local.host` | String &#10072; Undefined | Host for creating server | `'localhost'`
`site.local.port` | Number &#10072; Undefined | Port for creating server | `8080`
`site.global` | Object | Global url ("nice" domain of site) | `{ host: 'localhost' }`
`site.global.host` | String &#10072; Undefined | Host of "nice" domain | `'localhost'`
`site.global.port` | Number &#10072; Undefined | Port of "nice" domain | `undefined`
`site.ssl` | Object &#10072; Undefined | SSL support. Check [here](https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener) | `undefined`
`site.ssl.key` | String &#10072; Undefined | Full or relative (at `${project_folder}`) path to `key.pem`  (just path, not need read as file) | `undefined`
`site.ssl.cert` | String &#10072; Undefined | Full or relative (at `${project_folder}`) path to `cert.pem` (just path, not need read as file) | `undefined`
`site.ssl.pfx` | String &#10072; Undefined | Full or relative (at `${project_folder}`) path to `pfx.pem` (just path, not need read as file) | `undefined`

##### Note

`ifnode` generate special `app.config.site` options: .site with options:

Option | Description
:----- | :----------
.origin | Equal to: `http(s)://${host}[:${port}]` (if set `site.ssl` - `https`, other - `http`)
.url(String pathname) | Method for generate link

Example (`coffeescript`):

```coffeescript
# config/dev.js
site:
    local:
        port: 1010
global:
    host: 'nicedomainname.io'
ssl:
    key: 'ssl/key.pem'
    cert: 'ssl/cert.pem'

# app.js
app = ifnode( env: 'dev' )
site = app.config.site;

site.local.origin # https://localhost:1010
site.local.url '/u/1' # https://localhost:1010/u/1
site.global.origin # https://nicedomainname.io
site.global.url 'u/1' # https://nicedomainname.io/u/1
```

Raw:
```coffeescript
site:                  # Description of site url
    local:             # Local url (use for start server)
        host:          # [optional] By default: localhost
        port:          # [optional] By default: 8080
    global:            # Global url ("nice" domain of site)
        host:          # [optional] By default: localhost
        port:          # [optional] By default: null
    ssl:               # SSL support. Check here - https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener
        key:           # Full or relative (at project_folder) path to key.pem  (just path, not need read as file)
        cert:          # Full or relative (at project_folder) path to cert.pem (just path, not need read as file)
        pfx:           # Full or relative (at project_folder) path to pfx.pem  (just path, not need read as file)

###
Note: ifnode generate config option .site with options:
    .origin                   Equal to: http(s)://${host}[:${port}] (if set site.ssl - https, other - http)
    .url(pathname: String)    Method for generate link
###
```
#### application

Option | Type | Description | Default
:------ | :----- | :----------- | :-------
`application` | Object | Application and `express()` settings | -
`application.environment` | Name of environment | Name of config file (if config by file) or `'local'`
`application.express` | Object | Hash of express application settings. List [here](https://expressjs.com/4x/api.html#app.set) | Predefined options check below
`application.express.env` | String | `env` option | Same as `application.environment`
`application.express['view engine']` | String | Template | `'jade'`
`application.express.views` | String | Path to application views | `${backend_folder}/views`
`application.express['x-powered-by']` | Boolean | Add to response header `express.js` mark | `false` (sorry, `express.js` :) )
`folders` | Object | Hash of pathes to application components | Check below
`folders.extensions` | String | Folder of extensions | `${backend_folder}/extensions`
`folders.components` | String | Folder of components | `${backend_folder}/components`
`folders.views` | String | Folder of views | `${backend_folder}/views`
`folders.controllers` | String | Folder of controllers | `${backend_folder}/controllers`
`folders.models` | String | Folder of models | `${backend_folder}/models`

Raw:
```coffeescript
application:                # Application (and express()) settings
    environment:            # Name of environment. By default: name of config file (if config by file) or "local"
    express:                # Hash of express application settings (list: https://expressjs.com/4x/api.html#app.set)
        env:                # By default: name of config file (if config by file) or "local"
        "view engine":      # By default: jade
        views:              # By default: ${backend_folder}/views
        "x-powered-by"      # By default: false (sorry, express :) )
    folders:
        extensions:         # Folder of extensions.  By default: ${backend_folder}/extensions
        components:         # Folder of components.  By default: ${backend_folder}/components
        views:              # Folder of views.       By default: ${backend_folder}/views
        controllers:        # Folder of controllers. By default: ${backend_folder}/controllers
        models:             # Folder of models.      By default: ${backend_folder}/models
```
#### middleware

Option | Type | Description
:------ | :----- | :-----------
`middleware` | Object | Definition of middleware modules external (examples: `connect-multiparty`, `cookie-parser`, etc) or own

More information about `ifnode` middleware read [here](/docs/app/config/middleware).

Below specialized `ifnode` middleware:

###### middleware.body:

Option | Type | Description
:------ | :----- | :-----------
`middleware.body` | Object | Build on `body-parser` node module
`middleware.body[${parser}]` | Object | `${parser}` - name of parser, `options` - hash of `${parser}` options. Check [here](https://github.com/expressjs/body-parser)

Example:

```javascript
{
    'body': {
        'text': {},
        'urlencoded': {
            extended: true
        },
        'json': {
            limit: '500kb'
        }
    }
}
```

###### middleware.statics:

Option | Type | Description
:------ | :----- | :-----------
`middleware.statics` | Object | Build on `serve-statics` node module. Has three variant of initialize static files
`middleware.statics[options]` | String &#10072; Object &#10072; Array | Check options [here](https://github.com/expressjs/serve-static)

Raw:
```coffeescript
middleware:                            # External middleware modules (examples: connect-multiparty, cookie-parser etc)
###
    ifnode middlewares:
        body:                          # Build on body-parser module
            '${parser}': options        ${parser} - name of parser, options - hash of parser options. See here: https://github.com/expressjs/body-parser
        statics:                       # Build on serve-statics module. Tree variant of initialize static files
            path: String                Options see here: https://github.com/expressjs/serve-static
            variants: Object
                path1: options,
                path2: options,
                ...
            variant: Array
                path,
                path1,
                { path2: options },
                ...
###
```

#### db

Raw:
```coffeescript
db:                                     # Initialize options of databases (models schemas)
    name_of_db:                         # Name of database connect
        schema: # name of schema #      # Schema name (for choose of schema)
        config: # schema config #       # Config of database connection
```

#### components

Raw:
```coffeescript
components:                             # Initialize options for components of ifnode
    name_of_component: # options #
```