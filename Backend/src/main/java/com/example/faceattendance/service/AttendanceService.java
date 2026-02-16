 package com.example.faceattendance.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.faceattendance.dto.AttendanceRequestDTO;
import com.example.faceattendance.entity.Attendance;
import com.example.faceattendance.entity.User;
import com.example.faceattendance.repository.AttendanceRepository;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private UserService userService;

    @Transactional
    public String checkIn(AttendanceRequestDTO attendanceRequestDTO) {
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
            if (attendance.getCheckInTime() != null) {
                return "Already checked in for today";
            } else {
                // If somehow no check-in time, set it
                attendance.setCheckInTime(LocalDateTime.now());
                attendance.setAttendanceStatus(Attendance.AttendanceStatus.PRESENT);
                attendanceRepository.save(attendance);
                user.setCurrentStatus(User.AttendanceStatus.PRESENT);
                userService.saveUser(user);
                return "Check-in successful";
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

    @Transactional
    public String checkOut(AttendanceRequestDTO attendanceRequestDTO) {
        Optional<User> userOpt = userService.getUserEntityById(attendanceRequestDTO.getUserId());
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOpt.get();
        LocalDate today = LocalDate.now();

        // Check if attendance exists for today
        Optional<Attendance> existingAttendance = attendanceRepository.findByUserAndDate(user, today);

        if (existingAttendance.isPresent()) {
            Attendance attendance = existingAttendance.get();
            if (attendance.getCheckInTime() != null && attendance.getCheckOutTime() == null) {
                LocalDateTime checkOutTime = LocalDateTime.now();
                attendance.setCheckOutTime(checkOutTime);
                // Calculate work hours
                long seconds = java.time.Duration.between(attendance.getCheckInTime(), checkOutTime).getSeconds();
                BigDecimal hours = BigDecimal.valueOf(seconds).divide(BigDecimal.valueOf(3600), 2, RoundingMode.HALF_UP);
                attendance.setWorkHours(hours);
                attendanceRepository.save(attendance);
                user.setCurrentStatus(User.AttendanceStatus.ABSENT); // Reset to absent after check out
                userService.saveUser(user);
                return "Check-out successful. Work hours: " + attendance.getWorkHours();
            } else if (attendance.getCheckOutTime() != null) {
                return "Already checked out for today";
            } else {
                return "Cannot check out without check-in";
            }
        } else {
            return "No check-in record found for today";
        }
    }

    @Transactional
    public String markAttendance(AttendanceRequestDTO attendanceRequestDTO) {
        // Keep the old method for backward compatibility, but delegate to new methods
        Optional<User> userOpt = userService.getUserEntityById(attendanceRequestDTO.getUserId());
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOpt.get();
        LocalDate today = LocalDate.now();

        Optional<Attendance> existingAttendance = attendanceRepository.findByUserAndDate(user, today);

        if (existingAttendance.isPresent()) {
            Attendance attendance = existingAttendance.get();
            if (attendance.getCheckInTime() != null && attendance.getCheckOutTime() == null) {
                return checkOut(attendanceRequestDTO);
            } else {
                return "Already checked out for today";
            }
        } else {
            return checkIn(attendanceRequestDTO);
        }
    }

    public Optional<Attendance> getAttendanceByUserAndDate(User user, LocalDate date) {
        return attendanceRepository.findByUserAndDate(user, date);
    }

      //  AUTO CHECKOUT IF FORGET TO CHECKOUT
    @Scheduled(cron = "0 5 0 * * *",  zone = "Asia/Kolkata") // runs daily at 12:05 AM
    @Transactional
    public void autoCheckOutForgottenUsers() {
        LocalDate today = LocalDate.now();

        List<Attendance> pendingAttendances =
                attendanceRepository.findByCheckInTimeNotNullAndCheckOutTimeIsNullAndDateBefore(today);

        for (Attendance attendance : pendingAttendances) {
            LocalDateTime autoCheckoutTime = attendance.getDate().atTime(23, 59, 59);
            attendance.setCheckOutTime(autoCheckoutTime);

            long seconds = java.time.Duration
                    .between(attendance.getCheckInTime(), autoCheckoutTime)
                    .getSeconds();
                    
            BigDecimal hours = BigDecimal.valueOf(seconds)
                    .divide(BigDecimal.valueOf(3600), 2, RoundingMode.HALF_UP);

            attendance.setWorkHours(hours);
            attendanceRepository.save(attendance);

            User user = attendance.getUser();
            user.setCurrentStatus(User.AttendanceStatus.ABSENT);
            userService.saveUser(user);
        }
    }
}
