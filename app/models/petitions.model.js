const db = require('../../config/db');

exports.retrieveCategories = async function() {
    console.log("MODEL: Request to fetch all categories from the database.");

    const conn = await db.getPool().getConnection();
    const query = 'SELECT category_id as categoryId, name from Category';
    const [result, _] = await conn.query(query);
    conn.release();
    return result;
};