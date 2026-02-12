package com.example.faceattendance.controller;

import com.example.faceattendance.dto.AttendanceRequestDTO;
import com.example.faceattendance.service.AttendanceService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class AttendanceControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AttendanceService attendanceService;

    @InjectMocks
    private AttendanceController attendanceController;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(attendanceController).build();
        objectMapper = new ObjectMapper();
    }

    @Test
    void testCheckIn_Success() throws Exception {
        AttendanceRequestDTO requestDTO = new AttendanceRequestDTO();
        requestDTO.setUserId(1L);

        when(attendanceService.checkIn(any(AttendanceRequestDTO.class))).thenReturn("Check-in successful");

        mockMvc.perform(post("/attendance/checkin")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isOk())
                .andExpect(content().string("Check-in successful"));
    }

    @Test
    void testCheckIn_Failure() throws Exception {
        AttendanceRequestDTO requestDTO = new AttendanceRequestDTO();
        requestDTO.setUserId(1L);

        when(attendanceService.checkIn(any(AttendanceRequestDTO.class))).thenThrow(new RuntimeException("User not found"));

        mockMvc.perform(post("/attendance/checkin")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Error during check-in: User not found"));
    }

    @Test
    void testCheckOut_Success() throws Exception {
        AttendanceRequestDTO requestDTO = new AttendanceRequestDTO();
        requestDTO.setUserId(1L);

        when(attendanceService.checkOut(any(AttendanceRequestDTO.class))).thenReturn("Check-out successful. Work hours: 8.50");

        mockMvc.perform(post("/attendance/checkout")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isOk())
                .andExpect(content().string("Check-out successful. Work hours: 8.50"));
    }

    @Test
    void testCheckOut_Failure() throws Exception {
        AttendanceRequestDTO requestDTO = new AttendanceRequestDTO();
        requestDTO.setUserId(1L);

        when(attendanceService.checkOut(any(AttendanceRequestDTO.class))).thenThrow(new RuntimeException("No check-in record found"));

        mockMvc.perform(post("/attendance/checkout")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Error during check-out: No check-in record found"));
    }

    @Test
    void testCheckOut_AlreadyCheckedOut() throws Exception {
        AttendanceRequestDTO requestDTO = new AttendanceRequestDTO();
        requestDTO.setUserId(1L);

        when(attendanceService.checkOut(any(AttendanceRequestDTO.class))).thenReturn("Already checked out for today");

        mockMvc.perform(post("/attendance/checkout")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isOk())
                .andExpect(content().string("Already checked out for today"));
    }

    @Test
    void testCheckOut_NoCheckIn() throws Exception {
        AttendanceRequestDTO requestDTO = new AttendanceRequestDTO();
        requestDTO.setUserId(1L);

        when(attendanceService.checkOut(any(AttendanceRequestDTO.class))).thenReturn("No check-in record found for today");

        mockMvc.perform(post("/attendance/checkout")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isOk())
                .andExpect(content().string("No check-in record found for today"));
    }
}
