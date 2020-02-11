"use strict";

module.exports = function(Notifications) {
  Notifications.getNotificationsForUser = function(data, cb) {
    const { id } = data;

    Notifications.find({ where: { userId: id } }, function(err, notifications) {
      if (err) throw err;
      console.log("------notifications----", notifications);
      cb(null, notifications);
    });
  };
  Notifications.remoteMethod("getNotificationsForUser", {
    http: { path: "/getNotificationsForUser", verb: "post" },
    accepts: { arg: "data", type: "object", http: { source: "body" } },
    returns: { arg: "data", type: "array" }
  });

  Notifications.setNotificationAsRead = (body, cb) => {
    const { userId, id, data } = body;
    console.log("----------body", body);
    // Notifications.find({ where: { id } }, async (err, notifications) => {
    //   if (err) throw err;
    //   console.log(
    //     "------notifications in setNotificationAsRead----",
    //     notifications
    //   );
    //   // await Notifications.update(data)

    // });

    try {
      Notifications.updateAll({ id: id }, data, () => {
        Notifications.find({ where: { userId: userId } }, function(
          err,
          result
        ) {
          if (err) throw err;
          console.log("------notifications----", result);
          // return notifications;
          cb(null, result);
        });
      });

      console.log("------notifications2222----", notifications);
    } catch (error) {
      console.log("--------error in cath--");
      throw new Error(error);
    }
  };
  Notifications.remoteMethod("setNotificationAsRead", {
    http: { path: "/setNotificationAsRead", verb: "post" },
    accepts: { arg: "data", type: "object", http: { source: "body" } },
    returns: { arg: "data", type: "array" }
  });
};
