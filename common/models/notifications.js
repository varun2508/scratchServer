"use strict";

module.exports = function(Notifications) {
  Notifications.getNotificationsForUser = function(data, cb) {
    const { id } = data;
    console.log("----------data", data);
    Notifications.find({ where: { userId: id } }, function(err, notifications) {
      if (err) throw err;
      cb(null, notifications);
    });
  };
  Notifications.remoteMethod("getNotificationsForUser", {
    http: { path: "/getNotificationsForUser", verb: "post" },
    accepts: { arg: "data", type: "object", http: { source: "body" } },
    returns: { arg: "data", type: "array" }
  });

  Notifications.setNotificationAsRead = async body => {
    const { userId, id, data } = body;
    try {
      await Notifications.updateAll({ id: id }, data);

      return await Notifications.find({ where: { userId: userId } });
    } catch (error) {
      console.log("--------error in set as read in cath--");
      throw new Error(error);
    }
  };
  Notifications.remoteMethod("setNotificationAsRead", {
    http: { path: "/setNotificationAsRead", verb: "post" },
    accepts: { arg: "data", type: "object", http: { source: "body" } },
    returns: { arg: "data", type: "array" }
  });
};
