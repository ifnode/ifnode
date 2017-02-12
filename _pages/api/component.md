# Component

## Description

Component is a core class and a specific part of framework. Components system of ifnode directly use classes inherited from Component or instances of those classes. This classes are Singletons and will be automatically instancionate from child Component class (it can be single or more deeper inherited class). Each Component constructor will be injected by specific options (in general it name and configuration).

Instance of component will be created after invoke one of methods - app.load or app.component. 

## Definition

### JSDoc syntax

```javascript
/**
 * @typedef {Object} ComponentOptions
 * 
 * @property {string}                   [name]
 * @property {string|Array.<string>}    [alias]
 * @property {Object}                   [config]
 */

/**
 * @class Component
 *
 * @param {ComponentOptions}    [options]
 */
```

### TypeScript syntax

```typescript
interface ComponentOptions {
    name?: string,
    alias?: string|Array<string>,
    config?: Object
}

interface Component {
    id: string,
    name: string,
    alias: Array<string>,
    config: Object,
    new (options?: ComponentOptions)
}
```

## Component#constructor( [options] )

### Arguments

| Name | Type | Description |
| ---- | ---- | ----------- |
| `options` | **[`ComponentOptions`](https://github.com/ifnode/ifnode/blob/master/core/Component.js#L10)** | Options definition for component. Includes name of component, name aliases (can be `string` alias or array of `string` names) and specified configuration options |

## Instance properties

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| <code id="component-id">id</code> | `string` | [UUID v4](https://github.com/kelektiv/node-uuid#uuidv4options--buffer--offset) | Unique value for each `Component` instance |
| <code id="component-name">name</code> | `string` | Name of class | Component's "human" name. This name will used by framework when component will be attached to `Application` instance (read more about components initializing **[here](/docs/app/components)**) |
| <code id="component-alias">alias</code> | `Array` | `[]` | Component's name aliases. Those aliases will used by framework when component will be attached to `Application` instance (read more about components initializing **[here](/docs/app/components)**) |
| <code id="component-config">config</code> | `Object` | `{}` | Specified configuration options for component |

## Examples

Creating of a simple component class:

1. Component inherited class:

    * ES5:
    
    ```javascript
    var Util = require('util');
    var Component = require('ifnode/core/Component');
    
    function MyComponent(options) {
        Component.call(this, options);
    }
    
    Util.inherits(MyComponent, Component);
    
    MyComponent.prototype.plain = function() {
        return 'MyComponent#plain';
    };
    
    module.exports = MyComponent;
    ```
    
    * ES6:
    
    ```javascript
    const Util = require('util');
    const Component = require('ifnode/core/Component');
    
    class MyComponent extends Component {
        constructor(options) {
            super(options);
        }
        
        plain() {
            return 'MyComponent#plain';
        }
    }
    
    module.exports = MyComponent;
    ```

2. Double inheriting from `Component`:

    * ES5:
    
    ```javascript
    var Util = require('util');
    var Component = require('ifnode/core/Component');
    
    function First(options) {
        Component.call(this, options);
    }
    Util.inherits(First, Component);
    
    First.prototype.plain = function() {
        return 'Base#plain';
    };
    
    function Second(options) {
        First.call(this, options);
    }
    Util.inherits(Second, First);
    
    Second.prototype.plain = function() {
        return First.prototype.plain.call(this) + ', Second#plain';
    };
    
    module.exports = Second;
    ```
    
    * ES6:
    
    ```javascript
    const Util = require('util');
    const Component = require('ifnode/core/Component');
    
    class First extends Component {
        constructor(options) {
            super(options);
        }
        
        plain() {
            return 'Base#plain';
        }
    }
    
    class Second extends First {
        constructor(options) {
            super(options);
        }
        
        plain() {
            return `${super.plain()}, Second#plain`;
        }
    }
    
    module.exports = Second;
    ```
