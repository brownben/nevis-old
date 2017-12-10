//////////////////////////////////////////////////////////////////
//                           entries.js                         //
//////////////////////////////////////////////////////////////////

// Add and View Entries                                         //

// Require  CryptJS for Encryption
const CryptJS = require('crypt-js').AES;
var encryptionKey = 'orienteer';

// Database
const loki = require('lokijs');

var db = new loki('./nevis.db', {
    autoload: true,
    autoloadCallback: databaseInitialize
});

function databaseInitialize() {
    competitors = db.getCollection("competitors");
    if (competitors === null) {
        competitors = db.addCollection("competitors");
    }
}

// Add Entry
document.getElementById('entries-submit').addEventListener('click', function () {
    if (document.getElementById('entries-name').value != "" || document.getElementById('entries-siid').value != "") {

        var name = document.getElementById('entries-name').value;
        var siid = document.getElementById('entries-siid').value;
        var club = document.getElementById('entries-club').value
        var ageClass = document.getElementById('entries-age-class').value;
        var course = document.getElementById('entries-course').value;
        var nonCompetitive = document.getElementById('entries-nc').value;

        competitors.insert({
            name: CryptoJS.encrypt(name, encryptionKey),
            siid: CryptoJS.encrypt(siid, encryptionKey),
            club: CryptoJS.encrypt(club, encryptionKey),
            ageClass: CryptoJS.encrypt(ageClass, encryptionKey),
            course: CryptoJS.encrypt(course, encryptionKey),
            nonCompetitive: CryptoJS.encrypt(nonCompetitive, encryptionKey)
        });

        db.saveDatabase();

        name = "";
        siid = "";
        club = "";
        ageClass = "";
        course = "";
        nonCompetitive = false;

    }
});