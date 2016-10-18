## Component plugin
Possibility to create own component plugin to `ifnode`. Below example of simple component:

Component module:

```javascript
// extensions/thumbnail-generator.js    
module.exports.component = function(app, Component) {
    var thumbnailer = Component({
        name: 'thumbnailer'
    });

    thumbnailer.initialize = function(config) {
    };

    thumbnailer.generate = function() {
        // generate thumbnail
    };
};
```

Application `app.js` file:

```javascript
// app.js
var ifnode = require('ifnode'),
    app = ifnode();

app.register('thumbnail-generator');
app.thumbnailer.generate();
```

## Real examples
* **[ifnode-auth](https://github.com/ifnode/auth)**