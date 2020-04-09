const petitions = require('../models/petitions.model');
const user = require('../models/user.model');

exports.getCategories = async function (req, res) {
    console.log("CONTROLLER: Request to get all categories");

    try {
        let categories = await petitions.retrieveCategories();
        res.status(200)
            .send(categories);
    } catch (err) {
        res.status(500)
            .send(`CONTROLLER: ERROR retrieving categories: ${err}`);
    }
};