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
    if (petitionDate === null) {
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
    //console.log(petitionDate);
    // console.log(petitionDate === null);
    // console.log(petitionDate === "null");
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
    //console.log(dateIsValid);
    let isSigned = result2.length > 0;
    //console.log(isSigned);
    if (!dateIsValid || isSigned) {
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

exports.removeSignature = async function(userID, petitionID) {
    console.log(" MODEL: Request to remove a signature from the database.");

    let result;
    let dateQueryInput = [petitionID];
    const conn = await db.getPool().getConnection();
    const dateQuery = 'SELECT closing_date FROM Petition WHERE petition_id = ?';
    const [dateResult, _] = await conn.query(dateQuery, dateQueryInput);
    let currentDate = new Date();
    let petitionDate = dateResult[0].closing_date;
    let dateIsValid = validateDate(currentDate, petitionDate);

    let inputs = [userID, petitionID];
    const query2 = 'SELECT * FROM Signature WHERE signatory_id = ? AND petition_id = ?';
    const [result2, ] = await conn.query(query2, inputs);
    let isSigned = result2.length > 0;

    const query3 = 'SELECT * FROM Petition WHERE author_id = ? AND petition_id = ?';
    const [result3, ] = await conn.query(query3, inputs);
    let isAuthor = result3.length > 0;
    //console.log(isAuthor);

    if (!dateIsValid || !isSigned || isAuthor) {
        result = false;
        // return false;
    } else {
        //console.log("testing");
        const query4 = 'DELETE FROM Signature WHERE signatory_id = ? AND petition_id = ?';
        await conn.query(query4, inputs);
        result = true;
    }

    conn.release();
    return result;
};