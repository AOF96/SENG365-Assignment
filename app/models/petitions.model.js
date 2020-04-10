const db = require('../../config/db');

exports.retrieveCategories = async function() {
    console.log("MODEL: Request to fetch all categories from the database.");

    const conn = await db.getPool().getConnection();
    const query = 'SELECT category_id as categoryId, name from Category';
    const [result, _] = await conn.query(query);
    conn.release();
    return result;
};

exports.deletePetition = async function(userID, petitionID) {
    console.log("MODEL: Request to delete a petition from the database.");

    let result;
    const conn = await db.getPool().getConnection();
    let inputs = [userID, petitionID];
    const userQuery = 'SELECT * FROM Petition WHERE author_id = ? AND petition_id = ?';
    const [queryResult, _] = await conn.query(userQuery, inputs);

    if (queryResult.length > 0) {
        const deleteQuery = 'DELETE FROM Petition WHERE author_id = ? AND petition_id = ?';
        await conn.query(deleteQuery, inputs);
        result = true;
    } else {
        result = false;
    }

    conn.release();
    return result;
};

exports.alterPetition = async function(userID, petitionID, title, description, categoryId, closingDate) {
    console.log("MODEL: Request to alter petition details from the database.");

    let result;
    const conn = await db.getPool().getConnection();
    let inputs = [userID, petitionID];
    const userQuery = 'SELECT * FROM Petition WHERE author_id = ? AND petition_id = ?';
    const [queryResult, _] = await conn.query(userQuery, inputs);

    if (queryResult.length > 0) {

        result = true;
    } else {
        result = false;
    }

    conn.release();
    return result;
};

exports.validateCategory = async function(categoryID) {
    console.log("MODEL: Request to access the database to check if a category exists.");

    let result = false;
    const conn = await db.getPool().getConnection();
    let queryInput = [categoryID];
    const query = 'SELECT * FROM Petition WHERE category_id = ?';
    const [queryResult, _] = await conn.query(query, queryInput);

    if (queryResult.length > 0) {
        result = true;
    }

    return result;
};

exports.validateDate = async function(petitionID, currentDate) {
    console.log("MODEL: Request to access the database and check if a petition has expired.");

    let result = false;
    const conn = await db.getPool().getConnection();
    let queryInput = [petitionID];
    const query = 'SELECT closing_date FROM Petition WHERE petition_id = ?';
    const [queryResult, _] = await conn.query(query, queryInput);

    const closingDate = queryResult[0].closing_date;
    if (closingDate === null) {
        return result;
    }

    if (closingDate < currentDate) {
        result = true;
    }
    return result;
};

exports.updatePetitionData = async function(value, id, type) {
    console.log(" MODEL: Request to modify petitions data in the database");

    let values = [value, id];
    const conn = await db.getPool().getConnection();
    const query = 'UPDATE Petition SET '.concat(type," = ? WHERE petition_id = ?");
    await conn.query(query, values);
    conn.release();
};

exports.validateAuthor = async function(userID, petitionID) {
    console.log(" MODEL: Request to check if the petition was created by the given user id");

    let result = false;
    const conn = await db.getPool().getConnection();
    let inputs = [userID, petitionID];
    const query = 'SELECT * FROM Petition WHERE author_id = ? AND petition_id = ?';
    const [queryResult, _] = await conn.query(query, inputs);

    if (queryResult.length > 0) {
        result = true;
    }

    conn.release();
    return result;
};