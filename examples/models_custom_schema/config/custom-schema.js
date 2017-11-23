module.exports = {
    db: {
        first_database: {
            schema: 'custom-schema',
            correct_this_test: function correct_this_test() {},
            config: function config() {
                return this.correct_this_test();
            },
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
