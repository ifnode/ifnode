## Extensions
When application requires special and independent from system module it is Extension. Extensions are similar to `npm` module. Extension's load have [same rules of initializing](https://nodejs.org/api/modules.html#modules_all_together) and usage as `npm` modules.

Extension loads by application's instance method `app.extension` (or alias `app.ext`)

### Example

Simple extension file:

```javascript
// extensions/error/index.js
module.exports.err = require('./err');
module.exports.throw = require('./throw');

// extensions/error/throw.js
var err = require('./err');

module.exports = function(error_message) {
    throw err(error_message);
};
// extensions/error/err.js
module.exports = function(error_message) {
    return new Error(error_message);
};

```
    
Application file:

```javascript
// app.js    
var ifnode = require('ifnode'),
    app = ifnode();

app.ext('error-throw').throw('boom') // throw error boom
app.ext('error-throw/err')('boom') // returns Error instance boom
```