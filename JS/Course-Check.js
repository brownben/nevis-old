//////////////////////////////////////////////////////////////////
//                        Course-Check.js                       //
//////////////////////////////////////////////////////////////////
module.exports = {
    check: function (cardList, cardTimes, courseList, finishPunch) {
        cardCounter = 0
        courseCounter = 0
        errors = "";
        splitTimeswithCheck = [];

        while (cardCounter < cardList.length && courseCounter < courseList.length) {

            if (cardList[cardCounter] == courseList[courseCounter]) {
                splitTimeswithCheck.push(cardTimes[cardCounter])
            }
            else {
                match = false
                tempCardCounter = cardCounter + 1
                tempCourseCounter = courseCounter
                //console.log("----- Check for Extra Punch")
                while (tempCardCounter < cardList.length && tempCourseCounter < courseList.length) {
                    if (cardList[tempCardCounter] == courseList[tempCourseCounter]) {

                        cardCounter = tempCardCounter
                        splitTimeswithCheck.push(cardTimes[cardCounter])

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
                            errors = errors + "Mispunch Punch " + (tempCourseCounter - courseCounter)
                            splitTimeswithCheck.push('---')

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
                            errors = errors + "Wrong Punch" + (tempCourseCounter - courseCounter)
                            splitTimeswithCheck.push('---')
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
                        errors = errors + "Retired"
                    }
                    else {
                        errors = errors + "Mispunched All Remaining"
                    }

                }
            }
            courseCounter = courseCounter + 1
            cardCounter = cardCounter + 1

        }
        return [errors, splitTimeswithCheck]
    }
}