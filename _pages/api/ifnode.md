# IFNode

## Description

`IFNode` is a factory method for creating instances of `Application` class.

Incoming argument presented like options for [`Application` constructor](/api/application#constructor), alias of created application instance or empty (first created by `IFNode` invoke) argument.

## Definition

### JSDoc syntax

```javascript
/**
 * @interface IFNode
 * @function
 * 
 * @param   {string|ApplicationOptions} [options]
 * @returns {Application}
 */
```

### TypeScript syntax

```typescript
interface IFNode {
    (options?: string|ApplicationOptions): Application
}
```

### Arguments

<table>
    <thead>
        <tr colspan="2">
            <th>Name</th>
            <th>Type</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td id="options" rowspan="3">`options`</td>
            <td>`ApplicationOptions`</td>
            <td>Creates and returns `Application` instance by options</td>
        </tr>
        <tr>
            <td>`string`</td>
            <td>Returns `Application` instance with `alias` option from `ApplicationOptions` or `undefined`</td>
        </tr>
        <tr>
            <td>`undefined`</td>
            <td>Returns first created `Application` instance by `IFNode` invoke or creates and returns new instance</td>
        </tr>
    </tbody>
</table>

### Returns

| Type | Description |
| ---- | ----------- |
| `Application` | `Application` instance |

## Example

### Create application with default config

#### app.js

```javascript
const Assert = require('assert');
const IFNode = require('ifnode');

const app1 = IFNode({
    project_folder: __dirname,
    alias: 'application'
});
const app2 = IFNode('application');
const app3 = IFNode();

Assert.equal(app1, app2);
Assert.equal(app2, app3);
```

### Create application with custom config

#### config/dev.js

```javascript
module.exports = {
    site: {
        local: {
            port: 3000
        }
    }
};
```

#### app.js

```javascript
const Assert = require('assert');
const IFNode = require('ifnode');
const app = IFNode({
    project_folder: __dirname,
    alias: 'application',
    environment: 'dev'
});

Assert.equal(app.config.environment, 'dev');
Assert.equal(app.config.site.local.origin, 'http://localhost:3000');
```