var readSi5 = new Buffer([0xFF, 0x02, 0xB1, 0x00, 0xB1, 0x00, 0x03]);

var readSi10_Block0 = new Buffer([0xFF, 0x02, 0xEF, 0x01, 0x00, 0xE2, 0x09, 0x03])
var readSi10_Block1 = new Buffer([0xFF, 0x02, 0xEF, 0x01, 0x01, 0xE3, 0x09, 0x03])
var readSi10_Block2 = new Buffer([0xFF, 0x02, 0xEF, 0x01, 0x02, 0xE0, 0x09, 0x03])
var readSi10_Block3 = new Buffer([0xFF, 0x02, 0xEF, 0x01, 0x03, 0xE1, 0x09, 0x03])
var readSi10_Block4 = new Buffer([0xFF, 0x02, 0xEF, 0x01, 0x04, 0xE6, 0x09, 0x03])
var readSi10_Block5 = new Buffer([0xFF, 0x02, 0xEF, 0x01, 0x05, 0xE7, 0x09, 0x03])
var readSi10_Block6 = new Buffer([0xFF, 0x02, 0xEF, 0x01, 0x06, 0xE4, 0x09, 0x03])
var readSi10_Block7 = new Buffer([0xFF, 0x02, 0xEF, 0x01, 0x07, 0xE5, 0x09, 0x03])

var beep = new Buffer([0xFF, 0x06]);

function compute_crc(buffer) {
    var count = buffer.length;
    if (count < 2) {
        return 0;
    }
    var tmp;
    var ptr = 0;
    tmp = (buffer[ptr++] << 8 | (buffer[ptr++] & 0xFF));
    if (count > 2) {
        for (var i = Math.trunc(count / 2); i > 0; i--) {
            var val = void 0;
            if (i > 1) {
                val = (buffer[ptr++] << 8 | (buffer[ptr++] & 0xFF));
            }
            else {
                if (count % 2 == 1) {
                    val = buffer[count - 1] << 8;
                }
                else {
                    val = 0; // last value with 0 // last 16 bit value
                }
            }
            for (var j = 0; j < 16; j++) {
                if ((tmp & 0x8000) != 0) {
                    tmp <<= 1;
                    if ((val & 0x8000) != 0) {
                        tmp++; // rotate carry
                    }
                    tmp ^= 0x8005;
                }
                else {
                    tmp <<= 1;
                    if ((val & 0x8000) != 0) {
                        tmp++; // rotate carry
                    }
                }
                val <<= 1;
            }
        }
    }
    return (tmp & 0xFFFF);
}

function calculateSIID(byte0, byte1, byte2, byte3) {
    siid = parseInt(byte0 + byte1 + byte2 + byte3, 16)
    // SI Card 5
    if ((byte0 == 0x00) && (byte1 == 0x01)) {
        siid = siid - 65537
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
    else if ((siid >= 259658240) && (siid <= 261658239)) {
        siid = siid - 251658240
    }

    return siid
}
function calculateTime(start, finish) {
    time_raw = finishtime - starttime
    time_minutes = (time_raw - (time_raw % 60)) / 60
    time_seconds = time_raw % 60
    return [time_minutes, time_seconds, time_raw]
}

var SerialPort = require('serialport');
portName = 'COM3';
baudRate = 4800;
var port = new SerialPort(portName, {
    baudRate: baudRate,
    autoOpen: false

});
port.open(function (err) {
    if (err) {
        return console.log('Error opening port: ', err.message);
    }
});
port.on('open', function () {
    console.log(portName + " Opened")


});
port.on('error', function (err) {
    console.log('Error: ', err.message);
})
port.on('data', function (data) {
    console.log(data)
    if ((data[0] == 0x02) && (data[1] == 0xE5)) {
        siid = calculateSIID(data[5].toString(16), data[6].toString(16), data[7].toString(16), data[8].toString(16))
        port.write(readSi5)
    }
    else if ((data[0] == 0x02) && (data[1] == 0xE8)) {
        siid = calculateSIID(data[5].toString(16), data[6].toString(16), data[7].toString(16), data[8].toString(16))
        port.write(readSi10_Block0)

    }

    else if ((data[0] == 0x02) && (data[1] == 0xB1) && (data[2] == 0x82) && (data.length == 136)) {
        port.write(beep)
        starttime = parseInt(data[24].toString(16) + data[25].toString(16), 16);
        finishtime = parseInt(data[26].toString(16) + data[27].toString(16), 16);
        time = calculateTime(starttime, finishtime)
        console.log(siid + " - " + time[0] + ":" + time[1])

    }
    else if ((data[0] == 0x02) && (data[1] == 0xEF) && (data[2] == 0x83) && (data[5] == 0x00) && (data.length == 137)) {
        port.write(beep)
        starttime = parseInt(data[20].toString(16) + data[21].toString(16), 16);
        finishtime = parseInt(data[24].toString(16) + data[27].toString(16), 16);
        time = calculateTime(starttime, finishtime)
        console.log(siid + " - " + time[0] + ":" + time[1])
        name = "";
        i = 0
        for (a in data.slice(38)) {
            if (data.slice(38)[i] != 0x3B) {
                name = name + String.fromCharCode(data.slice(38)[i], 16)
                i++;
            }
            else {
                pos = i;
                break
            }
        }
        console.log(name)

    }
});

