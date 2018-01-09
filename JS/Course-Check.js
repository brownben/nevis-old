//////////////////////////////////////////////////////////////////
//                        Course-Check.js                       //
//////////////////////////////////////////////////////////////////
module.exports = {
    check: function (cardList, courseList, finishPunch) {
        cardCounter = 0
        courseCounter = 0
        errors = "";

        while (cardCounter < cardList.length && courseCounter < courseList.length) {

            if (cardList[cardCounter] == courseList[courseCounter]) {

            }
            else {
                match = false
                tempCardCounter = cardCounter + 1
                tempCourseCounter = courseCounter
                //console.log("----- Check for Extra Punch")
                while (tempCardCounter < cardList.length && tempCourseCounter < courseList.length) {
                    if (cardList[tempCardCounter] == courseList[tempCourseCounter]) {

                        cardCounter = tempCardCounter
                        match = true
                        break
                    }
                    else {
                        tempCardCounter = tempCardCounter + 1
                    }

                }

                if (match == false) {
                    //console.log("----- Check for MP")
                    tempCardCounter = cardCounter
                    tempCourseCounter = courseCounter + 1
                    while (tempCardCounter < cardList.length && tempCourseCounter < courseList.length) {
                        if (cardList[tempCardCounter] == courseList[tempCourseCounter]) {
                            error = error + "Mispunch Punch " + (tempCourseCounter - courseCounter)
                            courseCounter = tempCourseCounter
                            match = true
                            break
                        }
                        else {
                            tempCourseCounter = tempCourseCounter + 1
                        }
                    }
                }

                if (match == false) {
                    //console.log("----- Check for WP")
                    tempCardCounter = cardCounter + 1
                    tempCourseCounter = courseCounter + 1
                    while (tempCardCounter < cardList.length && tempCourseCounter < courseList.length) {
                        if (cardList[tempCardCounter] == courseList[tempCourseCounter]) {
                            error = error + "Wrong Punch" + (tempCourseCounter - courseCounter)
                            cardCounter = tempCardCounter - 1
                            courseCounter = tempCourseCounter - 1
                            match = true
                            break
                        }
                        else {
                            tempCourseCounter = tempCourseCounter + 1
                            tempCardCounter = cardCounter + 1
                        }
                    }
                }
                if (match == false) {
                    //console.log("----- No Match can be found")
                    if (finishPunch == null) {
                        error = error + "Retired"
                    }
                    else {
                        error = error + "Mispunched All Remaining"
                    }

                }
            }
            courseCounter = courseCounter + 1
            cardCounter = cardCounter + 1

        }
        return error
    }

}