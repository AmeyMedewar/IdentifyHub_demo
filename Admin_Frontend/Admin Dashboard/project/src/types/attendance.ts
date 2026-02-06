export enum AttendanceStatus {
  PRESENT = "PRESENT",
  ABSENT = "ABSENT"
}

export interface Attendance {
  id: number;
  userId: number;
  userName?: string;

  date: string;
  checkInTime?: string;
  checkOutTime?: string;

  attendanceStatus: AttendanceStatus;

  createdAt: string;
  updatedAt: string;
}

export interface CreateAttendanceDTO {
  userId: number;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  attendanceStatus: AttendanceStatus;
}

export interface UpdateAttendanceDTO {
  checkInTime?: string;
  checkOutTime?: string;
  attendanceStatus?: AttendanceStatus;
}
