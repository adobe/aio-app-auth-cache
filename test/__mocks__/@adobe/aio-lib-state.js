const crypto = require('../../../src/action/crypto')
const mycrypto = new crypto();

module.exports = {
    init: async () => {
        //new Promise((resolve, reject) => {
            return {
                get: async (key) => {return key=="profileID:adobe" ? {value:{ "profileID": "profileID",
                "provider": "adobe",
                "accessToken": mycrypto.encryptString("profileID", "at"),
                "refreshToken": mycrypto.encryptString("profileID", "rt")
            }} : ""},
                put: async (key) => {return key},
                delete: async (key) => {return key}
            }
        //})
    }
}