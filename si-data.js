const si = require('./si-variables.js');
const crc = require('./crc.js')
const card5 = new si.card5();
const card10 = new si.card10();

function output(data, type) { // Displays data in Box
    if (type == 'error') {
        document.getElementById('download-output').innerHTML = document.getElementById('download-output').innerHTML + "<p class='error'>" + data + "</p>";
    }
    else if (type == 'connection') {
        document.getElementById('download-output').innerHTML = document.getElementById('download-output').innerHTML + "<p class='connection'>" + data + "</p>";
    }
    else if (type == 'big') {
        document.getElementById('download-output').innerHTML = document.getElementById('download-output').innerHTML + "<p class='big'>" + data + "</p>";
    }
    else {

        document.getElementById('download-output').innerHTML = document.getElementById('download-output').innerHTML + "<p>" + data + "</p>";
        ipc.send('resize', 0)

    }
    document.getElementById('scroll').scrollTop = document.getElementById('download-output').scrollHeight;
}

function calculateSIID(byte0, byte1, byte2, byte3) { //Turns 4 Bytes in to human readable SIID Number
    siid = parseInt(byte0 + byte1 + byte2 + byte3, 16)
    // SI Card 5
    if ((byte0 == 0x00) && (byte1 == 0x01)) {
        siid = siid - 65536
    }
    else if ((byte0 == 0x00) && (byte1 == 0x02)) {
        siid = siid + 68928
    }
    else if ((byte0 == 0x00) && (byte1 == 0x03)) {
        siid = siid + 103392
    }
    else if ((byte0 == 0x00) && (byte1 == 0x04)) {
        siid = siid + 137856
    }
    //SI Card 6
    else if ((siid >= 500000) && (siid <= 999999)) {
        siid = siid - 0
    }
    //SI Card 8 + comCard Up
    else if ((siid >= 35554432) && (siid <= 36554431)) {
        siid = siid - 33554432
    }
    //SI Card 5
    else if ((siid >= 3000000) && (siid <= 3999999)) {
        siid = siid - 0
    }
    //SI pCard
    else if ((siid >= 71180864) && (siid <= 72108863)) {
        siid = siid - 67108864
    }
    //SI tCard
    else if ((siid >= 106663296) && (siid <= 107663295)) {
        siid = siid - 100663296
    }
    //SI fCard
    else if ((siid >= 248881024) && (siid <= 249881023)) {
        siid = siid - 234881024
    }
    // SI Card 10+
    else if ((siid >= 258658240) && (siid <= 261658239)) {
        siid = siid - 251658240
    }

    return siid
}
function calculateTime(start, finish) {//Calculate time taken from start and finish times
    time_raw = finish - start
    time_minutes = (time_raw - (time_raw % 60)) / 60
    time_seconds = time_raw % 60
    return [time_minutes, time_seconds, time_raw]
}

function displayControlPunch(controlCode, time, timeOfDay) {

    time_hour = (time - (time % 3600)) / 3600
    time_minutes = ((time % 3600) - (time % 60)) / 60
    time_seconds = time % 60
    output(controlCode + " - " + time_hour + ":" + time_minutes + ":" + time_seconds)

}


function dataTranslation(serialData) {

    if ((serialData[0] == 0x02) && (serialData[1] == 0xE5)) { //If SI 5 inserted send signal to read SI5 data
        if (parseInt(serialData[9].toString(16) + serialData[10].toString(16), 16) == parseInt(crc.compute(serialData.slice(1, 9)))) {
            siid = calculateSIID(serialData[5].toString(16), serialData[6].toString(16), serialData[7].toString(16), serialData[8].toString(16))
            port.write(card5.read)
        }
    }
    else if ((serialData[0] == 0x02) && (serialData[1] == 0xE8)) {//If SI 10+ inserted send signal to read SI10 data
        if (parseInt(serialData[9].toString(16) + serialData[10].toString(16), 16) == parseInt(crc.compute(serialData.slice(1, 9)))) {
            siid = calculateSIID(serialData[5].toString(16), serialData[6].toString(16), serialData[7].toString(16), serialData[8].toString(16))
            port.write(card10.readBlock0)
        }
    }

    else if ((serialData[0] == 0x02) && (serialData[1] == 0xB1) && (serialData[2] == 0x82) && (serialData.length == 136)) {
        //Read SI5 data
        if (parseInt(serialData[133].toString(16) + serialData[134].toString(16), 16) == parseInt(crc.compute(serialData.slice(1, 133)).toString(16), 16)) {

            port.write(si.beep)
            startTime = parseInt(serialData[24].toString(16) + serialData[25].toString(16), 16);
            finishTime = parseInt(serialData[26].toString(16) + serialData[27].toString(16), 16);
            time = calculateTime(startTime, finishTime)
            output("(" + siid + ")" + " - " + time[0] + ":" + time[1], 'big')

            displayControlPunch("S", startTime)

            var controlCode;
            var position = 38;
            var blockPosition = 0;
            while (controlCode != 0x00 && position != 130 && serialData[position + 1] != 0xEE) {

                time = parseInt(serialData[position + 1].toString(16) + serialData[position + 2].toString(16), 16);
                controlCode = parseInt(serialData[position])
                displayControlPunch(controlCode, time)

                if (blockPosition < 4) {
                    position = position + 3;
                    blockPosition++;
                }
                else {
                    position = position + 4;
                    blockPosition = 0
                }
                controlCode = parseInt(serialData[position])

            }
            displayControlPunch("F", finishTime)
        }
    }
    else if ((serialData[0] == 0x02) && (serialData[1] == 0xEF) && (serialData[2] == 0x83) && (serialData[5] == 0x00) && (serialData.length == 137)) {
        if (parseInt(serialData[134].toString(16) + serialData[135].toString(16), 16) == parseInt(crc.compute(serialData.slice(1, 134)).toString(16), 16)) {

            startTime = parseInt(serialData[20].toString(16) + serialData[21].toString(16), 16);
            finishTime = parseInt(serialData[24].toString(16) + serialData[25].toString(16), 16);
            time = calculateTime(startTime, finishTime)

            var name = "";
            colonCounter = 0
            for (character of serialData.slice(38, 133)) {
                if (character != 0x3B && colonCounter <= 1) {
                    name = name + String.fromCharCode(character)
                }
                else if (character == 0x3B && colonCounter <= 1) {
                    name = name + " "
                    colonCounter++;
                }
                else {
                    break
                }
            }
            output(name + " (" + siid + ")" + " - " + time[0] + ":" + time[1], 'big')
            displayControlPunch("S", startTime)
            port.write(card10.readBlock4)
            downloadComplete = false;
        }
    }
    else if ((serialData[0] == 0x02) && (serialData[1] == 0xEF) && (serialData[2] == 0x83) && (serialData[5] == 0x04) && (serialData.length == 137)) {
        if (parseInt(serialData[134].toString(16) + serialData[135].toString(16), 16) == parseInt(crc.compute(serialData.slice(1, 134)).toString(16), 16)) {

            var controlCode;
            var position = 6;

            while (controlCode != 0xEE && position != 134 && serialData[position + 2] != 0xEE) {

                time = parseInt(serialData[position + 1].toString(16) + serialData[position + 2].toString(16), 16);
                controlCode = parseInt(serialData[position + 1])
                displayControlPunch(controlCode, time)
                position = position + 4; serialData[position + 1]
                controlCode = parseInt(serialData[position + 1])
            }
            if (position != 134) {
                downloadComplete = true;
                displayControlPunch("F", finishTime)
                port.write(si.beep)
            }
            else {
                port.write(card10.readBlock5)

            }

        }
    }

    else if ((serialData[0] == 0x02) && (serialData[1] == 0xEF) && (serialData[2] == 0x83) && (serialData[5] == 0x05) && (serialData.length == 137)) {
        if (parseInt(serialData[134].toString(16) + serialData[135].toString(16), 16) == parseInt(crc.compute(serialData.slice(1, 134)).toString(16), 16)) {

            if (downloadComplete == false) {
                var controlCode;
                var position = 6;
                while (controlCode != 0xEE && position != 134 && serialData[position + 2] != 0xEE) {

                    time = parseInt(serialData[position + 1].toString(16) + serialData[position + 2].toString(16), 16);
                    controlCode = parseInt(serialData[position + 1])
                    displayControlPunch(controlCode, time)
                    position = position + 4;
                    controlCode = parseInt(serialData[position + 1])
                }
                if (position != 134) {
                    downloadComplete = true;
                    displayControlPunch("F", finishTime)
                    port.write(si.beep)
                }
                else {
                    port.write(card10.readBlock6)

                }

            }
        }

    }

    else if ((serialData[0] == 0x02) && (serialData[1] == 0xEF) && (serialData[2] == 0x83) && (serialData[5] == 0x06) && (serialData.length == 137)) {
        if (parseInt(serialData[134].toString(16) + serialData[135].toString(16), 16) == parseInt(crc.compute(serialData.slice(1, 134)).toString(16), 16)) {

            if (downloadComplete == false) {
                var controlCode;
                var position = 6;

                while (controlCode != 0xEE && position != 134 && serialData[position + 2] != 0xEE) {

                    time = parseInt(serialData[position + 1].toString(16) + serialData[position + 2].toString(16), 16);
                    controlCode = parseInt(serialData[position + 1])
                    displayControlPunch(controlCode, time)

                    position = position + 4;
                    controlCode = parseInt(serialData[position + 1])
                }
                if (position != 134) {
                    downloadComplete = true;
                    displayControlPunch("F", finishTime)
                    port.write(si.beep)
                }
                else {
                    port.write(card10.readBlock7)
                }
            }
        }
    }
    else if ((serialData[0] == 0x02) && (serialData[1] == 0xEF) && (serialData[2] == 0x83) && (serialData[5] == 0x07) && (serialData.length == 137)) {
        if (parseInt(serialData[134].toString(16) + serialData[135].toString(16), 16) == parseInt(crc.compute(serialData.slice(1, 134)).toString(16), 16)) {

            if (downloadComplete == false) {
                var controlCode;
                var position = 6;

                while (controlCode != 0xEE && position != 134 && serialData[position + 2] != 0xEE) {
                    time = parseInt(serialData[position + 1].toString(16) + serialData[position + 2].toString(16), 16);
                    controlCode = parseInt(serialData[position + 1])
                    displayControlPunch(controlCode, time)
                    position = position + 4;
                    controlCode = parseInt(serialData[position + 1])
                }

                currentDownload.complete = true;
                diplayControlPunch("F", finishTime)
            }
            port.write(si.beep)
        }
    }
}


document.getElementById('connect').addEventListener('click', function () {
    if (document.getElementById('connect').textContent = "Disconnect") {
        port.close();
        document.getElementById('connect').textContent = "Connect";

    }
    else {

        port = new SerialPort(document.getElementById('port-content').innerText, {
            baudRate: parseInt(document.getElementById('baud-content').innerText),
            dataBits: 8,
            stopBits: 1,
            parity: 'none',
            autoOpen: false
        })

        port.on('open', function () {
            output(portName + " Opened", 'connection');
        });
        port.on('close', function () {
            output(portName + " Closed", 'connection');
            document.getElementById('connect').textContent = "Connect";

        });
        port.on('error', function (err) {
            output('Error: ' + err.message, 'error');
            document.getElementById('connect').textContent = "Connect";
        })
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
                        dataInList.push(byte);
                        dataTranslation(dataInList);
                        dataInList = []

                    }
                }

            }

        });
        port.open()


        document.getElementById('connect').textContent = "Disconnect";



    }
})