const users = require('../controllers/user.controller');

module.exports = function(app) {
    app.route(app.rootUrl + '/users/register')
        .post(users.register);

    app.route(app.rootUrl + '/users/:id')
        .get(users.getUser);
};