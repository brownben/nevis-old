//////////////////////////////////////////////////////////////////
//                           entries.js                         //
//////////////////////////////////////////////////////////////////

// Add and View Entries                                         //

// Encryption for Database
var cryptedFileAdapter = require('./encryption-adapter.js');
cryptedFileAdapter.setKey('orienteer');

// Set up Database
const loki = require('lokijs');

var db = new loki('./nevis.db', {
    adapter: cryptedFileAdapter,
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
            name: document.getElementById('entries-name').value,
            siid: document.getElementById('entries-siid').value,
            club: document.getElementById('entries-club').value,
            ageClass: document.getElementById('entries-age-class').value,
            course: document.getElementById('entries-course').value,
            nonCompetitive: document.getElementById('entries-nc').value
        });

        db.saveDatabase();

        blankEntry()

    }
});