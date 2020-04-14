const petitions = require('../controllers/petitions.controller');

module.exports = function(app) {

    app.route(app.rootUrl + '/petitions/categories')
        .get(petitions.getCategories);

    app.route(app.rootUrl + '/petitions/:id')
        .delete(petitions.removePetition)
        .patch(petitions.editPetition)
        .get(petitions.getPetition);

    app.route(app.rootUrl + '/petitions')
        .post(petitions.createPetition);
};