const signatures = require('../controllers/petitions.signatures.controller');

module.exports = function(app) {

    app.route(app.rootUrl + '/petitions/:id/signatures')
        .get(signatures.view);
};