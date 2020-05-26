module.exports = {
    mongoDbMemoryServerOptions: {
        instance:{
            dbName: 'jest-db',

        },
        binary:{
            version: '4.0.3',
            skipMD5: true
        },
        autoStart: false
    }
}