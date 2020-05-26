const config = require("../config/database");
const rest = require("restler");

/**
 * mobile money request helper using hubtel
 * a helper to pass in your [header] keys for momo promt
 * i also have a nodejs package for using hubtel momo api.
 * u can clone it here
 * https://github.com/BigBobLittle/hubtelmomo and another one
 * for epay as well
 * https://github.com/BigBobLittle/epayMomo
 */

//TODO SET THE CALLBACK URL HERE, IF NOT ERROR
module.exports.hubtelConfig = {
  apiKey: config.hubtelMomo.apiKey,
  apiSecret: config.hubtelMomo.apiSecret,
  PrimaryCallbackUrl: "set your callback url,",
  FeesOnCustomer: false, //i've set to false
  merchantNumber: config.hubtelMomo.accountNumber,
  description: "Description of request", //not required
  ClientReference: "", //i've used a package by name shortid to auto generate reference, u can override it here
};

/**
 * below is an sms helper using hubtel
 * pass in ur api keys and viola
 */

module.exports.SendMessage = (
  msg = "Hi, this is your verification code for your app name",
  to,
  companyName = "Your-company-here"
) => {
  rest
    .get(
      `https://api.smsgh.com/v3/messages/send?From=${companyName}&To=${to}&Content=${msg}&ClientId=${yourID}&ClientSecret=${yourSecret}&RegisteredDelivery=false`
    )
    .on("complete", function (result) {
      if (result instanceof Error) {
        console.log("Error:", result.message);
        this.retry(100); // try again after 5 sec
      }
    });
};
