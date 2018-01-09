////////////////////////////////////////////////////////////
//                   SI-Variables.js                      //
////////////////////////////////////////////////////////////

// Variables to aid with reading SI Cards via SerialPort  //

// Make Unit beep Until Removed
module.exports.beep = new Buffer([0xFF, 0x06])

// SI Card 5
// Positions of Start and Finish Data & Read Instructions
module.exports.card5 = function () {
    this.startByte1 = 24;
    this.startByte2 = 25;
    this.finishByte1 = 26;
    this.finishByte2 = 27;

    this.read = new Buffer([0xFF, 0x02, 0xB1, 0x00, 0xB1, 0x00, 0x03]);
}

// SI Card 10, 11 & SIAC
// Positions of Start and Finish Data & Read Instructions for all blocks
// Block 8 reads out Blocks 0, 4, 5, 6, 7
module.exports.card10 = function () {
    this.startByte1 = 20;
    this.startByte2 = 21;
    this.finishByte1 = 24;
    this.finishByte2 = 25;

    this.readBlock0 = new Buffer([0xFF, 0x02, 0xEF, 0x01, 0x00, 0xE2, 0x09, 0x03])
    this.readBlock1 = new Buffer([0xFF, 0x02, 0xEF, 0x01, 0x01, 0xE3, 0x09, 0x03])
    this.readBlock2 = new Buffer([0xFF, 0x02, 0xEF, 0x01, 0x02, 0xE0, 0x09, 0x03])
    this.readBlock3 = new Buffer([0xFF, 0x02, 0xEF, 0x01, 0x03, 0xE1, 0x09, 0x03])
    this.readBlock4 = new Buffer([0xFF, 0x02, 0xEF, 0x01, 0x04, 0xE6, 0x09, 0x03])
    this.readBlock5 = new Buffer([0xFF, 0x02, 0xEF, 0x01, 0x05, 0xE7, 0x09, 0x03])
    this.readBlock6 = new Buffer([0xFF, 0x02, 0xEF, 0x01, 0x06, 0xE4, 0x09, 0x03])
    this.readBlock7 = new Buffer([0xFF, 0x02, 0xEF, 0x01, 0x07, 0xE5, 0x09, 0x03])
    this.readBlock8 = new Buffer([0xFF, 0x02, 0xEF, 0x01, 0x08, 0xEA, 0x09, 0x03])
}

// SI Card 8, 9 & P
// Positions of Start and Finish Data & Read Instructions for all blocks
module.exports.card8 = function () {
    this.startByte1 = 14;
    this.startByte2 = 15;
    this.finishByte1 = 18;
    this.finishByte2 = 19;

    this.readBlock0 = new Buffer([0xFF, 0x02, 0xEF, 0x01, 0x00, 0xE2, 0x09, 0x03])
    this.readBlock1 = new Buffer([0xFF, 0x02, 0xEF, 0x01, 0x01, 0xE3, 0x09, 0x03])
}