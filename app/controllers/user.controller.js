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