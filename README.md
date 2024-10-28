# RFID Attendance System

This project is an **RFID Attendance System** built using an **ESP8266** microcontroller. It leverages RFID technology to scan student and faculty ID cards and mark attendance or verify faculty login via a web API. The system features a Liquid Crystal Display (LCD) to provide real-time feedback and status updates.

## Features

- **WiFi Connectivity**: Connects to a specified WiFi network to communicate with an online API.
- **RFID Scanning**: Reads RFID cards to identify students and faculty members.
- **Attendance Marking**: Sends attendance data to a server via HTTP POST requests.
- **Faculty Login Verification**: Checks the faculty ID against an API to confirm their login.
- **Real-Time Feedback**: Displays messages on an LCD for user interaction and status updates.
- **Error Logging**: Logs any errors encountered during operation to EEPROM for later review.

## Components Used

- **ESP8266**: A low-cost WiFi microcontroller used for communication.
- **RFID Reader**: MFRC522 module for reading RFID tags.
- **Liquid Crystal Display (LCD)**: I2C LCD to display messages and status updates.
- **EEPROM**: For logging errors and retaining information across reboots.

## Project Setup

### Hardware Connections

1. **ESP8266**: Connect the ESP8266 to your computer for programming.
2. **RFID Reader**: 
   - SDA pin to GPIO2 (D4 on some boards)
   - RST pin to GPIO0 (D3 on some boards)
   - VCC to 3.3V
   - GND to GND
3. **LCD**: 
   - Connect the I2C LCD to the ESP8266's I2C pins (typically GPIO4 and GPIO5).

   ![circuit model](https://content.instructables.com/FS0/KS78/JJT6M9IB/FS0KS78JJT6M9IB.png?auto=webp&fit=bounds&frame=1&width=1024)

### Software Dependencies

Make sure you have the following libraries installed in your Arduino IDE:

- **MFRC522**: For RFID communication.
- **LiquidCrystal_I2C**: For I2C LCD communication.
- **ArduinoJson**: For handling JSON data.
- **ESP8266WiFi**: For WiFi connectivity.

### Configuration

1. **WiFi Credentials**: Update the `ssid` and `password` variables in the code with your WiFi credentials.
2. **API Endpoints**: Set the `host` variable to your API's base URL, and ensure that the faculty login and attendance mark URLs are correct.

## Code Explanation

### Setup Function

- Initializes the Serial monitor, EEPROM, I2C LCD, and connects to WiFi.
- Sets up the RFID reader.

### Loop Function

- Continuously checks for new RFID cards.
- If a card is detected, it reads the card data and decides whether to mark attendance or check for faculty login.

### Key Functions

- `connectToWiFi()`: Establishes a WiFi connection.
- `initializeRFID()`: Initializes the RFID reader.
- `readCardData()`: Reads the RFID data and extracts student and faculty IDs.
- `checkFacultyLogin()`: Sends a POST request to the API with the faculty ID for verification.
- `markAttendance()`: Sends a POST request to mark the attendance for the detected student ID.
- `logError(String message)`: Logs error messages to EEPROM for later review.
- `getLog()`: Retrieves the logged errors from EEPROM.

## Usage

1. Upload the code to your ESP8266 board using the Arduino IDE.
2. Open the Serial Monitor to view logs and connection status.
3. Present an RFID card to the reader; the system will automatically process attendance or login requests based on the card data.
4. Use the LCD to monitor the status of operations and any errors.

## Troubleshooting

- Ensure your RFID and LCD connections are secure.
- Verify the WiFi credentials and API URLs are correct.
- Check the Serial Monitor for error messages and debugging information.

## Conclusion

This RFID Attendance System serves as a robust solution for automated attendance marking and faculty verification, enhancing efficiency in educational institutions. Feel free to contribute to this project or use it as a foundation for your own implementations.

---

### Acknowledgments

- [Arduino](https://www.arduino.cc/)
- [ESP8266](https://espressif.com/en/products/socs/esp8266)
- [MFRC522 RFID Reader](https://www.electronicwings.com/nodemcu/mfrc522-rfid-reader)
- [LiquidCrystal_I2C Library](https://github.com/fmalpartida/LiquidCrystal_I2C)