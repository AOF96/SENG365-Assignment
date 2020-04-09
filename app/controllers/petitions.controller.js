const petitions = require('../models/petitions.model');
const user = require('../models/user.model');
const signatures = require('../models/petitions.signatures.model');

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

exports.removePetition = async function (req, res) {
    console.log("CONTROLLER: Request to delete a petition");

    try {
        const petitionID = req.params.id;
        const token = req.get("X-Authorization");

        let petitionExists = await signatures.validatePetition(petitionID);
        if (!petitionExists) {
            res.status(404)
                .send("Unauthorized");
            return;
        }

        if (token === "") {
            res.status(401)
                .send("Unauthorized");
            return;
        }

        let userID = await user.validateUser(token);
        userID = userID[0].user_id;
        let result = await petitions.deletePetition(userID, petitionID);

        if (result) {
            res.status(200)
                .send();
        } else {
            res.status(403)
                .send();
        }

    } catch (err) {
        res.status(500)
            .send(`CONTROLLER: ERROR deleting petition: ${err}`);
    }
};