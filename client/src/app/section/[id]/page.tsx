"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface AttendanceEntry {
  id: number;
  studentId: string | null;
  name: string;
  date: string;
  timeIn: string;
  isFaculty: boolean;
  section: string;
  facultyId: string | null;
}

export default function SectionPage() {
  const { id: section } = useParams(); // Extract `id` parameter from the route
  const [attendanceData, setAttendanceData] = useState<AttendanceEntry[]>([]);

  useEffect(() => {
    if (section) {
      fetch(`https://aas-api.vercel.app/api/v1/main/attendance/section/${section}`)
        .then((response) => response.json())
        .then((data: AttendanceEntry[]) => setAttendanceData(data))
        .catch((error) => console.error("Error fetching data:", error));
    }
  }, [section]);

  return (
    <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">ID</th>
            <th scope="col" className="px-6 py-3">Name</th>
            <th scope="col" className="px-6 py-3">Date</th>
            <th scope="col" className="px-6 py-3">Time In</th>
            <th scope="col" className="px-6 py-3">Role</th>
          </tr>
        </thead>
        <tbody>
          {attendanceData.map((entry) => (
            <tr
              key={entry.id}
              className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700"
            >
              <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                {entry.id}
              </th>
              <td className="px-6 py-4">{entry.name}</td>
              <td className="px-6 py-4">{new Date(entry.date).toLocaleDateString()}</td>
              <td className="px-6 py-4">{new Date(entry.timeIn).toLocaleTimeString()}</td>
              <td className="px-6 py-4">{entry.isFaculty ? "Faculty" : "Student"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
