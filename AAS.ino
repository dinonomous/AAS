#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <SPI.h>
#include <MFRC522.h>
#include <WiFiClientSecure.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>
#include <EEPROM.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// WiFi and API configurations
const char* ssid = "Galaxy";
const char* password = ".........";
const char* host = "aas-api.vercel.app";
const int httpsPort = 443;

const String section = "L1";
const String facultyLoginUrl = "https://" + String(host) + "/api/v1/main/faculty/login/" + section;
const String attendanceMarkUrl = "https://" + String(host) + "/api/v1/main/attendance/mark/" + section;

// RFID Configurations
MFRC522 mfrc522(2, 0);  // RFID pins (SDA, RST)
MFRC522::MIFARE_Key key;
MFRC522::StatusCode status;
#define TOTAL_BLOCKS 2

// Variables for holding IDs
String studentId = "";
String facultyId = "";

// EEPROM configurations
#define EEPROM_SIZE 512
#define LOG_ADDRESS 0

// I2C display configuration
LiquidCrystal_I2C lcd(0x27, 16, 2);  // Change 0x27 to your display's I2C address if different

// Function declarations
void connectToWiFi();
void initializeRFID();
void checkFacultyLogin();
void markAttendance();
void readCardData();
void readDataFromBlock(int blockNum, byte* readBlockData);
void logError(String message);
String getLog();
void displayWrappedMessage(String message);
bool sendHttpRequest(const String &url, const String &payload, String &response);

void setup() {
  Serial.begin(9600);
  delay(1000);
  EEPROM.begin(EEPROM_SIZE);

  // Initialize I2C display
  Wire.begin(4, 5);
  lcd.begin(16, 2);
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("System Ready");
  
  connectToWiFi();
  initializeRFID();
}

void loop() {
  if (mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial()) {
    readCardData();

    if (!studentId.isEmpty() && (facultyId == "COMP" || facultyId.isEmpty())) {
      markAttendance();
    } else {
      checkFacultyLogin();
    }

    // Reset IDs for the next card scan
    studentId = "";
    facultyId = "";

    mfrc522.PICC_HaltA();
    mfrc522.PCD_StopCrypto1();
  } else {
    delay(100);  // Small delay to avoid continuous polling
  }
}

void connectToWiFi() {
  Serial.println("Connecting to WiFi...");
  displayWrappedMessage("Connecting WiFi...");
  
  WiFi.begin(ssid, password);
  unsigned long startTime = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - startTime < 15000) {
    delay(1000);
    Serial.print(".");
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi Connected! IP: " + WiFi.localIP().toString());
    displayWrappedMessage("WiFi Connected!");
  } else {
    displayWrappedMessage("WiFi Failed!");
    logError("WiFi Connection Failed");
    delay(5000);  // Wait for a while before retrying
  }
}

void initializeRFID() {
  SPI.begin();
  mfrc522.PCD_Init();
  Serial.println("RFID Reader Initialized");
  displayWrappedMessage("RFID Ready");
  
  for (byte i = 0; i < 6; i++) key.keyByte[i] = 0xFF;
}

// Read card data for student and faculty IDs
void readCardData() {
  byte block0[18], block1[18], readBlockData[18], readBlockDataS[18];
  readDataFromBlock(5, readBlockData); 
  readDataFromBlock(4, readBlockDataS); 
  readDataFromBlock(1, block0); 
  readDataFromBlock(2, block1);

  String blockData = String((char*)readBlockData);
  blockData.trim();  // Trim whitespace here after conversion to String

  String blockDataS = String((char*)readBlockDataS);
  blockDataS.trim();  // Trim whitespace here as well

  if (blockData != "COMP" && !blockData.isEmpty()) {
    facultyId = blockData;
    Serial.println("Extracted Faculty ID: " + facultyId);
    displayWrappedMessage("Faculty ID: " + facultyId);
  } else if (blockDataS.isEmpty()) {
    studentId = String((char*)block0).substring(0, 8) + String((char*)block1).substring(0, 7);
    Serial.println("Extracted Student ID: " + studentId);
    displayWrappedMessage("Student ID: " + studentId);
    facultyId = "COMP";  // Default to faculty ID for empty block
  } else {
    studentId = blockDataS;
    Serial.println("Student ID: " + studentId);
    displayWrappedMessage("Student ID: " + studentId);
    facultyId = "COMP";  // Default to faculty ID
  }
}

void checkFacultyLogin() {
  String payload = "{\"facultyId\":\"" + facultyId + "\"}";
  String response;
  Serial.println("Sending Faculty ID: " + facultyId);

  if (sendHttpRequest(facultyLoginUrl, payload, response)) {
    DynamicJsonDocument doc(1024);
    deserializeJson(doc, response);
    const char* message = doc["message"];
    Serial.println("Parsed Message: " + String(message));
    displayWrappedMessage(message);
  } else {
    displayWrappedMessage("Login Failed!");
  }
}

// Mark attendance by sending student ID to the server
void markAttendance() {
  String payload = "{\"studentId\":\"" + studentId + "\"}";
  String response;
  Serial.println("Marking Attendance for Student ID: " + studentId);

  if (sendHttpRequest(attendanceMarkUrl, payload, response)) {
    DynamicJsonDocument doc(1024);
    deserializeJson(doc, response);
    const char* message = doc["message"];
    Serial.println("Parsed Message: " + String(message));
    displayWrappedMessage("Attendance: " + String(message));
  } else {
    displayWrappedMessage("Marking Failed");
  }
}

// Function to read data from a specific RFID block
void readDataFromBlock(int blockNum, byte* readBlockData) {
  byte bufferLen = 18;
  status = mfrc522.PCD_Authenticate(MFRC522::PICC_CMD_MF_AUTH_KEY_A, blockNum, &key, &(mfrc522.uid));
  if (status != MFRC522::STATUS_OK) {
    String error = "Authentication failed: " + String(mfrc522.GetStatusCodeName(status));
    Serial.println(error);
    logError(error);
    return;
  }

  status = mfrc522.MIFARE_Read(blockNum, readBlockData, &bufferLen);
  if (status != MFRC522::STATUS_OK) {
    String error = "Reading failed: " + String(mfrc522.GetStatusCodeName(status));
    Serial.println(error);
    logError(error);
    return;
  }

  readBlockData[bufferLen - 1] = '\0';  // Null terminate the data
}

// Log error message to EEPROM
void logError(String message) {
  int addr = LOG_ADDRESS;
  for (int i = 0; i < message.length(); i++) {
    EEPROM.write(addr++, message[i]);
    if (addr >= EEPROM_SIZE) {
      addr = LOG_ADDRESS;  // Wrap around if EEPROM overflows
    }
  }
  EEPROM.write(addr, '\0');  // Null terminate the log
  EEPROM.commit();
}

// Function to get log from EEPROM
String getLog() {
  String log = "";
  for (int addr = LOG_ADDRESS; addr < EEPROM_SIZE; addr++) {
    char c = EEPROM.read(addr);
    if (c == '\0') break;
    log += c;
  }
  return log;
}

// Function to send HTTP request and return response
bool sendHttpRequest(const String &url, const String &payload, String &response) {
  WiFiClientSecure client;
  client.setInsecure();
  
  HTTPClient http;
  http.begin(client, url);
  http.addHeader("Content-Type", "application/json");

  int httpResponseCode = http.POST(payload);
  if (httpResponseCode > 0) {
    response = http.getString();
    http.end();
    return true;
  } else {
    String error = "HTTP request failed, error code: " + String(httpResponseCode);
    Serial.println(error);
    logError(error);
    http.end();
    return false;
  }
}

// Display message on LCD with automatic line wrapping
void displayWrappedMessage(String message) {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(message.substring(0, 16));
  if (message.length() > 16) {
    lcd.setCursor(0, 1);
    lcd.print(message.substring(16));
  }
}
