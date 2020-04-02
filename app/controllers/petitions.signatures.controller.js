const signatures = require('../models/petitions.signatures.model');

exports.view = async function(req, res) {
    console.log("CONTROLLER: Request to view all users who signed a petition.");
    
    try {
        const id = req.params.id;
        let result = await signatures.getUserDetails(id);

        if (result.length === 0) {
            res.status(404)
                .send("Not Found");
        } else {
            res.status(200)
                .send(result);
        }
    } catch (err) {
        res.status(500)
            .send(`CONTROLLER: ERROR viewing petitions ${err}`);
    }
    
};