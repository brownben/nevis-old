//////////////////////////////////////////////////////////////////
//                           results.js                         //
//////////////////////////////////////////////////////////////////

// Display and Export Results                                   //

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
const results = require('./Results-Functions.js')

const htmlHead = "<!DOCTYPE html><html><head><title>Nevis</title><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1,minimum-scale=1'><style>@font-face{font-family:'Roboto';font-style:normal;font-weight:500;src:local('Roboto Medium'),local(Roboto-Medium),url(https://fonts.gstatic.com/s/roboto/v18/oHi30kwQWvpCWqAhzHcCSBJtnKITppOI_IvcXXDNrsc.woff2) format('woff2');unicode-range:U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116}@font-face{font-family:'Roboto';font-style:normal;font-weight:400;src:local(Roboto),local(Roboto-Regular),url(https://fonts.gstatic.com/s/roboto/v18/ek4gzZ-GeXAPcSbHtCeQI_esZW2xOQ-xsNqO47m55DA.woff2) format('woff2');unicode-range:U+0460-052F,U+1C80-1C88,U+20B4,U+2DE0-2DFF,U+A640-A69F,U+FE2E-FE2F}@font-face{font-family:'Roboto';font-style:normal;font-weight:300;src:local('Roboto Light'),local(Roboto-Light),url(https://fonts.gstatic.com/s/roboto/v16/Hgo13k-tfSpn0qi1SFdUfVtXRa8TVwTICgirnJhmVJw.woff2) format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2212,U+2215}html,body{margin:0;padding:0;width:100%;height:100%}header{background-color:#29B6F6;color:#fff;font-family:Roboto,Segoe UI,sans-serif;font-weight:300;width:100%;margin:0;height:55px}main{margin-top:20px;width:80%;margin-left:10%;min-height:calc(100% - 130px)}footer{background-color:#0277BD;margin-top:20px;color:#fff;font-family:Roboto,Segoe UI,sans-serif;font-weight:300;width:100%;margin-bottom:0}h1{width:calc(100% - 10px);margin:0;font-size:35px;padding:5px;text-align:center;font-weight:300;text-overflow:ellipsis;white-space:nowrap;overflow:hidden}h2{margin:10px 0;padding:5px;font:300 35px Roboto,'Segoe UI',sans-serif}p{padding:5px;width:calc(100% - 10px);text-align:center;height:25px;margin:0;padding-top:5px;text-overflow:ellipsis;white-space:nowrap;overflow:hidden;font:100 18px Roboto,'Segoe UI',sans-serif}table{width:100%;text-align:center;border-collapse:collapse}tr{transition:.5s}tr:nth-child(even){background-color:#BBDEFB;border:0}tr:hover{background-color:#90CAF9}th{padding:7px;font:500 16px Roboto,'Segoe UI',sans-serif}td{padding:7px;border:0;font:300 16px Roboto,'Segoe UI',sans-serif}@media(max-width:550px){.info{display:none}}@media(max-width:500px){.club{display:none}}@media(max-width:400px){.class{display:none}}</style></head><body><header><h1>"
const htmlHeaderNext = "- Results </h1></header><main>"
const htmlFooter = "</table></div></main><footer><p> Updated: "
const htmlFooterNext = "- Results from Nevis</p></footer></body></html>"

document.getElementById('results-refresh').addEventListener('click', function () {
    results.refreshResults()
})
document.getElementById('results-html-single').addEventListener('click', function () {
    ipc.send('html-single-file-save')
})

document.getElementById('results-pdf').addEventListener('click', function () {



    htmlMain = ""
    var listOfCourses = courses.find();
    var courseCounter = 0;
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

        resultsSorted = competitorsOnCourse.sort(function (a, b) {
            return a.time - b.time;
        });
        if (competitorsOnCourse.length > 0) {
            if (courseCounter == 0) {
                htmlMain += "<div id='course'><h2>" + course.name + "</h2><table><tr><th>Pos.</th><th>Name</th><th class='class'>Class</th><th class='club'>Club</th><th>Time</th></tr>"
            }
            else {
                htmlMain += "</table></div><div id='course'><h2>" + course.name + "</h2><table><tr><th>Pos.</th><th>Name</th><th class='class'>Class</th><th class='club'>Club</th><th>Time</th></tr>"

            }
            counter = 1
            for (result of resultsSorted) {

                if (result.class == null) {
                    result.class = ""
                }
                if (result.club == null) {
                    result.club = ""
                }
                if (result.nonCompetitive == true) {
                    htmlMain += "<td> n/c </td><td>" + result.name + "</td><td class='class'>" + result.class + "</td><td class='club'>" + result.club + "</td><td>" + calculateTime(result.time) + "</td>"
                }
                else {
                    htmlMain += "<td>" + counter + "</td><td>" + result.name + "</td><td class='class'>" + result.class + "</td><td class='club'>" + result.club + "</td><td>" + calculateTime(result.time) + "</td>"
                    counter++
                }

            }
        }

        courseCounter++
    }

    ipc.send('pdf-results-start', htmlHead + htmlHeaderNext + htmlMain + htmlFooter + new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') + htmlFooterNext);

})
ipc.on('html-file', function (event, path) {
    var htmlMain = ""
    var listOfCourses = courses.find();
    var courseCounter = 0;
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

        resultsSorted = competitorsOnCourse.sort(function (a, b) {
            return a.time - b.time;
        });
        if (competitorsOnCourse.length > 0) {
            if (courseCounter == 0) {
                htmlMain += "<div id='course'><h2>" + course.name + "</h2><table><tr><th>Pos.</th><th>Name</th><th class='class'>Class</th><th class='club'>Club</th><th>Time</th></tr>"
            }
            else {
                htmlMain += "</table></div><div id='course'><h2>" + course.name + "</h2><table><tr><th>Pos.</th><th>Name</th><th class='class'>Class</th><th class='club'>Club</th><th>Time</th></tr>"

            }
            counter = 1
            for (result of resultsSorted) {

                if (result.class == null) {
                    result.class = ""
                }
                if (result.club == null) {
                    result.club = ""
                }
                if (result.nonCompetitive == true) {
                    htmlMain += "<td> n/c </td><td>" + result.name + "</td><td class='class'>" + result.class + "</td><td class='club'>" + result.club + "</td><td>" + calculateTime(result.time) + "</td>"
                }
                else {
                    htmlMain += "<td>" + counter + "</td><td>" + result.name + "</td><td class='class'>" + result.class + "</td><td class='club'>" + result.club + "</td><td>" + calculateTime(result.time) + "</td>"
                    counter++
                }

            }
        }

        courseCounter++
    }
    fs.writeFileSync(path, htmlHead + htmlHeaderNext + htmlMain + htmlFooter + new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') + htmlFooterNext, 'utf8');
})

