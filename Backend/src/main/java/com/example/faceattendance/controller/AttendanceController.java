package com.example.faceattendance.controller;

import com.example.faceattendance.dto.AttendanceRequestDTO;
import com.example.faceattendance.service.AttendanceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/attendance")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @PostMapping("/mark")
    public ResponseEntity<String> markAttendance(@Valid @RequestBody AttendanceRequestDTO attendanceRequestDTO) {
        try {
            String result = attendanceService.markAttendance(attendanceRequestDTO);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error marking attendance: " + e.getMessage());
        }
    }
}
