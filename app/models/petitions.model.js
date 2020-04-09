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
    console.log(queryResult);
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