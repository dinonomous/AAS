// server.js
const express = require("express");
const attendanceRoutes = require("./routes/mainRoutes");
require("dotenv").config();
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const app = express();
const PORT = process.env.PORT || 3000;
const prisma = new PrismaClient();
const allowedOrigins = [
  "https://aasfe.vercel.app",
  "http://192.168.30.169",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or ESP modules)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
  })
);
app.use(express.json());

app.use("/api/v1/main", attendanceRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
