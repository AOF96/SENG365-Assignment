//https://www.npmjs.com/package/uid-generator token generator

const UIDGenerator = require('uid-generator');
const uidgen = new UIDGenerator();

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
        console.log(id);
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

        // let query = 'UPDATE User SET ';
        // for (let key in req.body) {
        //     query += key + ' = ?, ';
        // }
        // console.log(query);
        // query = query.substring(0, query.length - 1);
        // console.log(query);



        let token = req.get("X-Authorization");
        let result = await user.validateUser(token);
        let id = req.params.id;

        if (result.length === 0 || result[0].user_id != id) {
            res.status(401)
                .send();
        } else {

            let name = req.body.name;
            if (typeof name !== "undefined") {
                await user.updateUserInfo(name, id, "name");
                res.status(200)
                    .send("Profile info updated");
            }
            let email = req.body.email;
            let password = req.body.password;
            let currentPassword = req.body.currentPassword;
            let city = req.body.city;
            let country = req.body.country;


        }
    } catch (err) {
        res.status(500)
            .send(`CONTROLLER: ERROR editing user ${err}`);
    }
};