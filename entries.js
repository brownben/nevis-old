//////////////////////////////////////////////////////////////////
//                           entries.js                         //
//////////////////////////////////////////////////////////////////

// Add and View Entries                                         //

// Database
const loki = require('lokijs');

var db = new loki('./nevis.json');
var competitors = db.addCollection('competitors');

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
    console.log(competitors.data)
});