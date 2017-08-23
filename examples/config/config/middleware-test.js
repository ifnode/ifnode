module.exports = {
    application: {
        middleware: {
            'body': {
                'json': {
                }
            },
            'statics': [
                'some/path',
                {
                    'some/path': {}
                }
            ],
            'mock-module1': {},
            'mock-module2': [],
            'mock-module3': {
                'parameter1': 'value1',
                'parameter2': 'value2'
            },
            'mock-module4': [
                'parameter1',
                'parameter2'
            ],
        }
    }
};
