## Components
Component is special `ifnode` application item. Instead of `extension`, component know about models and can use them.

Can be settings by `ifnode` config.

### Example
Create `thumbnail-generator` component with configured image options.

Creating config file with component options:

```javascript
// config/local.js    
module.exports = {
    components: {
        thumbnailer: {
            width: 120,
            height: 100
        }
    }
};
```

Creating thumbnailer component:

```javascript
// components/thumbnailer.js    
var app = require('ifnode')(),
    thumbnailer = app.Component({
        name: 'thumbnailer'
    });

thumbnailer.generate = function(url, callback) {
    make_thumbnail(url, {
        width: this.width,
        height: this.height
    }, callback);
};
```

Application file:

```javascript
// app.js    
var ifnode = require('ifnode'),
    app = ifnode({
        env: 'local'
    });

// load all components and initialize them
app.load();
app.thumbnailer.generate('https://google.com', function(thumbnailer_path) {
    // do something
});
```