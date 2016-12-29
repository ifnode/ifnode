# app.Component

Returns components instance:

```javascript
app.Component([Object options])
```

Special module for application. Initialize after `models` and can used by them.

## Parameters

Option | Type | Description | Optional | Default
------ | ---- | ----------- | -------- | -------
.name | String | Name of controller | true | id

## Methods

Option | Description
------ | -----------
.initialize(Object config) | Function to initialize component (get config from `config.components.name`)

## Examples

Check creating of component [here](/docs/app/components).