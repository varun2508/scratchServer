"use strict";

const debug = require("debug")("routes");
var getWeek = require("date-fns/getWeek");

module.exports = function(app) {
  const GeneralStats = app.models.GeneralStats;
  const Notifications = app.models.Notifications;

  const sendNotification = (userId, message) => {
    const notification = { userId, read: false, message, date: new Date() };
    Notifications.create(notification);
  };

  const prepareWeeklyTop = statisticData => {
    const WeeklyTop = app.models.WeeklyTop;
    const currentWeek = getWeek(new Date());
    WeeklyTop.find({}, (err, weeklyTop) => {
      if (+weeklyTop[0].currentWeek === currentWeek) {
        if (statisticData.win) {
          weeklyTop[0].wins = weeklyTop[0].wins + 1;
          weeklyTop[0].top.push(statisticData);
        } else {
          weeklyTop[0].losses = weeklyTop[0].losses + 1;
        }
        const totalGamesNumber =
          parseInt(weeklyTop[0].wins, 10) + parseInt(weeklyTop[0].losses, 10);
        let avgWinRation = (weeklyTop[0].wins * 100) / totalGamesNumber;
        weeklyTop[0].avgWinRatio = avgWinRation;
        WeeklyTop.upsertWithWhere(
          { id: weeklyTop[0].id },
          weeklyTop[0],
          (err, obj) => {}
        );
      } else {
        WeeklyTop.upsertWithWhere(
          { id: weeklyTop[0].id },
          {
            currentWeek: currentWeek,
            avgWinRatio: 0,
            wins: 0,
            losses: 0,
            top: []
          },
          (err, obj) => {}
        );
      }
    });
  };

  const changeWinHistory = statisticData => {
    const WinHistory = app.models.WinHistory;
    console.log("-------statisticData in history---", statisticData);
    WinHistory.create(statisticData, (err, createdObj) => {
      if (err) throw err;
      console.log("----winhistory created------");
    });
  };

  const updateGeneralStats = statsToUpdate => {
    GeneralStats.find({}, (err, generalStats) => {
      console.log("-----generalStats-----", generalStats[0]);
      const updatedWins = statsToUpdate.win
        ? generalStats[0].wins + 1
        : generalStats[0].wins;
      const updatedLosses = !statsToUpdate.win
        ? generalStats[0].losses + 1
        : generalStats[0].losses;
      const updatedTotalGamesPlayed = generalStats[0].totalGamesPlayed + 1;

      generalStats[0].updateAttributes(
        {
          avgWinRatio: (updatedWins * 100) / updatedTotalGamesPlayed,
          totalGamesPlayed: updatedTotalGamesPlayed,
          wins: updatedWins,
          losses: updatedLosses,
          amountWon: statsToUpdate.amountWon + generalStats[0].amountWon,
          amountLoosed:
            statsToUpdate.amountLoosed + generalStats[0].amountLoosed
        },
        (err, updatedStats) => {
          if (err) res.status(500).send("Error during update!");

          console.log("----updatedStats------", updatedStats);
        }
      );
    });
  };

  app.post("/api/Clients/login", function(req, response, next) {
    const User = app.models.Client;
    let userRole, token;
    console.log("-------user login req.body---", req.body);
    let userLogin = User.login(
      {
        email: req.body.email,
        password: req.body.password
      },
      "user"
    );

    userLogin
      .then(
        tokenObject => {
          token = tokenObject;
          console.log("------token----", token);
          return User.find({
            where: {
              email: req.body.email
            }
          });
        },
        err => {
          throw err;
        }
      )
      .then(res => {
        console.log("-------user login---", res);
        if (res[0].isActive === false) {
          response.status(400).send({
            message: "Your accound has been deactivated!",
            statusCode: 401
          });
          return;
        } else {
          return app.models.RoleMapping.find({
            where: {
              principalId: token.userId
            }
          });
        }
      })
      .then(res => {
        if (res[0] !== undefined) {
          return app.models.Role.find({
            where: {
              id: res[0].roleId
            }
          });
        } else {
          console.log("Role for this user was not found.");
          return res;
          // response.status(404).send('Not Found');
        }
      })
      .then(res => {
        userRole = res[0].name;
        console.log("------user----", token.__data.user, "userrole", userRole);
        response.send({
          email: req.body.email,
          token: token.id,
          ttl: token.ttl,
          createdAt: token.created,
          userId: token.userId
        });
      })
      .catch(err => {
        console.log("Error during login: ", JSON.stringify(err));
        response
          .status(err.statusCode)
          .send({ message: err.message, statusCode: err.statusCode });
      });
  });

  // show password reset form
  app.get("/reset-password", function(req, res, next) {
    if (!req.accessToken) return res.sendStatus(401);
    res.render("password-reset", {
      redirectUrl:
        "/api/Clients/reset-password?access_token=" + req.accessToken.id
    });
  });

  app.post("/api/updateTockens", function(req, res, next) {
    console.log("----updateTockens------");
    const User = app.models.Client;
    User.findById(req.body.userId, (err, client) => {
      if (client) {
        console.log("----------client", client);
        client.updateAttributes(
          {
            tockens: req.body.tockens
          },
          (err, updatedUser) => {
            if (err) {
              console.log("----------err", err);
              res.status(500).send("Error during update!");
            } else {
              res.send(updatedUser);
            }
          }
        );
      }
    });
  });

  app.post("/api/postGameResults", function(req, res, next) {
    console.log("----postGameResults------");
    const User = app.models.Client;

    const statisticData = {
      userId: req.body.userId,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      gameName: req.body.gameName,
      date: req.body.date,
      amount: req.body.amount,
      win: req.body.win,
      gameCost: req.body.gameCost
    };

    if (statisticData.date) {
      changeWinHistory(statisticData);
      prepareWeeklyTop(statisticData);
      updateGeneralStats({
        win: req.body.win,
        amountWon: req.body.win ? req.body.amount - req.body.gameCost : 0,
        amountLoosed: !req.body.win ? req.body.gameCost - req.body.amount : 0
      });
    }

    User.findById(req.body.userId, (err, client) => {
      if (client) {
        console.log("----------client", client);
        const updatedWin = req.body.win ? client.win + 1 : client.win;
        const updatedLosses = !req.body.win ? client.losses + 1 : client.losses;
        const updatedTotalUserGamesNumber = statisticData.date
          ? client.totalUserGamesNumber + 1
          : client.totalUserGamesNumber;
        const amountWon = req.body.win
          ? client.amountWon + (req.body.amount - req.body.gameCost)
          : client.amountWon;
        const amountLoosed = !req.body.win
          ? client.amountLoosed + (req.body.gameCost - req.body.amount)
          : client.amountLoosed;

        if (client.win === 0 && req.body.win) {
          sendNotification(
            client.id,
            "Congratulations on your first win! Keep up!"
          );
        }
        client.updateAttributes(
          {
            tockens: req.body.tockens,
            totalUserGamesNumber: updatedTotalUserGamesNumber,
            win: updatedWin,
            losses: updatedLosses,
            winRatio: (updatedWin * 100) / updatedTotalUserGamesNumber,
            amountWon: amountWon,
            amountLoosed
          },
          (err, updatedUser) => {
            if (err) res.status(500).send("Error during update!");
            res.send(updatedUser);
          }
        );
      }
    });
  });

  app.post("/api/postFriendReferralCode", async (req, res, next) => {
    const User = app.models.Client;
    const applyier = await User.findById(req.body.id);

    if (applyier.usedReferrals.includes(req.body.referralCode)) {
      res.send({
        success: false,
        message: "You already used this code!"
      });
      return;
    }

    User.find(
      {
        where: {
          referralCode: req.body.referralCode
        }
      },
      (err, users) => {
        console.log("----------user referral master", users);
        if (err) res.status(500).send("Error during submit referral!");
        if (users[0]) {
          if (req.body.referralCode === applyier.referralCode) {
            res.send({
              success: false,
              message: "You can not use this code! It is yours!"
            });
            return;
          }
          users[0].updateAttributes(
            {
              referralEarnings: users[0].referralEarnings + req.body.amount,
              referrals: [
                ...users[0].referrals,
                {
                  firstName: req.body.firstName,
                  lastName: req.body.lastName,
                  date: req.body.date,
                  amount: req.body.amount
                }
              ]
            },
            async (err, updatedUser) => {
              if (err) res.status(500).send("Error during submit referral!");
              await applyier.updateAttributes({
                tockens: applyier.tockens + req.body.amount,
                usedReferrals: [
                  ...applyier.usedReferrals,
                  req.body.referralCode
                ]
              });
              sendNotification(
                users[0].id,
                `Congratulations!!! You referral code was applied. You got ${req.body.amount} tokens!`
              );
              res.send({
                success: true,
                message: "Congratulations! You received 50 tokens."
              });
              return;
            }
          );
        } else {
          res.send({
            success: false,
            message: "Invalid referral code! Please try again!"
          });
        }
      }
    );
  });

  console.log("----addEarningToBalance------");
  app.post("/api/addEarningToBalance", function(req, res, next) {
    const User = app.models.Client;
    User.findById(req.body.userId, (err, client) => {
      if (client) {
        console.log("----------client", client);
        client.updateAttributes(
          {
            tockens: client.tockens + client.referralEarnings,
            referralEarnings: 0
          },
          (err, updatedUser) => {
            if (err) {
              console.log("----------err", err);
              res.status(500).send("Error during update!");
            } else {
              res.send(updatedUser);
            }
          }
        );
      }
    });
  });
};
