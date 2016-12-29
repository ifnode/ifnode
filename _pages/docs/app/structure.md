# Application structure

`ifnode` propose next application structure:

    application_name/
    |-- assets/
    |-- config/
    |   |   ...
    |   `-- local.js
    |
    |-- node_modules/
    |   |   ...
    |   `-- ifnode/
    |
    |-- protected/
    |   |-- components/
    |   |-- controllers/
    |       |   ...
    |       `-- ~.js
    |   |-- extensions/
    |   |-- models/
    |   `-- views/
    |       |   ...
    |       `-- index
    |
    |-- public/
    |
    `-- app.js

`ifnode` require only `protected/` folder with library files.

Below read more about main components.