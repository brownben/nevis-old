//////////////////////////////////////////////////////////////////
//                           entries.js                         //
//////////////////////////////////////////////////////////////////

// Add and View Entries                                         //
function calculateTime(startRaw, finishRaw) {
    // Calculate time taken from start to finish from the raw start and finish times
    // Make sure numbers have 2 digits
    if (startRaw > finishRaw) {
        finishRaw = finishRaw + 43200
    }
    var timeRaw = finishRaw - startRaw;
    var timeMinutes = (timeRaw - (timeRaw % 60)) / 60;
    var timeSeconds = timeRaw % 60;
    if (timeSeconds <= 9) {
        timeSeconds = '0' + timeSeconds;
    }
    if (timeMinutes <= 9) {
        timeMinutes = '0' + timeMinutes;
    }
    return [timeMinutes, timeSeconds, timeRaw];

}
function displayTime(time) {
    // Display Control Code and Time of punch in a human readable format
    // Make sure numbers have 2 digits


    var timeMinutes = (time - (time % 60)) / 60;
    var timeSeconds = time % 60;
    if (timeSeconds <= 9 && timeSeconds >= 0) {
        timeSeconds = '0' + timeSeconds;
    }
    if (timeMinutes <= 9 && timeMinutes >= 0) {
        timeMinutes = '0' + timeMinutes;
    }


    return timeMinutes + ":" + timeSeconds;

}

function blankEntry() {
    document.getElementById('entries-name').value = "";
    document.getElementById('entries-siid').value = "";
    document.getElementById('entries-club').value = "";
    document.getElementById('entries-age-class').value = "";
    document.getElementById('entries-mem-no').value = "";
    document.getElementById('entries-course').innerText = 'Course';
    document.getElementById('entries-course').setAttribute('class', '')
    document.getElementById('entries-course').setAttribute('style', 'color:#BDBDBD')
    document.getElementById('entries-nc').value = false;
}
function assignCourseDropdownHandler() {
    if (this.innerText == "") {
        document.getElementById('search-course-button').innerText = 'Course';
        document.getElementById('search-course-button').setAttribute('class', '')
        document.getElementById('search-course-button').setAttribute('style', 'color:#BDBDBD')
    }
    else {
        document.getElementById('search-course-button').innerText = this.innerText;
        document.getElementById('search-course-button').setAttribute('style', 'color:black')
    }

    document.getElementById('search-course-dropdown').setAttribute('class', 'hidden')
    document.getElementById('search-course-button').setAttribute('class', '')
}
function assignCourseEnterDropdownHandler() {
    if (this.innerText == "") {
        document.getElementById('entries-course').innerText = 'Course';
        document.getElementById('entries-course').setAttribute('class', '')
        document.getElementById('entries-course').setAttribute('style', 'color:#BDBDBD')
    }
    else {
        document.getElementById('entries-course').innerText = this.innerText;
        document.getElementById('entries-course').setAttribute('style', 'color:black')
    }

    document.getElementById('entries-course-dropdown').setAttribute('class', 'hidden')
    document.getElementById('entries-course').setAttribute('class', '')
}
var currentViewEntry = 0;
function viewEditEntry() {
    blankEntry()
    var lokiEntryID = parseInt(this.id.split("E")[1]);
    currentViewEntry = lokiEntryID;

    document.getElementById('entries-menu').setAttribute('style', 'display:none;')
    document.getElementById('entries-update-menu').setAttribute('style', 'display:block;')
    document.getElementById('entries').setAttribute('style', 'display:block;')
    document.getElementById('entry-search').setAttribute('style', 'display:none;')


    var entryToUpdate = competitors.findOne({ $loki: lokiEntryID });
    if (entryToUpdate.name != null) {
        document.getElementById('entries-name').value = entryToUpdate.name;
    }

    if (entryToUpdate.siid != null) {
        document.getElementById('entries-siid').value = entryToUpdate.siid;
    }
    if (entryToUpdate.club != null) {
        document.getElementById('entries-club').value = entryToUpdate.club;
    }
    if (entryToUpdate.ageClass != null) {
        document.getElementById('entries-age-class').value = entryToUpdate.ageClass;
    }
    if (entryToUpdate.membershipNumber != null) {
        document.getElementById('entries-mem-no').value = entryToUpdate.membershipNumber;
    }
    if (entryToUpdate.course != null || entryToUpdate.course != "undefined") {
        document.getElementById('entries-course').innerText = entryToUpdate.course;
        document.getElementById('search-course-button').setAttribute('style', 'color:black')
        document.getElementById('search-course-button').setAttribute('class', '')
    }
    else {
        document.getElementById('entries-course').innerText = "Course";

    }
    document.getElementById('entries-nc').value = entryToUpdate.nonCompetitive;
    if (entryToUpdate.downloadID != null) {
        document.getElementById('entry-download').setAttribute('style', 'display:block')
        releventDownload = downloads.findOne({ $loki: entryToUpdate.downloadID })

        if (releventDownload.time == null || releventDownload.time == "") {
            document.getElementById('entry-download-time').innerText = "Time: " + calculateTime(releventDownload.start, releventDownload.finish)[0] + ":" + calculateTime(releventDownload.start, releventDownload.finish)[1];

        }
        else {

            if (releventDownload.time.type == "string") {
                document.getElementById('entry-download-time').innerText = "Time: " + releventDownload.time;

            }
            else {
                document.getElementById('entry-download-time').innerText = "Time: " + displayTime(parseInt(releventDownload.time));

            }

        }
        document.getElementById('entry-download-controls').innerText = "Controls: "
        var controlCounter = 1;
        for (var control of releventDownload.controlCodes) {
            if (controlCounter < releventDownload.controlCodes.length) {
                document.getElementById('entry-download-controls').innerText = document.getElementById('entry-download-controls').innerText + control.toString() + ", "

            }
            else {
                document.getElementById('entry-download-controls').innerText = document.getElementById('entry-download-controls').innerText + control.toString()
            }
            controlCounter++
        }

    }
}

document.getElementById('add-entry').addEventListener('click', function () {
    document.getElementById('entries-menu').setAttribute('style', 'display:none;')
    document.getElementById('entries-update-menu').setAttribute('style', 'display:none;')
    document.getElementById('entries-add-menu').setAttribute('style', 'display:block;')
    document.getElementById('entries').setAttribute('style', 'display:block;')
    document.getElementById('entry-search').setAttribute('style', 'display:none;')
    document.getElementById('entry-download').setAttribute('style', 'display:none')
    blankEntry()
})

// Add Entry
document.getElementById('entries-submit').addEventListener('click', function () {
    document.getElementById('entry-error').setAttribute('style', 'display:none')
    if (document.getElementById('entries-name').value != "" || document.getElementById('entries-siid').value != "") {
        try {
            if (document.getElementById('entries-course').innerText == "Course") {
                competitors.insert({
                    name: document.getElementById('entries-name').value,
                    siid: document.getElementById('entries-siid').value,
                    club: document.getElementById('entries-club').value,
                    membershipNumber: document.getElementById('entries-mem-no').value,
                    ageClass: document.getElementById('entries-age-class').value,
                    course: "",
                    nonCompetitive: document.getElementById('entries-nc').value,
                    downloadID: null
                });
            }
            else {
                competitors.insert({
                    name: document.getElementById('entries-name').value,
                    siid: document.getElementById('entries-siid').value,
                    club: document.getElementById('entries-club').value,
                    membershipNumber: document.getElementById('entries-mem-no').value,
                    ageClass: document.getElementById('entries-age-class').value,
                    course: document.getElementById('entries-course').innerText,
                    nonCompetitive: document.getElementById('entries-nc').value,
                    downloadID: null
                });
            }


            db.saveDatabase();
            blankEntry()
        }

        catch (exception) {

            document.getElementById('entry-error').setAttribute('style', 'display:block')
        }
        db.saveDatabase();
    }
});
// Update Entry
document.getElementById('entries-update').addEventListener('click', function () {
    document.getElementById('entry-error').setAttribute('style', 'display:none')
    if (document.getElementById('entries-name').value != "" || document.getElementById('entries-siid').value != "") {
        updatedEntry = competitors.findOne({ $loki: currentViewEntry })
        updatedEntry.name = document.getElementById('entries-name').value
        updatedEntry.siid = document.getElementById('entries-siid').value
        updatedEntry.club = document.getElementById('entries-club').value
        updatedEntry.membershipNumber = document.getElementById('entries-mem-no').value
        updatedEntry.ageClass = document.getElementById('entries-age-class').value
        updatedEntry.nonCompetitive = document.getElementById('entries-nc').value

        if (document.getElementById('entries-course').innerText == "Course") {
            updatedEntry.course = ""
        }
        else {
            updatedEntry.course = document.getElementById('entries-course').innerText
        }
        competitors.update(updatedEntry)
        db.saveDatabase();
        blankEntry()
        document.getElementById('entries-menu').setAttribute('style', 'display:block;')
        document.getElementById('entries').setAttribute('style', 'display:none;')
        document.getElementById('entries-add-menu').setAttribute('style', 'display:none;')
        document.getElementById('entries-update-menu').setAttribute('style', 'display:none;')
        document.getElementById('entry-search').setAttribute('style', 'display:block;')
        document.getElementById('entry-download').setAttribute('style', 'display:none')
        currentViewEntry = 0;


    }
});
// Delete Entry
document.getElementById('entries-delete').addEventListener('click', function () {
    document.getElementById('entry-error').setAttribute('style', 'display:none')
    competitors.removeWhere({ $loki: currentViewEntry });
    db.saveDatabase();
    blankEntry()
    document.getElementById('entries-menu').setAttribute('style', 'display:block;')
    document.getElementById('entries').setAttribute('style', 'display:none;')
    document.getElementById('entries-add-menu').setAttribute('style', 'display:none;')
    document.getElementById('entries-update-menu').setAttribute('style', 'display:none;')
    document.getElementById('entry-search').setAttribute('style', 'display:block;')
    document.getElementById('entry-download').setAttribute('style', 'display:none')
    currentViewEntry = 0;
});
//Blank Entry

document.getElementById('entry-clear').addEventListener('click', function () {
    blankEntry()
})

// Search Entries
document.getElementById('search-entries').addEventListener('click', function () {
    document.getElementById('search-output-table').innerHTML = ""
    if (document.getElementById('name-search').value == "" && document.getElementById('siid-search').value == "" && document.getElementById('search-course-button').innerText == "Course") {
        foundEntries = competitors.find()
    }
    else if (document.getElementById('name-search').value == "" && document.getElementById('siid-search').value == "") {
        foundEntries = competitors.find({
            'course': document.getElementById('search-course-button').innerText
        })
    }
    else if (document.getElementById('name-search').value == "" && document.getElementById('search-course-button').innerText == 'Course') {
        foundEntries = competitors.find({
            'siid': document.getElementById('siid-search').value,
        })
    }

    else if (document.getElementById('siid-search').value == "" && document.getElementById('search-course-button').innerText == 'Course') {
        foundEntries = competitors.find({
            'name': { '$contains': document.getElementById('name-search').value },
        })
    }
    else if (document.getElementById('name-search').value == "") {
        foundEntries = competitors.find({
            'siid': document.getElementById('siid-search').value,
            'course': document.getElementById('search-course-button').innerText
        })
    }
    else if (document.getElementById('siid-search').value == "") {
        foundEntries = competitors.find({
            'name': { '$contains': document.getElementById('name-search').value },
            'course': document.getElementById('search-course-button').innerText
        })
    }
    else if (document.getElementById('search-course-button').innerText == 'Course') {
        foundEntries = competitors.find({
            'name': { '$contains': document.getElementById('name-search').value },
            'siid': document.getElementById('siid-search').value
        })
    }
    else {
        foundEntries = competitors.find({
            'name': { '$contains': document.getElementById('name-search').value },
            'siid': document.getElementById('siid-search').value,
            'course': document.getElementById('search-course-button').innerText
        })
    }

    var entryCounter = 1
    for (entry of foundEntries) {
        var card = document.createElement('tr')
        card.className = '';
        card.id = "E" + entry.$loki;
        card.onclick = viewEditEntry;
        if (entry.course == "undefined" || entry.course == null) {
            card.innerHTML = "<td>" + entry.name + "</td><td>" + entry.siid + '</td><td> - </td>';

        }
        else {
            card.innerHTML = "<td>" + entry.name + "</td><td>" + entry.siid + '</td><td>' + entry.course + "</td>"

        }
        document.getElementById('search-output-table').appendChild(card)
        document.getElementById('search-output').setAttribute('class', '')
        entryCounter++
    }
    if (foundEntries < 1) {
        document.getElementById('search-output').setAttribute('class', 'hidden')
    }
})

document.getElementById('search-course-button').addEventListener('click', function () {
    if (document.getElementById('search-course-dropdown').getAttribute('class') == '') {
        document.getElementById('search-course-dropdown').setAttribute('class', 'hidden')
        document.getElementById('search-course-button').setAttribute('class', '')
    }
    else {
        document.getElementById('search-course-dropdown').innerHTML = '';
        document.getElementById('search-course-dropdown').setAttribute('class', '')
        document.getElementById('search-course-button').setAttribute('class', 'open')
        var allCourses = courses.find();

        var li = document.createElement('li');

        li.innerHTML = "";
        li.onclick = assignCourseDropdownHandler;
        document.getElementById('search-course-dropdown').appendChild(li);
        for (course of allCourses) {
            var li = document.createElement('li');
            li.innerHTML = course.name;
            li.onclick = assignCourseDropdownHandler;
            document.getElementById('search-course-dropdown').appendChild(li);
        }

    }

})

document.getElementById('entries-course').addEventListener('click', function () {
    if (document.getElementById('entries-course-dropdown').getAttribute('class') == '') {
        document.getElementById('entries-course-dropdown').setAttribute('class', 'hidden')
        document.getElementById('entries-course').setAttribute('class', '')
    }
    else {
        document.getElementById('entries-course-dropdown').innerHTML = '';
        document.getElementById('entries-course-dropdown').setAttribute('class', '')
        document.getElementById('entries-course').setAttribute('class', 'open')
        var allCourses = courses.find();

        var li = document.createElement('li');

        li.innerHTML = "";
        li.onclick = assignCourseEnterDropdownHandler;
        document.getElementById('entries-course-dropdown').appendChild(li);
        for (course of allCourses) {
            var li = document.createElement('li');
            li.innerHTML = course.name;
            li.onclick = assignCourseEnterDropdownHandler;
            document.getElementById('entries-course-dropdown').appendChild(li);
        }
    }

})