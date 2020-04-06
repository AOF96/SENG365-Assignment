const db = require('../../config/db');

exports.getUserDetails = async function(id) {
    console.log(" MODEL: Request to retrieve users from the database who signed a certain petition.");

    let value = [id];
    const conn = await db.getPool().getConnection();
    //To phpmyadmin: SELECT user_id, name, city, country, signed_date FROM `User` JOIN `Signature` ON `User`.user_id=`Signature`.signatory_id
    const query = 'SELECT user_id as signatoryId, name, city, country, signed_date as signedDate FROM User JOIN Signature ON ' +
        'User.user_id=Signature.signatory_id WHERE petition_id = ? ORDER BY signed_date';
    const [result, _] = await conn.query(query, value);
    conn.release();
    //console.log(result);

    return result;
};

exports.validatePetition = async function(petitionID) {
    let queryValue = [petitionID];
    const conn = await db.getPool().getConnection();
    const query = 'SELECT * FROM Petition WHERE petition_id = ?';
    const [result, _] = await conn.query(query, queryValue);
    conn.release();
    return result.length > 0;
};

function validateDate(currentDate, petitionDate) {
    if (petitionDate === 'null') {
        return true;
    }

    return currentDate < petitionDate;
}

exports.signPetition = async function(user_id, petition_id) {
    console.log(" MODEL: Request to sign a petition.");

    let outcome = false;
    let value = [petition_id];
    const conn = await db.getPool().getConnection();
    const query = 'SELECT closing_date FROM Petition WHERE petition_id = ?';
    const [result, _] = await conn.query(query, value);

    //check that the petition is not expired.
    let currentDate = new Date();
    let petitionDate = result[0].closing_date;

    //console.log(currentDate);
    // console.log(petitionDate.getFullYear());
    // let yearIsExpired = currentDate.getFullYear() > petitionDate.getFullYear();
    let inputs = [user_id, petition_id];
    const query2 = 'SELECT * FROM Signature WHERE signatory_id = ? AND petition_id = ?';
    const [result2, ] = await conn.query(query2, inputs);
    // console.log(result);
    // console.log("Petition date: " + petitionDate);
    // console.log("Current date: " + currentDate);
    // console.log(petitionDate < currentDate);
    let dateIsValid = validateDate(currentDate, petitionDate);
    let isSigned = result2.length > 0;
    if (dateIsValid || isSigned) {
        return outcome;
    } else {
        let insertQueryInputs = [user_id, petition_id, currentDate];
        const insertQuery = 'INSERT INTO Signature(signatory_id, petition_id, signed_date) VALUES (?, ?, ?)';
        await conn.query(insertQuery, insertQueryInputs);
        outcome = true;
    }

    conn.release();
    return outcome;
};