"use strict";

const config = require("../../server/clientHost");
const app = require("../../server/server.js");
const debug = require("debug")("user.js");
const ejs = require("ejs");
const fs = require("fs");

module.exports = function (Client) {
  let Role, RoleMapping, Notifications;

  Client.observe("after save", async (ctx, next) => {
    try {
      Role = app.models.Role;
      RoleMapping = app.models.RoleMapping;
      Client.findById(ctx.instance.id, (err, client) => {
        if (client && !client.createdAt) {
          client.updateAttributes(
            { createdAt: new Date().toString() },
            () => {}
          );
        }
      });
      const role = await Role.find({ where: { name: ctx.instance.userType } });
      const roleMapArr = await RoleMapping.find({
        where: {
          principalId: ctx.instance.id,
        },
      });
      if (role[0]) {
        debug("<<<<<<<<Role exists: ", role);
        let roleMapping = await RoleMapping.create({
          principalType: "USER",
          principalId: ctx.instance.id,
          roleId: role[0].id,
        });

        debug(
          `Client assigned ${ctx.instance.userType} role (RoleID: ${role[0].id})`
        );
        return Promise.resolve(roleMapArr);
      } else {
        const userRole = await Role.create({
          name: ctx.instance.userType,
        });

        debug("Agent role", userRole);
        const agent = await userRole.principals.create({
          principalType: RoleMapping.USER,
          principalId: ctx.instance.id,
        });

        debug("Created principal for new user:", agent);

        debug(">>>>>>> Role do not exists. Response: ", roleMapArr);
        return Promise.resolve(roleMapArr);
      }
      next();
    } catch (error) {
      debug("<<<<<<Error", error);
      return Promise.reject(error);
    }
  });

  // send password reset link when requested
  Client.on("resetPasswordRequest", function (info) {
    console.log("----------info in reset", info);

    Notifications = app.models.Notifications;
    const url = "http://" + config.host + ":" + config.port + "/reset-password";

    Notifications.create(
      {
        userId: "5e40718211418d1e7c536a4d",
        message: "Your password has been changed",
        date: new Date(),
        read: false,
      },
      (err, resp) => {
        if (err) {
          console.log("----------error happened on server on notification");
        }
        console.log("-------resp on notifications---", resp);
      }
    );
    /*eslint-disable */
    const template = fs.readFileSync(
      "./server/views/ressetEmailTemplate.ejs",
      "utf8"
    );

    const html = ejs.render(template, {
      info: info,
      url: url,
    });

    /*eslint-enable */
    Client.app.models.Email.send(
      {
        to: info.email,
        subject: "Password reset",
        html,
      },
      function (err) {
        if (err) return debug("> error sending password reset email", err);
        debug("> sending password reset email to:", info.email);
      }
    );
  });

  Client.on("changeWinProb", function (info) {
    console.log("----------changeWinProb", info);
    return { resp: "success" };
  });
};
