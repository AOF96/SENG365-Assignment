const db = require('../../config/db');

exports.createUser = async function(name, email, password, city, country) {
    console.log(" MODEL: Request to insert a new user into the database");

    let values = [name ,email, password, city, country];
    const conn = await db.getPool().getConnection();
    const query = 'INSERT INTO User (name, email, password, city, country) VALUES (?, ?, ?, ?, ?)';
    const [result, _] = await conn.query(query, values);
    console.log(`Inserted user with id ${result.insertId}`);

    return result.insertId;
};

exports.retrieveUser = async function(userID) {
    console.log(" MODEL: Request to get user from the database");

    let values = [userID];
    const conn = await db.getPool().getConnection();
    const query = 'SELECT * FROM User WHERE user_id = ?';
    const [result, _] = await conn.query(query, values);

    console.log(result.length);
    return result;
};

exports.logUser = async function(email) {
    console.log(" MODEL: Request to log user");

    let values = [email];
    const conn = await db.getPool().getConnection();
    const query = 'SELECT user_id, password FROM User WHERE email = ?';
    const [result, _] = await conn.query(query, values);

    return result;
};