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
