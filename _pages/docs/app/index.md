## Application items

### `ifnode` build items hierarchy

Like was **[said before](/docs/intro/ideology)**, `ifnode` contains four build items:
* **[extensions](/docs/app/extensions)**
* **[models](/docs/app/models)**
* **[components](/docs/app/components)**
* **[controllers](/docs/app/controllers)**

Each item have specific role for building `ifnode` application. Simple hierarchy of each application elements:

![Application items hierarchy](https://github.com/ilfroloff/ilfroloff.github.io/blob/master/hierarchy.png?raw=true)

Like presented in picture, each item have specified and direct role in `ifnode` application. Let's check each part closer.

### node_modules

`node_modules` is a fundamental part of each application. `npm` have a large amount of great and not modules

### extensions (Helpers Layer)

Frequently developing application requires some specified module which cannot find in `npm`. Extensions are the internal application modules. It can be helper's functions, internal logging system, etc. `ifnode`'s extension can to extend some `npm` module and to increase possibilities.

Also extensions using in `ifnode`'s **[plugins system](/docs/app/plugins)**, because each `ifnode`'s plugin is extension (or `npm` module) in general.

Notes:
* extension can accessed other extension

_P.S. One of "native" `npm` variant of creating own modules describes **[here](https://blog.risingstack.com/nodejs-at-scale-npm-best-practices/#9developingpackages)**._

### models (Data Access Layer)

Most problems requires processing data. Data can be from database or by services, and application must have access point to get or change this data. `ifnode`'s models part is it.
Each model build on `schema` - point to get and work with data. Each `schema` is `npm` module or extension, because `schema` cannot be related of developing application. Frequently `schema` is a middleware between `ifnode`'s models system and external data access library (for example, **[ifnode-mongoose](https://www.npmjs.com/package/ifnode-mongoose)**).

Notes:
* model cannot accessed other model

### components (Business Layer)

Business Layer resolves two problems:

1. How application must work with models data
2. How one part of application must to influence to other part

In general, component has access to such models and relates those models to one functionality part. Also, component can be used for creating independent module from other application parts, but dependent of current application environment configuration.

Example of component usage: developer wants to create component which generate excel file from some database's table data - it must be implemented in `ifnode` components application part.

Notes:
* component can accessed other component

### controllers (Requests Layer)

Controllers system of `ifnode` build on `express` `npm` module and extends it possibilities. Each controller is a independent route point with specified behavior. Behavior describes by plugins. For example you want to add possibility to prevent access to some IP's.
Controller inherits `express.Router` and have most of `Router` class methods.