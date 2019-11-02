'use strict';

const debug = require('debug')('routes');

module.exports = function(app) {
  app.post('/api/Clients/login', function(req, response, next) {
    const User = app.models.Client;
    let userRole, token;
    console.log('-------user login req.body---', req.body);
    let userLogin = User.login(
      {
        email: req.body.email,
        password: req.body.password,
      },
      'user'
    );

    userLogin
      .then(
        tokenObject => {
          token = tokenObject;
          console.log('------token----', token);
          return User.find({
            where: {
              email: req.body.email,
            },
          });
        },
        err => {
          throw err;
        }
      )
      .then(res => {
        console.log('-------user login---', res);
        if (res[0].isActive === false) {
          response.status(400).send({
            message: 'Your accound has been deactivated!',
            statusCode: 401,
          });
          return;
        } else {
          return app.models.RoleMapping.find({
            where: {
              principalId: token.userId,
            },
          });
        }
      })
      .then(res => {
        if (res[0] !== undefined) {
          return app.models.Role.find({
            where: {
              id: res[0].roleId,
            },
          });
        } else {
          console.log('Role for this user was not found.');
          return res;
          // response.status(404).send('Not Found');
        }
      })
      .then(res => {
        userRole = res[0].name;
        console.log('------user----', token.__data.user, 'userrole', userRole);
        response.send({
          email: req.body.email,
          token: token.id,
          ttl: token.ttl,
          createdAt: token.created,
          userId: token.userId,
        });
      })
      .catch(err => {
        console.log('Error during login: ', JSON.stringify(err));
        response
          .status(err.statusCode)
          .send({message: err.message, statusCode: err.statusCode});
      });
  });

  // show password reset form
  app.get('/reset-password', function(req, res, next) {
    if (!req.accessToken) return res.sendStatus(401);
    res.render('password-reset', {
      redirectUrl:
        '/api/Clients/reset-password?access_token=' + req.accessToken.id,
    });
  });
};
