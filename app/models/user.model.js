const db = require('../../config/db');

exports.validateUser = async function(token) {
    console.log(" MODEL: Request to validate a user token");

    let values = [token];
    const conn = await db.getPool().getConnection();
    const query = 'SELECT user_id from User WHERE auth_token = ?';
    const [result, _] = await conn.query(query, values);

    conn.release();
    return result;
};

exports.createUser = async function(name, email, password, city, country) {
    console.log(" MODEL: Request to insert a new user into the database");

    let values = [name ,email, password, city, country];
    const conn = await db.getPool().getConnection();
    const query = 'INSERT INTO User (name, email, password, city, country) VALUES (?, ?, ?, ?, ?)';
    const [result, _] = await conn.query(query, values);
    console.log(`Inserted user with id ${result.insertId}`);
    conn.release();
    return result.insertId;
};

exports.retrieveUser = async function(userID, token) {
    console.log(" MODEL: Request to get an user from the database");

    let values = [userID, token];
    const conn = await db.getPool().getConnection();
    let query = 'SELECT name, city, country, email FROM User WHERE user_id = ? and auth_token = ?';
    const [result, _] = await conn.query(query, values);
    if (result.length === 0) {
        let values2 = [userID];
        query = 'SELECT name, city, country FROM User WHERE user_id = ?';
        const [result2, _] = await conn.query(query, values);
        conn.release();
        return result2;
    } else {
        conn.release();
        return result;
    }



};

exports.logUser = async function(email) {
    console.log(" MODEL: Request to log user");

    let values = [email];
    const conn = await db.getPool().getConnection();
    const query = 'SELECT user_id, password FROM User WHERE email = ?';
    const [result, _] = await conn.query(query, values);
    conn.release();
    return result;
};

exports.setToken = async function(email, token){
    console.log(" MODEL: Request to set a token in the database");

    let values = [token, email];
    const conn = await db.getPool().getConnection();
    const query = 'UPDATE User SET auth_token = ? WHERE email = ?';

    await conn.query(query, values);
    conn.release();
};

exports.deleteToken = async function(token) {
    console.log(" MODEL: Request to delete a token from the database");

    let values = [token];
    const conn = await db.getPool().getConnection();
    const query = 'UPDATE User SET auth_token = NULL WHERE auth_token = ?';
    const [result, _] = await conn.query(query, values);

    conn.release();
    return result;
};