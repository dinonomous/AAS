// attendanceRoutes.js

const express = require("express");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();
const prisma = new PrismaClient();

router.post("/faculty/login/:section", async (req, res) => {
  const { section } = req.params;
  const { facultyId } = req.body;
  const attendanceDate = new Date();

  try {
    const faculty = await prisma.faculty.findUnique({
      where: { facultyId: facultyId },
    });

    if (faculty) {
      const existingAttendance = await prisma.attendance.findFirst({
        where: {
          facultyId: facultyId,
          date: {
            gte: new Date(attendanceDate.setHours(0, 0, 0, 0)),
            lt: new Date(attendanceDate.setHours(23, 59, 59, 999)),
          },
        },
      });

      if (existingAttendance) {
        return res
          .status(200)
          .json({ message: "Attendance already marked for today", faculty });
      }

      const attendance = await prisma.attendance.create({
        data: {
          studentId: null,
          name: faculty.name,
          date: new Date(),
          timeIn: new Date(),
          section: section,
          isFaculty: true,
          facultyId: facultyId,
        },
      });

      res.status(200).json({
        message: "Login successful and attendance marked",
        faculty,
        attendance,
      });
    } else {
      res.status(401).json({ message: "Invalid faculty ID" });
    }
  } catch (error) {
    console.error("Error logging in faculty:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route for marking attendance
router.post("/attendance/mark/:section", async (req, res) => {
  const { studentId } = req.body;
  const { section } = req.params;
  const attendanceDate = new Date();
  const startOfDay = new Date(attendanceDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(attendanceDate.setHours(23, 59, 59, 999));

  try {
    // Check if the first entry of the day is a faculty
    const firstEntry = await prisma.attendance.findFirst({
      where: {
        date: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
      orderBy: {
        timeIn: "asc",
      },
    });

    if (!firstEntry || !firstEntry.isFaculty) {
      return res.status(400).json({
        message:
          "Attendance marking requires a faculty entry as the first entry of the day.",
      });
    }

    // Validate student existence and section
    const student = await prisma.student.findUnique({
      where: { studentId },
    });

    if (!student || student.section !== section) {
      return res
        .status(400)
        .json({ message: "Student not found or not in specified section." });
    }

    // Check if the student has already marked attendance today
    const duplicateEntry = await prisma.attendance.findFirst({
      where: {
        studentId,
        date: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
    });

    if (duplicateEntry) {
      return res
        .status(400)
        .json({ message: "Attendance already marked for this student today." });
    }

    // Mark attendance for the student
    const attendance = await prisma.attendance.create({
      data: {
        studentId,
        name: student.name,
        date: new Date(),
        timeIn: new Date(),
        section,
        isFaculty: false,
        facultyId: null,
      },
    });

    res.status(201).json({
      message: "Attendance marked successfully for student",
      attendance,
    });
  } catch (error) {
    console.error("Error marking attendance:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/attendance/section/:section", async (req, res) => {
  const { section } = req.params;
  try {
    const attendance = await prisma.attendance.findMany({
      where: { section },
    });

    res.status(200).json(attendance);
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route for getting attendance records for a specific student
router.get("/attendance/student/:studentId", async (req, res) => {
  const { studentId } = req.params;
  try {
    const attendances = await prisma.attendance.findMany({
      where: { studentId },
      include: { faculty: true },
    });

    res.status(200).json(attendances);
  } catch (error) {
    console.error("Error fetching attendance records for student:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
