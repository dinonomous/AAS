const express = require("express");
const attendanceRoutes = require("./routes/mainRoutes");
require("dotenv").config();
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const app = express();
const PORT = process.env.PORT || 3100;
const prisma = new PrismaClient();
const allowedOrigins = [
  "https://aasfe.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests from specified origins
      if (!origin) {
        return callback(null, true); // Allow mobile apps or ESP modules without origin headers
      }
      
      const originIsAllowed = allowedOrigins.includes(origin);

      // Check if the origin IP matches the local network range (192.168.x.x)
      const isLocalNetwork = origin && origin.startsWith("http://192.168.");

      if (originIsAllowed || isLocalNetwork) {
        return callback(null, true);
      }

      // If origin not allowed, return an error
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
