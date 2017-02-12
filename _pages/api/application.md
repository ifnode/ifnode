# Application

## Description

`Application` is "private" (must not be directly used) maintain core class for 

Instance of `ifnode` module:

```javascript
const IFNode = require('ifnode');
const app = IFNode(options);
```

## Definition

### TypeScript syntax

```typescript
interface ApplicationOptions {
    alias?: string,
    project_folder?: string,
    projectFolder?: string,
    environment?: string,
    env?: string
}

interface Application {
    id: string,
    alias: string,
    project_folder: string,
    projectFolder: string,
    backend_folder: string,
    backendFolder: string,
    config: Object,
    listener: Express,
    connection: IConnectionServer,
    server: http.Server,
    components: Object|null,
    models: Object|null,
    controllers: Object|null,
    new (options?: ApplicationOptions),
    require(id: string),
    register(module: string|Extension|Array<string|Extension>),
    extension(id: string),
    ext(id: string),
    load(),
    run(callback?: Function),
    down(callback?: Function),
    Model(model_options: Object, db_options?: Object),
    Component(options?: Object),
    Controller(options?: Object)
}
```

## Application#constructor( [options] )

### Arguments

| Name | Type | Description |
| ---- | ---- | ----------- |
| options | [`ApplicationOptions`](https://github.com/ifnode/ifnode/blob/master/core/Application.T.js#L2) | Options definition for application. Below `ApplicationOptions` are described more detailed

#### options

| Name | Type | Description |
| ---- | ---- | ----------- |
| alias | `string` | Set alias name of application |
| project_folder | `string` | Full path to application's root folder |
| projectFolder | `string` | Alias of `project_folder`
| environment | `string` | Name of application config (folder `${project_folder}/config`) |
| env | `string` | Alias of `environment`

___Note: all options are optional___

## Instance properties

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| <code id="application-id">id</code> | `string` | [UUID v4](https://github.com/kelektiv/node-uuid#uuidv4options--buffer--offset) | Unique value for each `Application` instance |
| <code id="application-alias">alias</code> | `string` | Same as `id` | "Pretty" application name. It useful for multiplied `ifnode` application. Alias can be used for getting application by `ifnode` function |
| <code id="application-project_folder">project_folder</code> | `string` | `process.argv[1]` | Full path to application's root folder. Paths to maintain `ifnode` application items build from it |
| `projectFolder` | `string` | `process.argv[1]` | Alias of `project_folder` |
| <code id="application-backend_folder">backend_folder</code> | `string` | `${project_folder}/protected` | Full path to application backend folder (folder with all components) |
| `backendFolder` | `string` | `${project_folder}/protected` | Alias of `backend_folder` |
| <code id="application-config">config</code> | `Object` | [Default configuration](https://github.com/ifnode/ifnode/blob/master/core/ConfigurationBuilder.js#L189) | Application's configuration options. Contain predefined and special sections. More detailed described __[here](/docs/app/config)__ |
| <code id="application-listener">listener</code> | `Express` | Instance of `Express` | Listener is a handler of all external connections |
| <code id="application-connection">connection</code> | `IConnectionServer` | `http` server | Connection server (implements [`IConnectionServer`](/docs/api/iconnectionserver) interface) |
| _<code id="application-server">server</code> <sup>deprecated</sup>_ | [`http.Server`](https://nodejs.org/api/http.html#http_class_http_server) | Instance of server | Instance of connection server. It can be `http`, `https` and returned by implemented [`IConnectionServer`](/docs/api/iconnectionserver) interface's class |
| <code id="application-components">components</code> | `Object`, `null` | `null` | Hash of application components. Contains all application components |
| <code id="application-models">models</code> | `Object`, `null` | `null` | Hash of application models. Contains all application models |
| <code id="application-controllers">controllers</code> | `Object`, `null` | `null` | Hash of application controllers. Contains all application controllers |

## Instance methods

### Application#require( [id] )

| Name | Type | Description |
| ---- | ---- | ----------- |
| `id` | `string` | Have same behavior like node.js `require`. Path to required module builds by native `path` module using method `resolve`. First argument of `path.resolve` is an `app.project_folder`, second is the `id` argument |

### Application#register( [module] )

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
            <td id="options" rowspan="3">`module`</td>
            <td>`string`</td>
            <td>
                Attach modules for `ifnode` application. Module must be added to `/node_modules` folder or extensions (own application independent modules). Example: `ifnode-auth`, `ifnode-mongoose`, etc
            </td>
        </tr>
        <tr>
            <td>[`Extension`](https://github.com/ifnode/ifnode/blob/master/core/application/Extension.js)</td>
            <td></td>
        </tr>
        <tr>
            <td>`Array<string|Extension>`</td>
            <td>Returns first created `Application` instance by `IFNode` invoke or creates and returns new instance</td>
        </tr>
    </tbody>
</table>

#### Examples

```javascript
const ifnode = require('ifnode');
const app = ifnode();

app.register('ifnode-auth');
```

### Application#extension( id )

| Name | Type | Description |
| ---- | ---- | ----------- |
| `id` | `string` | Get application's extension by name. More information about `extensions` [here](/docs/app/extensions) |

___Aliases:___
* _`app.ext` <sup>deprecated</sup>_

### Application#load( )

Read and initialize all application items - models, components and controllers. Can be invoked only once and next invokes do nothing

### Application#component( id )

There is special method for reading and initializing component. `app.component` takes path to the component's module, `require`s it and
initializes by special rules: `Component` extended classes will be instanceonate, simple classes or primitives
will be exported as it is.

You can read more about working with components **[here](/docs/app/components)**.

`id` argument can be presented by two main ways of usage:

1. Path on `ifnode` components folder. For example, `app.component('MyComponent')` means that component will be exported
from components folder.
2. Direct path of some place (path rules are same as on `require` function). For example, `app.component('./MyComponent')` means that component will be exported
from current folder and file will have name `'MyComponent.js'`.

| Name | Type | Description |
| ---- | ---- | ----------- |
| `id` | `string` | Path to the required component |

### Application#run( [callback] )

| Name | Type | Description |
| ---- | ---- | ----------- |
| `callback` | `Function` | Invokes `app.load` method and starts connection server |

___Note: deprecated and will be removed from 2.0 version___

### Application#down( [callback] )

| Name | Type | Description |
| ---- | ---- | ----------- |
| `callback` | `Function` | Stop application server |

___Note: deprecated and will be removed from 2.0 version___

### Application#Model( model_options [, db_options] )

Returns instance of `Model`. Please, read related API section about `Model` __[here](/api/model)__

### Application#Component( [options] )

Returns instance of `Component`. Please, read related API section about `Component` __[here](/api/component)__. Also dive into __[components guide](/docs/app/components)__ from `ifnode` documentation

___Note: `app.Component` is deprecated. Need to use `Component` class directly___

### Application#Controller( [options] )

Returns instance of `Controller`. Please, read related API section about `Controller` __[here](/api/controller)__
