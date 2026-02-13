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

    @PostMapping("/checkin")
    public ResponseEntity<String> checkIn(@Valid @RequestBody AttendanceRequestDTO attendanceRequestDTO) {
        String result = attendanceService.checkIn(attendanceRequestDTO);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/checkout")
    public ResponseEntity<String> checkOut(@Valid @RequestBody AttendanceRequestDTO attendanceRequestDTO) {
        String result = attendanceService.checkOut(attendanceRequestDTO);
        return ResponseEntity.ok(result);
    }
}
