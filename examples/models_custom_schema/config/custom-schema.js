module.exports = {
    db: {
        first_database: {
            schema: 'custom-schema',
            default: true
        },
        second_database: {
            schema: 'virtual'
        },
        third_database: {
            schema: 'custom-schema-without-constructor'
        },
        fourth_database: {
            schema: 'custom-schema-with-empty-driver'
        }
    }
};
