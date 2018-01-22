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
    downloads = db.getCollection("downloads");
    if (downloads === null) {
        downloads = db.addCollection("downloads");
    }
    downloads.insert({
        'siid': '9010222',
        'time': '454'
    })
    downloads.insert({
        'siid': '9030812',
        'time': '455'
    })
    downloads.insert({
        'siid': '422749',
        'time': '1000'
    })
    downloads.insert({
        'siid': '422750',
        'time': '30'
    })
    competitors = db.getCollection("competitors");
    if (competitors === null) {
        competitors = db.addCollection("competitors", {
            unique: ['siid']
        });
    }
    competitors.insert({
        'name': 'Bob',
        'course': 'Medium',
        'siid': '9010222',
        'downloadID': 1
    })
    competitors.insert({
        'name': 'Humpty',
        'course': 'Medium',
        'siid': '9030812',
        'downloadID': 2
    })
    competitors.insert({
        'name': 'Jill',
        'course': 'Medium',
        'siid': '422749',
        'downloadID': 3
    })
    competitors.insert({
        'name': 'Jack',
        'course': 'Medium',
        'siid': '422750',
        'downloadID': 4
    })

    db.saveDatabase()
}
