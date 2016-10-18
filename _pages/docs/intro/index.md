## Introduction

1. Create folder for you awesome application:

    macOS / Linux:
    ```bash
    mkdir awesome_application
    cd awesome_application
    ```
    
    Windows:
    
        To create folder manualy

2. Make `package.json` file:

    2.1 Type command:
    
    ```bash
    npm init
    ```

    2.2 Fill information about you awesome application:
    
        name: (awesome_application) Awesome Application!
        version: (1.0.0)
        description: My first Awesome Application using ifnode!
        entry point: (index.js) app.js
        test command: 
        git repository: 
        keywords: 
        author: 
        license: (ISC)

3. Install `ifnode`:

```bash
npm install ifnode --save
```

4. Create `app.js` file:

```javascript
var ifnode = require('ifnode'),
    awesome = ifnode({
        name: 'Awesome Application',
        alias: 'awesome'
    });

awesome.run(function() {
    console.log("I'm running! Check http://localhost:8080");
});
```

5. Go to [http://localhost:8080](http://localhost:8080) - and you see working application!

6. [Dive into](/docs/app) `ifnode` to know more possibilities