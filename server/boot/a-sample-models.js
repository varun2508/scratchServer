'use strict';
const debug = require('debug')('a-sample-models');

// /// /performs automigration from models and reates tables in database
module.exports = function(app) {
  const User = app.models.Client;
  const Role = app.models.Role;
  const RoleMapping = app.models.RoleMapping;

  debug('Verifying if automigration is needed!!!');
  console.log('------verifying if automigration is needed----');
  User.find({ where: { email: 'helpg798@gmail.com' } }, async (err, arr) => {
    if (arr.length === 0) {
      // building database if it`s not exists
      console.log('-----making migration-----', err, 'arrrrrrrr', arr);
      await app.dataSources.scratch_dev.automigrate();
      debug('Performed automigration!');
      await User.find(
        { username: 'Admin', email: 'helpg798@gmail.com' },
        (err, arr) => {
          debug('Inspecting simple data: ');
          debug('Error: ', err);
          debug('Users found: ', arr.length);
          if (arr.length === 0 && process.env['NODE_ENV'] !== 'test') {
            debug('Creating simple data: ');
            Role.create({
              name: 'admin'
            }).then(res => {
              RoleMapping.create({
                principalType: 'USER',
                principalId: 1,
                roleId: res.id
              }).then(() => {
                // creating first default user
                User.create([
                  {
                    username: 'Admin',
                    email: 'helpg798@gmail.com',
                    password: '123456',
                    emailVerified: true,
                    userType: 'admin',
                    active: 1,
                    name: 'admin'
                  }
                ]);
              });
            });
          } else {
            debug('Simple data exists!');
          }
        }
      );
    } else {
      debug('Automigration was not performed!', 'err: ', err);
    }
  });
};
