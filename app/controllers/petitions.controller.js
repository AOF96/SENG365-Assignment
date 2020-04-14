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

exports.editPetition = async function (req, res) {
    try {
        console.log("CONTROLLER: Request to edit a petition");

        const petitionID = req.params.id;
        const token = req.get("X-Authorization");

        let petitionExists = await signatures.validatePetition(petitionID);
        if (!petitionExists) {
            res.status(404)
                .send();
            return;
        }

        if (token === "") {
            res.status(401)
                .send();
            return;
        }

        let userID = await user.validateUser(token);
        userID = userID[0].user_id;
        const isAuthor = await petitions.validateAuthor(userID, petitionID);

        if (userID.length === 0 || !isAuthor) {
            res.status(403)
                .send();
            return;
        }

        let updated = false;
        let currentDate = new Date();
        const hasExpired = await petitions.validateDate(petitionID, currentDate);
        if (hasExpired) {
            res.status(400)
                .send();
            return;
        }

        let closingDate = req.body.closingDate;
        closingDate = new Date(closingDate);
        if (typeof closingDate !== "undefined") {
            closingDate = new Date(closingDate);
            if (closingDate > currentDate) {
                await petitions.updatePetitionData(closingDate, userID, "closing_date");
                updated = true;
            }
        }

        let categoryId = req.body.categoryId;
        if (typeof categoryId !== "undefined") {
            const categoryExist = await petitions.validateCategory(categoryId);

            if (categoryExist) {
                await petitions.updatePetitionData(categoryId, userID, "category_id");
                updated = true;
            } else {
                res.status(400)
                    .send();
                return;
            }
        }

        const title = req.body.title;
        if (typeof title !== "undefined") {
            await petitions.updatePetitionData(title, userID, "title");
            updated = true;
        }

        const description = req.body.description;
        if (typeof description !== "undefined") {
            await petitions.updatePetitionData(description, userID, "description");
            updated = true;
        }



        if (updated) {
            res.status(200)
                .send();
        } else {
            res.status(403)
                .send();
        }

    } catch (err) {
        res.status(500)
            .send(`CONTROLLER: ERROR editing petition: ${err}`);
    }
};

exports.getPetition = async function(req, res) {
    console.log("CONTROLLER: Request to view a single petition");

    try {
        let petitionID = req.params.id;
        let petitionExists = await signatures.validatePetition(petitionID);
        if (!petitionExists) {
            res.status(404)
                .send();
            return;
        }

        const result = await petitions.getOnePetition(petitionID);
        res.status(200)
            .send(result[0]);
    } catch (err) {
        res.status(500)
            .send(`CONTROLLER: ERROR viewing petition: ${err}`);
    }
};

exports.createPetition = async function(req, res) {
    console.log("CONTROLLER: Request to create a new petition");

    try {
        const token = req.get("X-Authorization");
        let userID = await user.validateUser(token);
        if (token === "" || userID.length === 0) {
            res.status(401)
                .send();
            return;
        }

        userID = userID[0].user_id;
        let title = req.body.title;
        let description = req.body.description;
        let categoryId = req.body.categoryId;
        let closingDate = req.body.closingDate;
        let currentDate = new Date();

        const titleIsInvalid = (typeof title === "undefined" || title === "");
        const descriptionIsInvalid = (typeof description === "undefined" || description === "");
        const categoryIsInvalid =  (typeof categoryId === "undefined" || categoryId === "" || !(await petitions.validateCategory(categoryId)));
        let dateIsValid = false;

        if (titleIsInvalid || descriptionIsInvalid || categoryIsInvalid) {
            res.status(400)
                .send();
            return;
        }
        if (typeof closingDate !== "undefined") {
            closingDate = new Date(closingDate);
            if (closingDate < currentDate) {
                res.status(400)
                    .send();
                return;
            } else {
                dateIsValid = true;
            }
        }


        const result = await petitions.insertPetition(userID, title, description, categoryId, currentDate, closingDate, dateIsValid);

        res.status(200)
            .send({"petitionId": result.insertId});
    } catch (err) {
        res.status(500)
            .send(`CONTROLLER: ERROR creating petition: ${err}`);
    }
};