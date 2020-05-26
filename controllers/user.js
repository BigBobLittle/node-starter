// THIS FILE WILL HANDLE ALL INFO ABT INDIVIDUAL USER ACCOUNTS
const User = require("../model/user");
const skipTryCatch = require("@bigboblittle/skiptrycatch").skipTryCatch;
const webpush = require("web-push");

/***
 * @name userProfile
 * @description GET USER PROFILE INFO
 */
exports.userProfile = skipTryCatch(async (req, res) => {
  let user = await User.findById(req.decode.id);
  if (!user) {
    res.json({
      success: false,
      statusCode: "USER-NOT-FOUND",
      response: `User not found`,
    });
  } else {
    res.json({ success: true, statusCode: "USER-INFO", response: user });
  }
});

exports.sendWebPushNotifications = skipTryCatch(async (req, res) => {
  const vapidKeys = {
    publicKey: "YOUR KEY HERE",
    privateKey: "PRIVATE KEY HERE",
  };

  webpush.setVapidDetails(
    "mailto:example@yourdomain.org",
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );

  const notificationPayload = {
    notification: {
      title: "Angular News",
      body: "Newsletter Available!",
      icon: "assets/favicon.ico",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1,
      },
      actions: [
        {
          action: "explore",
          title: "Go to the site",
        },
      ],
    },
  };

  const sub = {
    endpoint:
      "https://fcm.googleapis.com/fcm/send/ftmqlAJzJwo:APA91bEeolfcm9be6IqDeWarTuyFaWXJgblYDSVGMIMMKbfqfE78nfxF0hIbuy1xKEiMiHjZTCs5VNDXg_fbKHt8iqY7LEJW5jNWXFnM5UaG585SF1xlQTqa1JFvbe3-abtBWopzC4j1",
    expirationTime: null,
    keys: {
      p256dh: "",
      auth: "",
    },
  };
  const send = await webpush.sendNotification(
    sub,
    JSON.stringify(notificationPayload)
  );

  res.json(send);
});
