package com.example.faceattendance.service;

import com.example.faceattendance.dto.AttendanceRequestDTO;
import com.example.faceattendance.entity.Attendance;
import com.example.faceattendance.entity.User;
import com.example.faceattendance.repository.AttendanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private UserService userService;

    @Transactional
    public String markAttendance(AttendanceRequestDTO attendanceRequestDTO) {
        Optional<User> userOpt = userService.getUserEntityById(attendanceRequestDTO.getUserId());
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOpt.get();
        LocalDate today = LocalDate.now();

        // Check if attendance already exists for today
        Optional<Attendance> existingAttendance = attendanceRepository.findByUserAndDate(user, today);

        if (existingAttendance.isPresent()) {
            Attendance attendance = existingAttendance.get();
            // If already checked in, allow check out
            if (attendance.getCheckInTime() != null && attendance.getCheckOutTime() == null) {
                attendance.setCheckOutTime(LocalDateTime.now());
                attendanceRepository.save(attendance);
                user.setCurrentStatus(User.AttendanceStatus.ABSENT); // Reset to absent after check out
                userService.saveUser(user);
                return "Check-out successful";
            } else {
                return "Already checked out for today";
            }
        } else {
            // New attendance for today
            Attendance attendance = new Attendance();
            attendance.setUser(user);
            attendance.setDate(today);
            attendance.setCheckInTime(LocalDateTime.now());
            attendance.setAttendanceStatus(Attendance.AttendanceStatus.PRESENT);
            attendanceRepository.save(attendance);

            user.setCurrentStatus(User.AttendanceStatus.PRESENT);
            userService.saveUser(user);

            return "Check-in successful";
        }
    }

    public Optional<Attendance> getAttendanceByUserAndDate(User user, LocalDate date) {
        return attendanceRepository.findByUserAndDate(user, date);
    }
}
