//https://www.npmjs.com/package/uid-generator token generator

const UIDGenerator = require('uid-generator');
const uidgen = new UIDGenerator();
let fs = require('mz/fs');
const photosDirectory = './storage/photos/';
const user = require('../models/user.model');

exports.register = async function(req, res) {
    console.log('\n CONTROLLER: Request to register a new user');

    try {
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;
        const city = req.body.city;
        const country = req.body.country;

        if (!req.body.hasOwnProperty("name") || password === "" || !email.includes("@")) {
            res.status(400)
                .send("Please enter a valid email or password");
        } else {
            const result = await user.createUser(name, email, password, city, country);
            res.status(201)
                .send({"userId": result});
        }
    } catch (err) {
        res.status(500)
            .send(`CONTROLLER: ERROR registering user ${err}`);
    }

};

exports.getUser = async function(req, res) {
    console.log('\n CONTROLLER: Request to retrieve a user from the database');

    try {
        const id = req.params.id;
        const token = req.get("X-Authorization");
        const result = await user.retrieveUser(id, token);

        if (result.length === 0) {
            res.status(404)
                .send("User not found");

        } else if (result[0].hasOwnProperty("email")) {
            res.status(200)
                .send({
                    "name": result[0].name,
                    "city": result[0].city,
                    "country": result[0].country,
                                    "email": result[0].email});
        } else {
            res.status(200)
                .send({
                    "name": result[0].name,
                    "city": result[0].city,
                    "country": result[0].country,
                });
        }


    } catch (err) {
        res.status(500)
            .send(`CONTROLLER: ERROR retrieving user ${err}`);
    }

};

exports.login = async function(req, res) {
    console.log('\n CONTROLLER: Request to log user details');

    try {
        const email = req.body.email;
        const password = req.body.password;

        let result = await user.logUser(email);
        if (result.length === 0 || result[0].password !== password) {
            res.status(400)
                .send("User does not exist or incorrect password");
        } else {
            let newToken = await uidgen.generate();
            await user.setToken(email, newToken);
            res.status(200)
                .send({"userId": result[0].user_id, "token": newToken});
        }




    } catch (err) {
        res.status(500)
            .send(`CONTROLLER: ERROR login user ${err}`);
    }

};

exports.logout = async function(req, res) {
    console.log('\n CONTROLLER: Request to log out an user');
    try {
        let token = req.get("X-Authorization");

        let result = await user.deleteToken(token);

        if (result.affectedRows === 0) {
            res.status(401)
                .send();
        } else {
            res.status(200)
                .send("User was successfully logged out");
        }
    } catch(err) {
        res.status(500)
            .send(`CONTROLLER: ERROR logging user out ${err}`);
    }
};

exports.editUser = async function(req, res) {
    console.log('\n CONTROLLER: Request to edit user information');

    try {
        let updated = false;
        let token = req.get("X-Authorization");
        let result = await user.validateUser(token);
        let id = req.params.id;

        if (result.length === 0 || result[0].user_id != id) {
            res.status(401)
                .send();
        } else {

            let email = req.body.email;
            if (typeof email !== "undefined") {
                if (!email.includes("@")) {
                    res.status(400)
                        .send("Invalid email")
                }
                let isPresent = await user.checkEmail(email);
                if (isPresent) {
                    res.status(400)
                        .send("Email is already in use");
                } else {
                    await user.updateUserInfo(email, id, "email");
                    updated = true;
                }
            }

            let password = req.body.password;
            let currentPassword = req.body.currentPassword;
            if (typeof password !== "undefined" && typeof currentPassword !== "undefined") {

                if (password === "") {
                    res.status(400)
                        .send("Passwords is empty");
                }

                let passwordValidation = await user.getCurrentPassword(id);
                console.log(passwordValidation);
                if (passwordValidation[0].password !== currentPassword) {
                    res.status(400)
                        .send("Passwords don't match");
                } else {
                    await user.updateUserInfo(password, id, "password");
                    updated = true;
                }


            }


            let name = req.body.name;
            if (typeof name !== "undefined") {
                await user.updateUserInfo(name, id, "name");
                updated = true;
            }


            let city = req.body.city;
            if (typeof city !== "undefined") {
                await user.updateUserInfo(city, id, "city");
                updated = true;
            }

            let country = req.body.country;
            if (typeof country !== "undefined") {
                await user.updateUserInfo(country, id, "country");
                updated = true;
            }

            if (updated === false) {
                res.status(400)
                    .send("No changes where provided");
            } else {
                res.status(200)
                    .send();
            }

        }
    } catch (err) {
        res.status(500)
            .send(`CONTROLLER: ERROR editing user ${err}`);
    }
};

exports.getPhoto = async function(req, res) {
    console.log("\n CONTROLLER: Request to get a user's photo ");
    try {
        const id = req.params.id;
        let photoName = await user.getPhotoFilename(id);
        photoName = photoName[0].photo_filename
        if (photoName === null) {
            res.status(404)
                .send();
        } else {
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
    console.log("\n CONTROLLER: Request to set a user's photo ");

    try {
        const id = req.params.id;
        let token = req.get("X-Authorization");
        let statusMessage = 201;
        const validExtensions = ["jpg", "jpeg", "gif", "png"];

        const userExists = await user.userExists(id);
        if (!userExists) {
           res.status(404)
               .send();
           return;
        }

        let reqUserID = await user.validateUser(token);
        reqUserID = reqUserID[0].user_id;
        if (id != reqUserID) {
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

        let fileName = 'user_' + reqUserID + '.' + imageExtension;
        let photoName = await user.getPhotoFilename(id);
        photoName = photoName[0].photo_filename

        if (photoName !== null) {
            await fs.unlink(photosDirectory + photoName);
            await user.deleteFilename(id);
            statusMessage = 200;
        }
        await user.saveFileName(fileName, id);
        req.pipe(fs.createWriteStream(photosDirectory + fileName));
        res.status(statusMessage)
            .send();

    } catch (err) {
        res.status(500)
            .send(`CONTROLLER: ERROR setting photo: ${err}`);
    }
};

exports.deletePhoto = async function(req, res) {
    console.log("\n CONTROLLER: Request to set a user's photo ");

    try {
        const id = req.params.id;
        const token = req.get("X-Authorization");

        const userExists = await user.userExists(id);
        if (!userExists) {
            res.status(404)
                .send();
            return;
        }

        let reqUserID = await user.validateUser(token);
        if (token === "" || token === "undefined" || token === null || reqUserID.length === 0) {
            res.status(401)
                .send();
            return;
        }

        reqUserID = reqUserID[0].user_id;
        if (id != reqUserID) {
            res.status(403)
                .send();
            return;
        }

        let photoName = await user.getPhotoFilename(id);
        photoName = photoName[0].photo_filename

        if (photoName === null) {
            res.status(404)
                .send()
            await fs.unlink(photosDirectory + photoName);
            await user.deleteFilename(id);
        } else {
            await fs.unlink(photosDirectory + photoName);
            await user.deleteFilename(id);
            res.status(200)
                .send();
        }
    } catch (err) {
        res.status(500)
            .send(`CONTROLLER: ERROR deleting photo: ${err}`);
    }
}