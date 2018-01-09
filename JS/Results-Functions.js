//////////////////////////////////////////////////////////////////
//                     results-functions.js                     //
//////////////////////////////////////////////////////////////////

function calculateTime(time) {
    if (time.type == 'string') {
        return time
    }
    else {

        var timeMinutes = (time - (time % 60)) / 60;
        var timeSeconds = time % 60;
        if (timeSeconds <= 9) {
            timeSeconds = '0' + timeSeconds;
        }
        if (timeMinutes <= 9) {
            timeMinutes = '0' + timeMinutes;
        }
        return timeMinutes + " : " + timeSeconds;
    }


}

module.exports = {

    refreshResults: function () {
        document.getElementById('results').innerHTML = ""
        var listOfCourses = courses.find();
        for (course of listOfCourses) {

            var competitorsOnCourse = competitors.find({
                '$and': [{
                    'course': course.name
                }, {
                    'downloadID': { '$ne': null }
                }]
            })
            for (competitor of competitorsOnCourse) {

                competitor.time = downloads.findOne({ '$loki': competitor.downloadID }).time

            }

            results = competitorsOnCourse.sort(function (a, b) {
                return a.time - b.time;
            });
            var h1 = document.createElement('h2')
            h1.innerText = course.name
            document.getElementById('results').appendChild(h1)
            var table = document.createElement('table');
            table.id = course.name
            table.innerHTML = "<tr><th>Pos.</th><th>Name</th><th class='class'>Class</th><th class='club'>Club</th><th>Time</th></tr>"
            document.getElementById('results').appendChild(table);
            counter = 1
            for (result of results) {
                var tr = document.createElement('tr')
                if (result.class == null) {
                    result.class = ""
                }
                if (result.club == null) {
                    result.club = ""
                }
                if (result.nonCompetitive == true) {
                    tr.innerHTML = "<td> n/c </td><td>" + result.name + "</td><td class='class'>" + result.class + "</td><td class='club'>" + result.club + "</td><td>" +calculateTime(result.time) + "</td>"
                    document.getElementById(course.name).appendChild(tr)
                }
                else {
                    tr.innerHTML = "<td>" + counter + "</td><td>" + result.name + "</td><td class='class'>" + result.class + "</td><td class='club'>" + result.club + "</td><td>" +calculateTime(result.time) + "</td>"
                    document.getElementById(course.name).appendChild(tr)
                    counter++
                }

            }

        }
    }
}