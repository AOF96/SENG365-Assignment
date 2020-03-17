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
        const id = req.params.userId;
        const result = await user.retrieveUser(id);

        if (result.length === 0) {
            res.status(404)
                .send("User not found");

        } else {
            res.status(200)
                .send(result);
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
