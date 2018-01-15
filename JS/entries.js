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
document.getElementById('add-entry').addEventListener('click', function () {

    document.getElementById('entries-menu').setAttribute('style', 'display:none;')
    document.getElementById('entries-add-menu').setAttribute('style', 'display:block;')
    document.getElementById('entries').setAttribute('style', 'display:block;')
    document.getElementById('entry-search').setAttribute('style', 'display:none;')
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

//Blank Entry

document.getElementById('entry-clear').addEventListener('click', function () {
    blankEntry()
})

// Search Entries
document.getElementById('search-entries').addEventListener('click', function () {
    document.getElementById('search-output').innerHTML = ""
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
        var card = document.createElement('div')
        card.className = 'entry-card';
        card.id = "E" + entryCounter;
        card.innerHTML = "<p>" + entry.name + " - " + entry.siid + ' - ' + entry.course + "</p>"
        document.getElementById('search-output').appendChild(card)
        entryCounter++
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
        li.id = 'one'
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
        li.id = 'one'
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