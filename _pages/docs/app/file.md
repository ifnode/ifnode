## app.js

The simplest web-server:

```javascript
var ifnode = require('ifnode'),
    app = ifnode();

app.run();
```

`app.js` is main file for create new application for `ifnode`. Here creates application instance.

Example of creating application with options:

```javascript
var ifnode = require('ifnode'),
    app = ifnode({
        project_folder: __dirname,
        env: 'local'
    });

app.run();
```

*Note: Options for ifnode can find [here](/docs/api/ifnode)*