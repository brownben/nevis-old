//////////////////////////////////////////////////////////////////
//                    encryption-adapter.js                     //
//////////////////////////////////////////////////////////////////

// Encrypt data on save for LokiJS                              //

var fs = require('fs');
var crypto = require('crypto');

function encrypt(input, key) {
    if (!key) {
        throw new Error('A key is required to encrypt');
    }
    try {

        const cipher = crypto.createCipher('aes192', key);
        encryptedValue = cipher.update(input, 'utf8', 'base64');
        encryptedValue += cipher.final('base64');

        var result = {
            version: "Nevis 2.0.0 : Pre-Release",
            type: "Full Database",
            date: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
            value: encryptedValue
        };
        return result;

    }
    catch (err) {
        throw new Error('Unable to encrypt value due to: ' + err);
    }
}


function decrypt(input, key) {

    // Ensure we have something to decrypt
    if (!input) {
        throw new Error('You must provide a value to decrypt');
    }
    // Ensure we have the key used to encrypt this value
    if (!key) {
        throw new Error('A key is required to decrypt');
    }

    // If we get a string as input, turn it into an object
    if (typeof input !== 'object') {
        try {
            input = JSON.parse(input);
        } catch (err) {
            throw new Error('Unable to parse string input as JSON');
        }
    }

    try {
        const decipher = crypto.createDecipher('aes192', key);
        decryptedValue = decipher.update(input.value, 'base64', 'utf8');
        decryptedValue += decipher.final('utf8');
        return decryptedValue

    }
    catch (err) {
        throw new Error('Unable to decrypt value due to: ' + err);
    }
};

function lokiCryptedFileAdapter() { };

lokiCryptedFileAdapter.prototype.setKey = function setKey(key) {
    this.key = key;
};

lokiCryptedFileAdapter.prototype.loadDatabase = function loadDatabase(dbname, callback) {
    var decrypted;
    var key = this.key;
    fs.exists(dbname, function (exists) {
        if (exists) {
            var decryptInput = fs.readFileSync(dbname, 'utf8');
            decrypted = decrypt(decryptInput, key);
        }
        if (typeof (callback) === 'function') {
            callback(decrypted);
        }
        else {
            console.log(decrypted);
        }
    });
}

lokiCryptedFileAdapter.prototype.saveDatabase = function saveDatabase(dbname, dbstring, callback) {
    var encrypted = encrypt(dbstring, this.key);
    fs.writeFileSync(dbname, JSON.stringify(encrypted, null, '  '), 'utf8');
    if (typeof (callback) === 'function') {
        callback();
    }
}

module.exports = new lokiCryptedFileAdapter;
exports.lokiCryptedFileAdapter = lokiCryptedFileAdapter;