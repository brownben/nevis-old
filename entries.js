//////////////////////////////////////////////////////////////////
//                           entries.js                         //
//////////////////////////////////////////////////////////////////

// Add and View Entries                                         //

// Database
const loki = require('lokijs');

var db = new loki('./nevis.db', {
    autoload: true,
    autoloadCallback: databaseInitialize
});

function databaseInitialize() {
    if (!db.getCollection("competitors")) {
        db.addCollection("competitors");
    }
};
var competitors = db.getCollection('competitors');

document.getElementById('entries-submit').addEventListener('click', function () {
    competitors.insert({
        name: document.getElementById('entries-name').value,
        ageClass: document.getElementById('entries-age-class').value,
        course: document.getElementById('entries-course').value
    });
    document.getElementById('entries-name').value = "";
    document.getElementById('entries-age-class').value = "";
    course: document.getElementById('entries-course').value = "";
    db.saveDatabase();
});