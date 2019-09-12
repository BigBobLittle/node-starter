const config = require('../config/database');
const rest = require('restler');
   

module.exports.SendVerificationMessage = (msg = 'Hi, this is your verification code for PocaWallet', to, companyName = 'PocaWallet') => {
    rest.get(`https://api.smsgh.com/v3/messages/send?From=${companyName}&To=${to}&Content=${msg}&ClientId=hyqxxxit&ClientSecret=lguizyco&RegisteredDelivery=false`).on('complete', function(result) {
       if (result instanceof Error) {
           console.log('Error:', result.message);
           this.retry(100); // try again after 5 sec
       }
    });

}

//TODO SET THE CALLBACK URL HERE, IF NOT ERROR
module.exports.hubtelConfig = {
    apiKey: config.hubtelMomo.apiKey,
    apiSecret: config.hubtelMomo.apiSecret,
    PrimaryCallbackUrl: "set your callback url,",
    FeesOnCustomer: false , //i've set to false
    merchantNumber: config.hubtelMomo.accountNumber,
    description: "Description of request", //not required
   ClientReference: "" //i've used a package by name shortid to auto generate reference, u can override it here
  }