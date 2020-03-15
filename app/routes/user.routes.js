const users = require('../controllers/user.controller');

module.exports = function(app) {
    app.route('/users/register')
        .post(users.register);
};