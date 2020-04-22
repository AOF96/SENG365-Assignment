const petitions = require('../models/petitions.model');
const user = require('../models/user.model');
const signatures = require('../models/petitions.signatures.model');
let fs = require('mz/fs');
const photosDirectory = './storage/photos/';

exports.getCategories = async function (req, res) {

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

    try {
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
        res.status(201)
            .send({"petitionId": result.insertId});
    } catch (err) {
        res.status(500)
            .send(`CONTROLLER: ERROR creating petition: ${err}`);
    }
};

exports.viewPetitions = async function (req, res) {

    try {
        let result;
        let hasParams = false;

        if (Object.keys(req.query).length === 0) {
            result = await petitions.retrievePetitions(hasParams);
            res.status(200)
                .send(result);
        } else {
            hasParams = true;
            const startIndex = req.query.startIndex;
            const count = req.query.count;
            const q = req.query.q;
            const categoryId = req.query.categoryId;
            const authorId = req.query.authorId;
            const sortBy = req.query.sortBy;

            if (typeof categoryId !== "undefined") {
                if(!await petitions.validateCategory(categoryId)) {
                    res.status(400)
                        .send();
                    return;
                }
            }

            const validSortingValues = ["ALPHABETICAL_ASC", "ALPHABETICAL_DESC", "SIGNATURES_ASC", "SIGNATURES_DESC"];
            if (typeof sortBy !== "undefined") {
                if (!validSortingValues.includes(sortBy)) {
                    res.status(400)
                        .send();
                    return;
                }
            }

            result = await petitions.retrievePetitions(hasParams, categoryId, authorId, sortBy, q);
            if (typeof startIndex !== "undefined") {
                result = result.slice(startIndex);
            }

            if (typeof count !== "undefined") {
                result = result.slice(0, count);
            }

            res.status(200)
                .send(result);
        }

    } catch (err) {
        res.status(500)
            .send(`CONTROLLER: ERROR viewing petitions: ${err}`);
    }
};

exports.getPhoto = async function(req, res) {

    try {
        const petitionID = req.params.id;
        let photoName = await petitions.getPhotoFilename(petitionID);
        const petitionExists = signatures.validatePetition(petitionID);

        if (!petitionExists || photoName.length === 0) {
            res.status(404)
                .send();
        } else {
            photoName = photoName[0].photo_filename;
            if (photoName === null) {
                res.status(404)
                    .send();
                return;
            }

            const image = await fs.readFile(photosDirectory + photoName);
            const startPos = photoName.lastIndexOf(".");
            const mimeType = photoName.substring(startPos, photoName.length);
            res.status(200).contentType(mimeType).send(image);
        }
    } catch(err) {
        res.status(500)
            .send(`CONTROLLER: ERROR getting photo: ${err}`);
    }
};

exports.setPhoto = async function(req, res) {

    try {
        let petitionID = req.params.id;
        let token = req.get("X-Authorization");
        let statusMessage = 201;
        const validExtensions = ["jpg", "jpeg", "gif", "png"];

        let petitionExists = await signatures.validatePetition(petitionID);
        if (!petitionExists) {
            res.status(404)
                .send();
            return;
        }

        let userID = await user.validateUser(token);
        if (token === "" || token === "undefined" || token === null || userID.length === 0) {
            res.status(401)
                .send();
            return;
        }

        userID = userID[0].user_id;
        const isAuthor = await petitions.validateAuthor(userID, petitionID);
        if (!isAuthor) {
            res.status(403)
                .send();
            return;
        }

        let imageExtension = req.get("Content-Type");
        const startPos = imageExtension.lastIndexOf("/");
        imageExtension = imageExtension.substring(startPos + 1, imageExtension.length);
        if (!validExtensions.includes(imageExtension)) {
            res.status(400)
                .send();
        }

        let fileName = 'petition_' + petitionID + '.' + imageExtension;
        let photoName = await petitions.getPhotoFilename(petitionID);
        photoName = photoName[0].photo_filename

        if (photoName !== null) {
            await fs.unlink(photosDirectory + photoName);
            await petitions.deleteFilename(petitionID);
            statusMessage = 200;
        }

        await petitions.saveFileName(fileName, petitionID);
        req.pipe(fs.createWriteStream(photosDirectory + fileName));
        res.status(statusMessage)
            .send();

    } catch (err) {
        res.status(500)
            .send(`CONTROLLER: ERROR setting photo: ${err}`);
    }
};