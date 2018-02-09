//////////////////////////////////////////////////////////////////
//                          downloads.js                        //
//////////////////////////////////////////////////////////////////
// Read and display the data coming from punches to a station   //
// Setup the whole Download screen                              //


/* ------ Import and Set Up Variables ----- */
// Libraries for reading  Data Verification
const crc = require('./CRC.js');
const course = require('./Course-Check.js')
const si = require('./SI-Variables.js');

/* ------ Download Class for Database ----- */
var download = function () {
    this.siid = '';
    this.time = '';
    this.start = 0;
    this.finish = 0;
    this.controlCodes = [];
    this.controlTimes = [];
    this.name = '';
    this.complete = false;
    this.cardType = '';
}

// Variables for Reading Cards
const card5 = new si.card5();
const card8 = new si.card8(); // Card 8,9 & P
const card10 = new si.card10(); //Card 10, 11 & SIAC
var currentDownload = new download();
var splitToPrint = [];

// Lengthen byteswhich start with 0
function lessThan2(object) {
    if (object.length < 2) {
        return "0" + object
    }
    else {
        return object
    }
}

/* ------ HTML Elements ----- */
const connect = document.getElementById('connect');

/* ----- Functions -----*/
function output(data, type) {
    // Display the data fromm download in #download-output as <p> with different stylings given by classes
    const downloadOutput = document.getElementById('download-output');
    if (type == 'error') {
        downloadOutput.innerHTML = downloadOutput.innerHTML + "<p class='error'>" + data + "</p>";
    }
    else if (type == 'connection') {
        downloadOutput.innerHTML = downloadOutput.innerHTML + "<p class='connection'>" + data + "</p>";
    }
    else if (type == 'big') {
        downloadOutput.innerHTML = downloadOutput.innerHTML + "<p class='big'>" + data + "</p>";
    }
    else {
        downloadOutput.innerHTML = downloadOutput.innerHTML + "<p>" + data + "</p>";
    }
    document.getElementById('scroll').scrollTop = downloadOutput.scrollHeight;
}

function printSplits(name, time, sicard, course, splits) {
    if (document.getElementById('printer-content').innerText != "No Printing") {
        thermalPrinter.init({
            type: 'epson',
            interface: "printer:" + document.getElementById('printer-content').innerText
        });
        thermalPrinter.isPrinterConnected(function (isConnected) {
            thermalPrinter.setTypeFontA();
            thermalPrinter.alignLeft();
            thermalPrinter.println(eventData.findOne().name + " - " + eventData.findOne().date)
            thermalPrinter.newLine();
            thermalPrinter.setTextQuadArea()
            thermalPrinter.setTypeFontB();
            thermalPrinter.println(name)
            thermalPrinter.setTextNormal()
            thermalPrinter.setTypeFontA();
            thermalPrinter.newLine();
            thermalPrinter.println("SI Card: " + sicard)
            thermalPrinter.println("Course: " + course)
            thermalPrinter.newLine();
            thermalPrinter.setTextQuadArea()
            thermalPrinter.setTypeFontB();
            thermalPrinter.println("Time: " + time.toString())
            thermalPrinter.setTextNormal()
            thermalPrinter.setTypeFontA();
            thermalPrinter.newLine();
            thermalPrinter.bold(true)
            thermalPrinter.setTypeFontB();
            thermalPrinter.println('Control                             Leg          Elapsed')
            thermalPrinter.setTypeFontA();
            thermalPrinter.bold(false)
            thermalPrinter.println("S                          00:00     00:00")
            for (split of splits) {
                thermalPrinter.println(split)
            }
            thermalPrinter.newLine();
            thermalPrinter.alignRight();
            thermalPrinter.bold(true)
            thermalPrinter.println('Results created by Nevis')
            thermalPrinter.bold(false)
            thermalPrinter.cut()
            thermalPrinter.execute(function (err) {
                if (err) {
                    console.error("Print failed", err);
                }
                else {
                    console.log("Print done");
                }
            });
        })
    }
}

function calculateSIID(data) {
    // Turn the bytes transmitted from the station into a human readable and idenifiable SIID (SI Number)
    var siid = parseInt(data[0].toString(16) + data[1].toString(16) + data[2].toString(16) + data[3].toString(16), 16);
    // SI Card 5
    if ((data[0] == 0x00) && (data[1] == 0x01)) {
        siid = siid - 65536;
    }
    else if ((data[0] == 0x00) && (data[1] == 0x02)) {
        siid = siid + 68928;
    }
    else if ((data[0] == 0x00) && (data[1] == 0x03)) {
        siid = siid + 103392;
    }
    else if ((data[0] == 0x00) && (data[1] == 0x04)) {
        siid = siid + 137856;
    }
    else if ((siid >= 3000000) && (siid <= 3999999)) {
        siid = siid - 0;
    }
    //SI Card 6
    else if ((siid >= 500000) && (siid <= 999999)) {
        siid = siid - 0;
    }
    //SI Card 8 + comCard Up
    else if ((siid >= 35554432) && (siid <= 36554431)) {
        siid = siid - 33554432;
    }
    //SI pCard
    else if ((siid >= 71180864) && (siid <= 72108863)) {
        siid = siid - 67108864;
    }
    //SI tCard
    else if ((siid >= 106663296) && (siid <= 107663295)) {
        siid = siid - 100663296;
    }
    //SI fCard
    else if ((siid >= 248881024) && (siid <= 249881023)) {
        siid = siid - 234881024;
    }
    // SI Card 10+
    else if ((siid >= 258658240) && (siid <= 261658239)) {
        siid = siid - 251658240;
    }
    return siid
}

function calculateTime(startRaw, finishRaw) {
    // Calculate time taken from start to finish from the raw start and finish times
    // Make sure numbers have 2 digits
    if (startRaw > finishRaw) {
        finishRaw = finishRaw + 43200
    }
    var timeRaw = finishRaw - startRaw;
    var timeMinutes = (timeRaw - (timeRaw % 60)) / 60;
    var timeSeconds = timeRaw % 60;
    if (timeSeconds <= 9 && timeSeconds >= 0) {
        timeSeconds = '0' + timeSeconds;
    }
    if (timeMinutes <= 9 && timeMinutes >= 0) {
        timeMinutes = '0' + timeMinutes;
    }
    return [timeMinutes, timeSeconds, timeRaw];
}

function displayControlPunch(controlCode, time) {
    // Display Control Code and Time of punch in a human readable format
    // Make sure numbers have 2 digits
    var timeHours = (time - (time % 3600)) / 3600;
    var timeMinutes = ((time % 3600) - (time % 60)) / 60;
    var timeSeconds = time % 60;
    if (timeSeconds <= 9 && timeSeconds >= 0) {
        timeSeconds = '0' + timeSeconds;
    }
    if (timeMinutes <= 9 && timeMinutes >= 0) {
        timeMinutes = '0' + timeMinutes;
    }
    if (timeHours <= 9 && timeHours >= 0) {
        timeHours = '0' + timeHours;
    }
    output(controlCode + " - " + timeHours + ":" + timeMinutes + ":" + timeSeconds);
}

function displayControlPunchwithElapsedTime(controlCounter, controlCode, splitTime, elapsedTime) {
    if (splitTime == "---") {
        output(controlCounter + " " + controlCode + " - --- - ---");
        if (controlCounterOutput.toString().length > 1) {
            splitToPrint.push(controlCounterOutput.toString() + " " + controlCode + "                     " + "--:--     --:--");
        }
        else {
            splitToPrint.push(controlCounterOutput.toString() + "  " + controlCode + "                     " + "--:--     --:--");
        }
    }
    else {
        var splitTimeMinutes = (splitTime - (splitTime % 60)) / 60;
        var splitTimeSeconds = splitTime % 60;
        if (splitTimeSeconds <= 9 && splitTimeSeconds >= 0) {
            splitTimeSeconds = '0' + splitTimeSeconds;
        }
        if (splitTimeMinutes <= 9 && splitTimeMinutes >= 0) {
            splitTimeMinutes = '0' + splitTimeMinutes;
        }
        elapsedTime = elapsedTime + splitTime
        var elapsedTimeMinutes = (elapsedTime - (elapsedTime % 60)) / 60;
        var elapsedTimeSeconds = elapsedTime % 60;
        if (elapsedTimeSeconds <= 9 && elapsedTimeSeconds >= 0) {
            elapsedTimeSeconds = '0' + elapsedTimeSeconds;
        }
        if (elapsedTimeMinutes <= 9 && elapsedTimeMinutes >= 0) {
            elapsedTimeMinutes = '0' + elapsedTimeMinutes;
        }
        if (controlCounter == "F") {
            output("F - " + splitTimeMinutes + ":" + splitTimeSeconds + " - " + elapsedTimeMinutes + ":" + elapsedTimeSeconds);
            splitToPrint.push("F" + "                          " + splitTimeMinutes + ":" + splitTimeSeconds + "     " + elapsedTimeMinutes + ":" + elapsedTimeSeconds)
        }
        else {
            var controlCounterOutput = parseInt(controlCounter) + 1
            output(controlCounterOutput.toString() + " - " + controlCode + " - " + splitTimeMinutes + ":" + splitTimeSeconds + " - " + elapsedTimeMinutes + ":" + elapsedTimeSeconds);
            if (controlCounterOutput.toString().length > 1) {
                splitToPrint.push(controlCounterOutput.toString() + " " + controlCode + "                     " + splitTimeMinutes + ":" + splitTimeSeconds + "     " + elapsedTimeMinutes + ":" + elapsedTimeSeconds);
            }
            else {
                splitToPrint.push(controlCounterOutput.toString() + "  " + controlCode + "                     " + splitTimeMinutes + ":" + splitTimeSeconds + "     " + elapsedTimeMinutes + ":" + elapsedTimeSeconds);
            }
        }
    }
    return elapsedTime
}

function getName(personalData) {
    // Get name from the personal data on the card
    // Data is separated by colons, first name then surname; so two colons
    var name = "";
    colonCounter = 0;
    for (character of personalData) {
        if (character != 0x3B && colonCounter <= 1) {
            name = name + String.fromCharCode(character);
        }
        else if (character == 0x3B && colonCounter <= 1) {
            name = name + " ";
            colonCounter++;
        }
        else {
            return name;
            break;
        }
    }
}

function processCardPunches(data, blockNumber, currentCard) {
    var endOfPunches = data.length - 1;
    var position = 0;
    while (position != endOfPunches && data[position + 1] != 0xEE && data[position + 2] != 0xEE) {
        currentCard.controlCodes.push(parseInt(data[position + 1]));
        currentCard.controlTimes.push(parseInt(data[position + 2].toString(16) + lessThan2(data[position + 3].toString(16)), 16));
        position = position + 4;
    }
    if (position != 134) {
        port.write(si.beep);
        return true;
    }
    else if (blockNumber == 1 || blockNumber == 7) {
        port.write(si.beep);
        return true;
    }
    else if (currentCard.cardType == 9) {
        port.write(card8.readBlock1);
        return false;
    }
    else if (blockNumber == 4) {
        port.write(card10.readBlock5);
        return false;
    }
    else if (blockNumber == 5) {
        port.write(card10.readBlock6);
        return false;
    }
    else if (blockNumber == 6) {
        port.write(card10.readBlock7);
        return false;
    }
}

function dataTranslation(serialData, currentData) {
    // Turn raw data into times
    // Each type for packet is a seperate If and all have a CRC check
    // If Card5 just been inserted
    if ((serialData[0] == 0x02) && (serialData[1] == 0xE5)) { //If SI 5 inserted send signal to read SI5 data
        if (parseInt(serialData[9].toString(16) + serialData[10].toString(16), 16) == parseInt(crc.compute(serialData.slice(1, 9)))) {
            currentData = new download();
            currentData.siid = calculateSIID(serialData.slice(5, 9));
            port.write(card5.read);
            currentData.cardType = 5;
            return currentData
        }
        else {
            return "Error: Problem with data transmission - Please Re-insert Card"
        }
    }
    // If Card 8,9,10,11 or SIAC have been inserted
    else if ((serialData[0] == 0x02) && (serialData[1] == 0xE8) && (serialData[2] == 0x06)) {
        if (parseInt(serialData[9].toString(16) + serialData[10].toString(16), 16) == parseInt(crc.compute(serialData.slice(1, 9)))) {
            currentData = new download();
            siid = calculateSIID(serialData.slice(5, 9));
            currentData.siid = siid;
            if (siid >= 7000000) {
                port.write(card10.readBlock0);
                currentData.cardType = 10;
            }
            else if (2000000 <= siid && 2999999 >= siid) {
                port.write(card8.readBlock0);
                currentData.cardType = 8;
            }
            else if (1000000 <= siid && 1999999 >= siid) {
                port.write(card8.readBlock0);
                currentData.cardType = 9;
            }
            else if (4000000 <= siid && 4999999 >= siid) {
                port.write(card8.readBlock0)
                currentData.cardType = 'p';
            }
            return currentData
        }
        else {
            return "Error: Problem with data transmission - Please Re-insert Card";
        }
    }
    // Read block of Card 5 data
    else if ((serialData[0] == 0x02) && (serialData[1] == 0xB1) && (serialData[2] == 0x82) && (serialData.length == 136)) {
        if (parseInt(serialData[133].toString(16) + serialData[134].toString(16), 16) == parseInt(crc.compute(serialData.slice(1, 133)).toString(16), 16)) {
            if (currentData.cardType == 5) {
                currentData.start = parseInt(serialData[card5.startByte1].toString(16) + lessThan2(serialData[card5.startByte2].toString(16)), 16);
                currentData.finish = parseInt(serialData[card5.finishByte1].toString(16) + lessThan2(serialData[card5.finishByte2].toString(16)), 16);
                var position = 38;
                var blockPosition = 0;
                while (serialData[position] != 0x00 && position != 130 && serialData[position + 1] != 0xEE) {
                    currentData.controlCodes.push(parseInt(serialData[position]));
                    currentData.controlTimes.push(parseInt(serialData[position + 1].toString(16) + lessThan2(serialData[position + 2].toString(16)), 16));
                    if (blockPosition < 4) {
                        position = position + 3;
                        blockPosition++;
                    }
                    else {
                        position = position + 4;
                        blockPosition = 0;
                    }
                }
                port.write(si.beep);
                currentData.complete = true;
                return currentData
            }
        }
        else {
            return "Error: Problem with data transmission - Please Re-insert Card"
        }
    }
    // Read Block 0 of Card 8,9,10,11 or SIAC data
    else if ((serialData[0] == 0x02) && (serialData[1] == 0xEF) && (serialData[2] == 0x83) && (serialData[5] == 0x00) && (serialData.length == 137)) {
        if (parseInt(serialData[134].toString(16) + serialData[135].toString(16), 16) == parseInt(crc.compute(serialData.slice(1, 134)).toString(16), 16)) {
            if (currentData.cardType == 10) {
                currentData.start = parseInt(serialData[card10.startByte1].toString(16) + lessThan2(serialData[card10.startByte2].toString(16)), 16);
                currentData.finish = parseInt(serialData[card10.finishByte1].toString(16) + lessThan2(serialData[card10.finishByte2].toString(16)), 16);
                currentData.name = getName(serialData.slice(38, 133));
                port.write(card10.readBlock4);
            }
            else if (currentData.cardType == 9) {
                currentData.start = parseInt(serialData[card8.startByte1].toString(16) + lessThan2(serialData[card8.startByte2].toString(16)), 16);
                currentData.finish = parseInt(serialData[card8.finishByte1].toString(16) + lessThan2(serialData[card8.finishByte2].toString(16)), 16);
                currentData.name = getName(serialData.slice(38, 58));
                processCardPunches(serialdata.slice(59, 133), 0, currentData)
                port.write(card8.readBlock1);
            }
            else if (currentData.cardType == 8 || currentData.cardType == 'p') {
                currentData.start = parseInt(serialData[card8.startByte1].toString(16) + lessThan2(serialData[card8.startByte2].toString(16)), 16);
                currentData.finish = parseInt(serialData[card8.finishByte1].toString(16) + lessThan2(serialData[card8.finishByte2].toString(16)), 16);
                currentData.name = getName(serialData.slice(38, 133));
                port.write(card8.readBlock1);
            }
            return currentData
        }
        else {
            return "Error: Problem with data transmission - Please Re-insert Card"
        }
    }
    // Read Block 1 of Card 8 + 9
    else if ((serialData[0] == 0x02) && (serialData[1] == 0xEF) && (serialData[2] == 0x83) && (serialData[5] == 0x01) && (serialData.length == 137)) {
        if (parseInt(serialData[134].toString(16) + serialData[135].toString(16), 16) == parseInt(crc.compute(serialData.slice(1, 134)).toString(16), 16)) {
            if (currentData.cardType == 8) {
                processCardPunches(serialData.slice(6, 134), 1, currentData)
            }
            if (currentData.cardType == 9) {
                processCardPunches(serialData.slice(18, 134), 1, currentData)
            }
            if (currentData.cardType == 'p') {
                processCardPunches(serialData.slice(54, 134), 1, currentData)
            }
            currentData.complete = true;
            return currentData
        }
    }
    // Read Block 4 of Card 10+ data
    else if ((serialData[0] == 0x02) && (serialData[1] == 0xEF) && (serialData[2] == 0x83) && (serialData[5] == 0x04) && (serialData.length == 137)) {
        if (currentData.cardType == 10) {
            if (processCardPunches(serialData.slice(6, 134), 4, currentData) == true) {
                currentData.complete = true;
                return currentData
            }
        }
    }
    // Read Block 5 of Card 10+ data
    else if ((serialData[0] == 0x02) && (serialData[1] == 0xEF) && (serialData[2] == 0x83) && (serialData[5] == 0x05) && (serialData.length == 137)) {
        if (currentData.cardType == 10) {
            if (processCardPunches(serialData.slice(6, 134), 5, currentData) == true) {
                currentData.complete = true;
                return currentData
            }
        }
    }
    // Read Block 6 of Card 10+ data
    else if ((serialData[0] == 0x02) && (serialData[1] == 0xEF) && (serialData[2] == 0x83) && (serialData[5] == 0x06) && (serialData.length == 137)) {
        if (currentData.cardType == 10) {
            if (processCardPunches(serialData.slice(6, 134), 6, currentData) == true) {
                currentData.complete = true;
                return currentData
            }
        }
    }
    // Read Block 7 of Card 10+ data
    else if ((serialData[0] == 0x02) && (serialData[1] == 0xEF) && (serialData[2] == 0x83) && (serialData[5] == 0x07) && (serialData.length == 137)) {
        if (currentData.cardType == 10) {
            if (processCardPunches(serialData.slice(6, 134), 7, currentData) == true) {
                currentData.complete = true;
                return currentData
            }
        }
    }
}

/* ------ Connect Button to Enable Download ----- */
connect.addEventListener('click', function () {
    // Open the port
    if (connect.textContent == "Connect" && document.getElementById('port-content').innerText != '') {
        /* ----- Set up Port ----- */
        port = new SerialPort(document.getElementById('port-content').innerText, {
            baudRate: parseInt(document.getElementById('baud-content').innerText),
            dataBits: 8,
            stopBits: 1,
            parity: 'none',
            autoOpen: false
        })
        port.on('open', function () {
            output(portName + " Opened", 'connection');
            port.write(new Buffer(0xff, 0x02, 0xf9, 0x01, 0x02, 0x14, 0x0a, 0x03))
        });
        port.on('close', function () {
            output(portName + " Closed", 'connection');
            connect.textContent = "Connect";
        });
        port.on('error', function (err) {
            output('Error: ' + err.message, 'error');
            connect.textContent = "Connect";
        })
        // Turn random lengths of packets in to one long readable full length
        var dataInList = []
        port.on('data', function (data) {
            for (byte of data) {
                if (byte == 0x00) {
                    dataInList.push(0x00);
                }
                else if (byte != 0x03) {
                    dataInList.push(byte);
                }
                else {
                    if (dataInList.length == 135 || dataInList.length == 136 || dataInList.length == 11) {
                        dataInList.push(0x03)
                        var returnedData = dataTranslation(dataInList, currentDownload);
                        dataInList = []
                        if (returnedData != null) {
                            if (typeof returnedData == 'string') {
                                output(returnedData, 'error')
                            }
                            else {
                                // Save and Display Download
                                if (returnedData.complete == true) {
                                    var calculatedTime = calculateTime(returnedData.start, returnedData.finish);
                                    returnedData.siid = returnedData.siid.toString();
                                    downloads.insert(returnedData);
                                    db.saveDatabase();
                                    splitToPrint = [];
                                    var linkedEntry = competitors.findOne({
                                        'siid': returnedData.siid.toString()
                                    });
                                    if (linkedEntry == null) {
                                        competitors.insert({
                                            name: returnedData.name,
                                            siid: returnedData.siid.toString(),
                                            downloadID: downloads.findOne({
                                                'siid': returnedData.siid
                                            }).$loki
                                        })
                                        var calculatedTime = calculateTime(returnedData.start, returnedData.finish);
                                        output(returnedData.name + " (" + returnedData.siid + ") - " + calculatedTime[0] + ":" + calculatedTime[1], 'big');
                                        displayControlPunch('S', returnedData.start);
                                        var elapsedTime = 0;
                                        var lastPunch = returnedData.start;
                                        for (punch in returnedData.controlCodes) {
                                            if (returnedData.controlTimes[punch] > lastPunch) {
                                                elapsedTime = displayControlPunchwithElapsedTime(punch, returnedData.controlCodes[punch], returnedData.controlTimes[punch] - lastPunch, elapsedTime)
                                                lastPunch = returnedData.controlTimes[punch]
                                            }
                                            else {
                                                elapsedTime = displayControlPunchwithElapsedTime(punch, returnedData.controlCodes[punch], (returnedData.controlTimes[punch] + 43200) - lastPunch, elapsedTime)
                                                lastPunch = returnedData.controlTimes[punch] + 43200
                                            }
                                        }
                                        if (returnedData.finish < lastPunch) {
                                            displayControlPunchwithElapsedTime('F', '', (returnedData.finish + 43200) - lastPunch, elapsedTime)
                                        }
                                        else {
                                            displayControlPunchwithElapsedTime('F', '', returnedData.finish - lastPunch, elapsedTime)
                                        }
                                        printSplits(returnedData.name, calculatedTime[0] + ":" + calculatedTime[1], returnedData.siid, "Unknown", splitToPrint)
                                        currentDownload = new download();
                                    }
                                    else {
                                        var errors = "";
                                        if (returnedData.course != "") {
                                            var courseFile = courses.findOne({
                                                'name': linkedEntry.course
                                            })
                                            if (courseFile != null) {
                                                if (courseFile.type == "linear") {
                                                    courseCheckData = course.check(returnedData.controlCodes, returnedData.controlTimes, courseFile.controls, returnedData.finish)
                                                    errors = courseCheckData[0]
                                                    splitList = courseCheckData[1]
                                                    linkedEntry.downloadID = downloads.findOne({
                                                        'siid': returnedData.siid
                                                    }).$loki;
                                                    var calculatedTime = calculateTime(returnedData.start, returnedData.finish);
                                                    if (errors == "") {
                                                        output(linkedEntry.name + " (" + returnedData.siid + ") - " + calculatedTime[0] + ":" + calculatedTime[1], 'big');
                                                        downloads.findOne({
                                                            'siid': returnedData.siid
                                                        }).time = calculatedTime[2]
                                                        time = calculatedTime[0] + ":" + calculatedTime[1]
                                                    }
                                                    else {
                                                        output(linkedEntry.name + " (" + returnedData.siid + ") - " + errors, 'big');
                                                        downloads.findOne({
                                                            'siid': returnedData.siid
                                                        }).time = errors
                                                        time = errors
                                                    }
                                                    displayControlPunch('S', returnedData.start);
                                                    var elapsedTime = 0;
                                                    var lastPunch = returnedData.start;
                                                    for (punch in splitList) {
                                                        if (returnedData.controlTimes[punch] > lastPunch) {
                                                            elapsedTime = displayControlPunchwithElapsedTime(punch, returnedData.controlCodes[punch], returnedData.controlTimes[punch] - lastPunch, elapsedTime)
                                                            lastPunch = returnedData.controlTimes[punch]
                                                        }
                                                        else {
                                                            elapsedTime = displayControlPunchwithElapsedTime(punch, returnedData.controlCodes[punch], (returnedData.controlTimes[punch] + 43200) - lastPunch, elapsedTime)
                                                            lastPunch = returnedData.controlTimes[punch] + 43200
                                                        }
                                                    }
                                                    if (returnedData.finish < lastPunch) {
                                                        displayControlPunchwithElapsedTime('F', '', (returnedData.finish + 43200) - lastPunch, elapsedTime)
                                                    }
                                                    else {
                                                        displayControlPunchwithElapsedTime('F', '', returnedData.finish - lastPunch, elapsedTime)
                                                    }
                                                    printSplits(linkedEntry.name, time, returnedData.siid, linkedEntry.course, splitToPrint)
                                                    currentDownload = new download();
                                                }
                                            }
                                            else {
                                                var calculatedTime = calculateTime(returnedData.start, returnedData.finish);
                                                output(returnedData.name + " (" + returnedData.siid + ") - " + calculatedTime[0] + ":" + calculatedTime[1], 'big');
                                                displayControlPunch('S', returnedData.start);
                                                downloads.findOne({
                                                    'siid': returnedData.siid
                                                }).time = calculatedTime
                                                var elapsedTime = 0;
                                                var lastPunch = returnedData.start;
                                                for (punch in returnedData.controlCodes) {
                                                    if (returnedData.controlTimes[punch] > lastPunch) {
                                                        elapsedTime = displayControlPunchwithElapsedTime(punch, returnedData.controlCodes[punch], returnedData.controlTimes[punch] - lastPunch, elapsedTime)
                                                        lastPunch = returnedData.controlTimes[punch]
                                                    }
                                                    else {
                                                        elapsedTime = displayControlPunchwithElapsedTime(punch, returnedData.controlCodes[punch], (returnedData.controlTimes[punch] + 43200) - lastPunch, elapsedTime)
                                                        lastPunch = returnedData.controlTimes[punch] + 43200
                                                    }
                                                }
                                                if (returnedData.finish < lastPunch) {
                                                    displayControlPunchwithElapsedTime('F', '', (returnedData.finish + 43200) - lastPunch, elapsedTime)
                                                }
                                                else {
                                                    displayControlPunchwithElapsedTime('F', '', returnedData.finish - lastPunch, elapsedTime)
                                                }
                                                printSplits(returnedData.name, calculatedTime[0] + ":" + calculatedTime[1], returnedData.siid, "unknown", splitToPrint)
                                                currentDownload = new download();
                                            }
                                        };
                                    }
                                    db.saveDatabase();
                                }
                                else {
                                    currentDownload = returnedData
                                }
                            }
                        }
                    }
                    else {
                        dataInList.push(byte);
                    }
                }
            }
        });
        port.open();
        connect.textContent = "Disconnect";
    }
    // Close Port if Open
    else if (document.getElementById('port-content').innerText != '') {
        port.close();
        connect.textContent = "Connect";
    }
})

/* ----- Baud and Port Menus ----- */
const portMenu = document.getElementById('port-menu');
const baudMenu = document.getElementById('baud-menu');
const printerMenu = document.getElementById('printer-menu');

// Baud Menu
document.getElementById('baud').addEventListener('click', function () {
    if (baudMenu.getAttribute('class') == 'hidden') {
        baudMenu.setAttribute('class', ' ')
    }
    else {
        baudMenu.setAttribute('class', 'hidden')
    }
})
document.getElementById('baud-usb').addEventListener('click', function () {
    document.getElementById('baud-content').innerText = "38400";
    port.baudrate = 38400
    baudMenu.setAttribute('class', 'hidden')
})
document.getElementById('baud-serial').addEventListener('click', function () {
    document.getElementById('baud-content').innerText = "4800";
    port.baudrate = 4800
    baudMenu.setAttribute('class', 'hidden')
})

// Port Menu & Autogenerated Menu Items
function assignPortMenuHandler() {
    document.getElementById('port-content').innerText = this.innerText;
    portMenu.setAttribute('class', 'hidden')
    portName = document.getElementById('port-content').innerText;
}
document.getElementById('port').addEventListener('click', function () {
    if (portMenu.getAttribute('class') == 'hidden') {
        portMenu.innerHTML = "";
        portsList = ""
        noOfPorts = 1
        SerialPort.list(function (err, ports) {
            ports.forEach(function (port) {
                var p = document.createElement('p');
                p.className = 'ports-list-item';
                p.innerHTML = port.comName;
                p.onclick = assignPortMenuHandler;
                document.getElementById('port-menu').appendChild(p);
                noOfPorts++;
            });
            if (ports.length < 1) {
                portMenu.innerHTML = portMenu.innerHTML + "<p id='NoDev'>No Devices Detected</p>";
                document.getElementById('NoDev').addEventListener('click', function () {
                    document.getElementById('port-content').innerText = " ";
                    portMenu.setAttribute('class', 'hidden')
                })
            }
        });
        portMenu.setAttribute('class', '')
    }
    else {
        portMenu.setAttribute('class', 'hidden')
    }
})

// Printer Menu & Autogenerated Menu Items
function assignPrintMenuHandler() {
    document.getElementById('printer-content').innerText = this.innerText;
    printerMenu.setAttribute('class', 'hidden')
}
document.getElementById('printer').addEventListener('click', function () {
    if (printerMenu.getAttribute('class') == 'hidden') {
        printerMenu.innerHTML = "";
        printersList = ""
        noOfPrinters = 1
        printers = printer.getPrinters()
        printers.forEach(function (printer) {
            if (printer.status[0] != "NOT-AVAILABLE") {
                var p = document.createElement('p');
                p.className = 'printer-list-item';
                p.innerHTML = printer.name;
                p.onclick = assignPrintMenuHandler;
                document.getElementById('printer-menu').appendChild(p);
                noOfPrinters++;
            }
        });
        var p = document.createElement('p');
        p.id = 'NoPrint';
        p.innerHTML = 'No Printing';
        document.getElementById('printer-menu').appendChild(p);
        document.getElementById('NoPrint').addEventListener('click', function () {
            document.getElementById('printer-content').innerText = "No Printing";
            printerMenu.setAttribute('class', 'hidden')
        })
        printerMenu.setAttribute('class', '')
    }
    else {
        printerMenu.setAttribute('class', 'hidden')
    }
})
