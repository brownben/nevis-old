//////////////////////////////////////////////////////////////////
//                           entries.js                         //
//////////////////////////////////////////////////////////////////

// Add and View Entries                                         //

// Require  CryptJS for Encryption
const CryptoJS = require('crypto-js').AES;
var encryptionKey = 'orienteer';

// Database
const loki = require('lokijs');

var db = new loki('./databases/nevis.db', {
    autoload: true,
    autoloadCallback: databaseInitialize
});

function databaseInitialize() {
    competitors = db.getCollection("competitors");
    if (competitors === null) {
        competitors = db.addCollection("competitors");
    }
}

function blankEntry() {
    document.getElementById('entries-name').value = "";
    document.getElementById('entries-siid').value = "";
    document.getElementById('entries-club').value = "";
    document.getElementById('entries-age-class').value = "";
    document.getElementById('entries-course').value = "";
    document.getElementById('entries-nc').value = false;
}

// Add Entry
document.getElementById('entries-submit').addEventListener('click', function () {
    if (document.getElementById('entries-name').value != "" || document.getElementById('entries-siid').value != "") {

        competitors.insert({
            name: CryptoJS.encrypt(document.getElementById('entries-name').value, encryptionKey).toString(),
            siid: CryptoJS.encrypt(document.getElementById('entries-siid').value, encryptionKey).toString(),
            club: CryptoJS.encrypt(document.getElementById('entries-club').value, encryptionKey).toString(),
            ageClass: CryptoJS.encrypt(document.getElementById('entries-age-class').value, encryptionKey).toString(),
            course: CryptoJS.encrypt(document.getElementById('entries-course').value, encryptionKey).toString(),
            nonCompetitive: CryptoJS.encrypt(document.getElementById('entries-nc').value, encryptionKey).toString()
        });

        db.saveDatabase();

        blankEntry()

    }
});