# Default config

This is default `ifnode` config:

```javascript
module.exports = {
    environment: 'local',
    site: {
        local: {
            host: 'localhost',
            port: 8080
        },
        global: {
            host: 'localhost',
            port: 8080
        }
    },

    application: {
        express: {
            'env': 'local',
            'view engine': 'jade',
            'x-powered-by': false
        },
        folders: {
            extensions:  '/path/to/project/protected/extensions/',
            components:  '/path/to/project/protected/components/',
            views:       '/path/to/project/protected/views/',
            controllers: '/path/to/project/protected/controllers/',
            models:      '/path/to/project/protected/models/'
        }
    },

    db: {
        virtual: {
            schema: 'virtual'
        }
    }
}
```

Properties can be extended or changed. Also can add own properties.

# Special properties

## site
Is special property where set application urls: `local` and `global`.
Both build to special object with property `origin` and method `url`. Example:

```javascript
// config/dev.js
site: {
    local: {
        port: 1010
    },
    global: {
        host: 'nicedomainname.io'
    },
    ssl: {
        key: 'ssl/key.pem',
            cert: 'ssl/cert.pem'
    }
}

// app.js
var app = ifnode({
        env: 'dev'
    }),
    site = app.config.site;

site.local.origin;      // https://localhost:1010
site.local.url('/u/1'); // https://localhost:1010/u/1
site.global.origin;     // https://nicedomainname.io
site.global.url('u/2'); // https://nicedomainname.io/u/2
```
    
## application
Application field contains settings for express.js core (list check **[here](https://expressjs.com/4x/api.html#app.set)**), path to application components folders and **[middleware](/docs/app/config/middleware)**.

## components
Any config has special property `components`, where set data for components. For example **[ifnode-auth](https://www.npmjs.com/package/ifnode-auth)**:

```javascript
{
    components: {
        auth: {
            userFieldId: 'email'
        }
    }
}
```