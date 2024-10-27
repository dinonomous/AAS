/*
  Warnings:

  - You are about to drop the column `section` on the `Faculty` table. All the data in the column will be lost.
  - Added the required column `section` to the `Attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `section` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_facultyId_fkey";

-- DropForeignKey
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_studentId_fkey";

-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "section" TEXT NOT NULL,
ALTER COLUMN "studentId" DROP NOT NULL,
ALTER COLUMN "facultyId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Faculty" DROP COLUMN "section";

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "section" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("studentId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty"("facultyId") ON DELETE SET NULL ON UPDATE CASCADE;
