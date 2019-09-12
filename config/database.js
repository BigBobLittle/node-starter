const secret = require('crypto').randomBytes(256).toString('hex');
require('dotenv').config();
module.exports =  {
    database: process.env.database,
    secret: secret,
    onlineDatabase: process.env.onlineDatabase,
     
  hubtelSms: {
    "ClientId":process.env.hubtelSmsClientId,
    "ClientSecret": process.env.hubtelSmsClientSecret
},

hubtelMomo: {
  "accountNumber": process.env.hubtelMomoAccountNumber,
  "apiKey":  process.env.hubtelMomoApiKey,
  "apiSecret": process.env.hubtelMomoApiSecret
 
}

}