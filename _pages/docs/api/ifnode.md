## ifnode

### Description

Returns instance of `ifnode` by `options`:

```javascript
[class Application] ifnode([Object options])
```

### Parameters

Option | Type | Description | Optional | Default
:------ | :---- | :----------- | :------- | :-------
<a name="alias">**alias**</a> | String | "Nice" name of application | true | Equal to `id`
**project_folder** | String | Full path to application root project folder | true | Equal to `process.argv[1]`
<a name="environment">**environment**</a> | String | Name of application config (folder ${project_folder}/config) | true | -
**[projectFolder](#alias)** | | Alias of option `.project_folder`
**[env](#environment)** | | Alias of option `.environment`

### Example

```javascript
var app = ifnode({
    project_folder: __dirname,
    alias: 'application',
    env: 'dev'
});
```