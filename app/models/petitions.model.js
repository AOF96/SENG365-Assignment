const db = require('../../config/db');

exports.retrieveCategories = async function() {

    const conn = await db.getPool().getConnection();
    const query = 'SELECT category_id as categoryId, name from Category';
    const [result, _] = await conn.query(query);

    conn.release();
    return result;
};

exports.deletePetition = async function(userID, petitionID) {

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

    let values = [value, id];
    const conn = await db.getPool().getConnection();
    const query = 'UPDATE Petition SET '.concat(type," = ? WHERE petition_id = ?");
    await conn.query(query, values);

    conn.release();
};

exports.validateAuthor = async function(userID, petitionID) {

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

exports.getOnePetition = async function(petitionID) {

    let input = [petitionID];
    const conn = await db.getPool().getConnection();
    const query = 'SELECT p.petition_id as petitionId, p.title, p.description, p.author_id as authorId, a.name as authorName, ' +
        'a.city as authorCity, (SELECT name from Category where category_id = p.category_id) as category, ' +
        '(SELECT COUNT(*) FROM Signature WHERE petition_id = p.petition_id) as signatureCount,  ' +
        'a.country as authorCountry, p.created_date as createdDate, ' +
        'p.closing_date as closingDate FROM Petition p JOIN User a WHERE p.petition_id = ? AND p.author_id = a.user_id';
    const [result, _] = await conn.query(query, input);

    conn.release();
    return result;
};

exports.insertPetition = async function(userID, title, description, categoryId, currentDate, closingDate, dateIsValid) {

    let inputs = [title, description, userID, categoryId, currentDate];
    const conn = await db.getPool().getConnection();
    const query = "INSERT INTO Petition (title, description, author_id, category_id, created_date) VALUES (?, ?, ?, ?, ?)";
    const [result, _] = await conn.query(query, inputs);

    if (dateIsValid) {
        inputs = [closingDate, result.insertId];
        const dateQuery = "UPDATE Petition SET closing_date = ? WHERE petition_id = ?";
        await conn.query(dateQuery, inputs);
    }

    conn.release();
    return result;
};

exports.retrievePetitions = async function(hasParams, categoryId, authorId, sortParameter, q) {

    const conn = await db.getPool().getConnection();
    let result;
    let querySection = '';
    let inputs = [];
    let query = 'SELECT DISTINCT p.petition_id AS petitionId, p.title AS title, ' +
        '(SELECT name FROM Category WHERE category_id = p.category_id) AS category, a.name AS authorName, ' +
        '(SELECT COUNT(*) FROM Signature WHERE petition_id = p.petition_id) as signatureCount FROM ' +
        'Petition p JOIN User a WHERE p.author_id = a.user_id ';

    if (!hasParams) {
        querySection = 'ORDER BY signatureCount DESC';
        query += querySection;
        result = await conn.query(query);
    } else {
        if (typeof q !=="undefined") {
            inputs.push(q);
            querySection += "AND locate(?, p.title) > 0 ";
        }

        if (typeof categoryId !== "undefined") {
            inputs.push(categoryId);
            querySection += "AND category_id = ? ";
        }

        if (typeof authorId !== "undefined") {
            inputs.push(authorId);
            querySection += "AND author_id = ? ";
        }

        if (typeof sortParameter !== "undefined") {
            sortParameter.includes("ALPHABETICAL") ? querySection += "ORDER BY title " : querySection += "ORDER BY signatureCount ";
            sortParameter.includes("ASC") ? querySection += "ASC " : querySection += "DESC ";
        } else {
            querySection += 'ORDER BY signatureCount DESC';
        }

        query += querySection;
        result = await conn.query(query, inputs);
    }

    conn.release();
    return result[0];
};

exports.getPhotoFilename = async function(id) {

    let input = [id];
    const conn = await db.getPool().getConnection();
    const query = 'SELECT photo_filename FROM Petition WHERE petition_id = ?';
    const [result, _] = await conn.query(query, input);
    conn.release();

    return result;
};

exports.saveFileName = async function(fileName, petitionID) {

    let inputs = [fileName, petitionID];
    const conn = await db.getPool().getConnection();
    const query = 'UPDATE Petition SET photo_filename = ? WHERE petition_id = ?';
    await conn.query(query, inputs);

    conn.release();
};

exports.deleteFilename = async function(petitionID) {

    let input = [petitionID];
    const conn = await db.getPool().getConnection();
    const query = 'UPDATE Petition SET photo_filename = NULL WHERE petition_id = ?';
    await conn.query(query, input);

    conn.release();
};