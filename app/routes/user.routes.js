const users = require('../controllers/user.controller');

module.exports = function(app) {
    app.route(app.rootUrl + '/users/register')
        .post(users.register);

    app.route(app.rootUrl + '/users/login')
        .post(users.login);

    app.route(app.rootUrl + '/users/logout')
        .post(users.logout);

    app.route(app.rootUrl + '/users/:id')
        .get(users.getUser)
        .patch(users.editUser);

    app.route(app.rootUrl + '/users/:id/photo')
        .get(users.getPhoto)
        .put(users.setPhoto)
        .delete(users.deletePhoto);
};