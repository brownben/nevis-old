//////////////////////////////////////////////////////////////////
//                           entries.js                         //
//////////////////////////////////////////////////////////////////

// Add and View Entries                                         //

function blankEntry() {
    document.getElementById('entries-name').value = "";
    document.getElementById('entries-siid').value = "";
    document.getElementById('entries-club').value = "";
    document.getElementById('entries-age-class').value = "";
    document.getElementById('entries-course').value = "";
    document.getElementById('entries-nc').value = false;
}

document.getElementById('add-entry').addEventListener('click', function () {

    document.getElementById('entries-menu').setAttribute('style', 'display:none;')
    document.getElementById('entries-add-menu').setAttribute('style', 'display:block;')
    document.getElementById('entries').setAttribute('style', 'display:block;')
})

// Add Entry
document.getElementById('entries-submit').addEventListener('click', function () {
    document.getElementById('entry-error').setAttribute('style', 'display:none')
    if (document.getElementById('entries-name').value != "" || document.getElementById('entries-siid').value != "") {
        try {
            competitors.insert({
                name: document.getElementById('entries-name').value,
                siid: document.getElementById('entries-siid').value,
                club: document.getElementById('entries-club').value,
                ageClass: document.getElementById('entries-age-class').value,
                course: document.getElementById('entries-course').value,
                nonCompetitive: document.getElementById('entries-nc').value,
                downloadID: null
            });

            db.saveDatabase();
            blankEntry()
        }

        catch (exception) {

            document.getElementById('entry-error').setAttribute('style', 'display:block')
        }
        db.saveDatabase();
    }
});

//Blank Entry

document.getElementById('entry-clear').addEventListener('click', function () {
    blankEntry()
})