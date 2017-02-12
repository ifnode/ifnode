# PLUGIN_TYPES

## Description

File with constant names of plugins. It contains three types: `schema`, `component` and `controller`.

## Definition

### JSDoc syntax

```javascript
/**
 * 
 * @constant {Object} PLUGIN_TYPES
 */
{
    SCHEMA: 'schema',
    COMPONENT: 'component',
    CONTROLLER: 'controller'
}
```

### TypeScript syntax

```typescript
interface PLUGIN_TYPES {
    SCHEMA: 'schema',
    COMPONENT: 'component',
    CONTROLLER: 'controller'
}
```

### Constant properties

| Name | Value | Description |
| ---- | ----- | ----------- |
| <code id="schema">SCHEMA</code> | `"schema"` | Plugin type of models schemas. More about schema plugin you can find **[here](/docs/app/plugins/schema)** |
| <code id="component">COMPONENT</code> | `"component"` | Plugin type for external components. More about component plugin you can find **[here](/docs/app/plugins/component)** |
| <code id="controller">CONTROLLER</code> | `"controller"` | Plugin type for controllers extending possibilities. More about controller plugin and describing you can find **[here](/docs/app/plugins/controller)** |

## Examples

```javascript
const PLUGIN_TYPES = require('ifnode/core/PLUGIN_TYPES');

module.exports[PLUGIN_TYPES.SCHEMA] = function MyOwnSchema(app, MyOwnSchema) {
    // do smt
};
```
