//////////////////////////////////////////////////////////////////
//                           courses.js                         //
//////////////////////////////////////////////////////////////////

// Import courses from course planning programs                 //

var fs = require('fs');


// Import from JSON

document.getElementById('courses-json-import').addEventListener('click', function () {
    ipc.send('open-course-file-dialog')

})

ipc.on('course-file', function (event, path) {

    fs.exists(path[0], function (exists) {
        if (exists) {
            var courseFile = fs.readFileSync(path[0], 'utf8');
            courses.insert(JSON.parse(courseFile))

            console.log("Course Imported")
            db.saveDatabase();

        }
    })
})