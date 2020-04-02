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