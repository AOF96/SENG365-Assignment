const db = require('../../config/db');

exports.validateUser = async function(token) {

    let values = [token];
    const conn = await db.getPool().getConnection();
    const query = 'SELECT user_id from User WHERE auth_token = ?';
    const [result, _] = await conn.query(query, values);

    conn.release();
    return result;
};

exports.userExists = async function(userID) {

    let result = false;
    let input = [userID];
    const conn = await db.getPool().getConnection();
    const query = 'SELECT * from User WHERE user_id = ?';
    const [outcome, _] = await conn.query(query, input);
    conn.release();

    if (outcome.length > 0) {
        result = true;
    }

    return result;
};

exports.getCurrentPassword = async function(id) {
    let values = [id];
    const conn = await db.getPool().getConnection();
    const query = 'SELECT password from User WHERE user_id = ?';
    const [result, _] = await conn.query(query, values);

    conn.release();
    return result;
};

exports.checkEmail = async function(email) {

    const conn = await db.getPool().getConnection();
    const query = 'SELECT email from User';
    const [result, _] = await conn.query(query);

    let isPresent = false;
    for (let i = 0; i < result.length; i++) {
        if (result[i].email === email) {
            isPresent = true;
            break;
        }
    }

    conn.release();
    return isPresent;
};

exports.createUser = async function(name, email, password, city, country) {

    let values = [name ,email, password, city, country];
    const conn = await db.getPool().getConnection();
    const query = 'INSERT INTO User (name, email, password, city, country) VALUES (?, ?, ?, ?, ?)';
    const [result, _] = await conn.query(query, values);

    conn.release();
    return result.insertId;
};

exports.retrieveUser = async function(userID, token) {

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

    let values = [email];
    const conn = await db.getPool().getConnection();
    const query = 'SELECT user_id, password FROM User WHERE email = ?';
    const [result, _] = await conn.query(query, values);

    conn.release();
    return result;
};

exports.setToken = async function(email, token){

    let values = [token, email];
    const conn = await db.getPool().getConnection();
    const query = 'UPDATE User SET auth_token = ? WHERE email = ?';

    await conn.query(query, values);
    conn.release();
};

exports.deleteToken = async function(token) {

    let values = [token];
    const conn = await db.getPool().getConnection();
    const query = 'UPDATE User SET auth_token = NULL WHERE auth_token = ?';
    const [result, _] = await conn.query(query, values);

    conn.release();
    return result;
};

exports.updateUserInfo = async function(value, id, type) {

    let values = [value, id];
    const conn = await db.getPool().getConnection();
    const query = 'UPDATE User SET '.concat(type," = ? WHERE user_id = ?");
    let result = await conn.query(query, values);

    conn.release();
};

exports.getPhotoFilename = async function(id) {

    let input = [id];
    const conn = await db.getPool().getConnection();
    const query = 'SELECT photo_filename FROM User WHERE user_id = ?';
    const [result, _] = await conn.query(query, input);
    conn.release();

    return result;
};

exports.saveFileName = async function(fileName, userID) {

    let inputs = [fileName, userID];
    const conn = await db.getPool().getConnection();
    const query = 'UPDATE User SET photo_filename = ? WHERE user_id = ?';
    await conn.query(query, inputs);
    conn.release();
};

exports.deleteFilename = async function(userID) {

    let input = [userID];
    const conn = await db.getPool().getConnection();
    const query = 'UPDATE User SET photo_filename = NULL WHERE user_id = ?';
    await conn.query(query, input);
    conn.release();
};