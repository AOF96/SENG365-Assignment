const user = require('../models/user.model');

exports.register = async function(req, res) {
    console.log('\n Request to register a new user');

    try {
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;
        const city = req.body.city;
        const country = req.body.country;

        if (password === "" || !email.includes("@")) {
            res.status(400)
                .send("Please enter a valid email or password");
        } else {
            
        }
    } catch (err) {
        res.status(500)
            .send(`ERROR registering user ${err}`);
    }



};