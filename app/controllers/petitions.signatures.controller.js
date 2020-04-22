const signatures = require('../models/petitions.signatures.model');
const user = require('../models/user.model');

exports.view = async function(req, res) {

    try {
        const id = req.params.id;
        let result = await signatures.getUserDetails(id);

        if (result.length === 0) {
            res.status(404)
                .send();
        } else {
            res.status(200)
                .send(result);
        }

    } catch (err) {
        res.status(500)
            .send(`CONTROLLER: ERROR viewing petitions ${err}`);
    }
};

exports.sign = async function(req, res) {

    try {
        const petitionID = req.params.id;
        const token = req.get("X-Authorization");

        if (token === "") {
            res.status(401)
                .send();
            return;
        }

        let userIsValid = await user.validateUser(token);
        if (token === "undefined" || userIsValid.length === 0) {
            res.status(401)
                .send();
            return;
        }

        const userId = userIsValid[0].user_id;
        let petitionExists = await signatures.validatePetition(petitionID);
        if (!petitionExists) {
            res.status(404)
                .send();
        }

        let result = await signatures.signPetition(userId, petitionID);
        if (result) {
            res.status(201)
                .send();
        } else {
            res.status(403)
                .send();
        }

    } catch (err) {
        res.status(500)
            .send(`CONTROLLER: ERROR signing a petition ${err}`);
    }
};

exports.remove = async function(req, res) {

    try {
        const petitionID = req.params.id;
        const token = req.get("X-Authorization");

        if (token === "") {
            res.status(401)
                .send();
            return;
        }

        let userIsValid = await user.validateUser(token);
        if (token === "undefined" || userIsValid.length === 0) {
            res.status(401)
                .send();
            return;
        }

        const userId = userIsValid[0].user_id;
        let petitionExists = await signatures.validatePetition(petitionID);
        if (!petitionExists) {
            res.status(404)
                .send();
                return;
        }

        let result = await signatures.removeSignature(userId, petitionID);
        if (result) {
            res.status(200)
                .send();
        } else {
            res.status(403)
                .send();
        }

    } catch(err) {
        res.status(500)
            .send(`CONTROLLER: ERROR removing petition ${err}`);
    }
};