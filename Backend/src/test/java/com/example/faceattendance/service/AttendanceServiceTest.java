package com.example.faceattendance.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;

import com.example.faceattendance.dto.AttendanceRequestDTO;
import com.example.faceattendance.entity.Attendance;
import com.example.faceattendance.entity.User;
import com.example.faceattendance.repository.AttendanceRepository;

class AttendanceServiceTest {

    @Mock
    private AttendanceRepository attendanceRepository;

    @Mock
    private UserService userService;

    @InjectMocks
    private AttendanceService attendanceService;

    private User testUser;
    private AttendanceRequestDTO requestDTO;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        testUser = new User();
        testUser.setId(1L);
        testUser.setName("Test User");

        requestDTO = new AttendanceRequestDTO();
        requestDTO.setUserId(1L);
    }

    // ================= CHECK IN =================

    @Test
    void testCheckIn_NewAttendance() {
        when(userService.getUserEntityById(1L)).thenReturn(Optional.of(testUser));
        when(attendanceRepository.findByUserAndDate(testUser, LocalDate.now()))
                .thenReturn(Optional.empty());

        String result = attendanceService.checkIn(requestDTO);

        assertEquals("Check-in successful", result);
        verify(attendanceRepository).save(any(Attendance.class));
        verify(userService).saveUser(testUser);
        assertEquals(User.AttendanceStatus.PRESENT, testUser.getCurrentStatus());
    }

    @Test
    void testCheckIn_AlreadyCheckedIn() {
        Attendance existingAttendance = new Attendance();
        existingAttendance.setCheckInTime(LocalDateTime.now());

        when(userService.getUserEntityById(1L)).thenReturn(Optional.of(testUser));
        when(attendanceRepository.findByUserAndDate(testUser, LocalDate.now()))
                .thenReturn(Optional.of(existingAttendance));

        String result = attendanceService.checkIn(requestDTO);

        assertEquals("Already checked in for today", result);
        verify(attendanceRepository, never()).save(any());
    }

    @Test
    void testCheckIn_ExistingAttendanceButNoCheckInTime() {
        Attendance existingAttendance = new Attendance();
        existingAttendance.setCheckInTime(null);

        when(userService.getUserEntityById(1L)).thenReturn(Optional.of(testUser));
        when(attendanceRepository.findByUserAndDate(testUser, LocalDate.now()))
                .thenReturn(Optional.of(existingAttendance));

        String result = attendanceService.checkIn(requestDTO);

        assertEquals("Check-in successful", result);
        verify(attendanceRepository).save(existingAttendance);
        verify(userService).saveUser(testUser);
        assertNotNull(existingAttendance.getCheckInTime());
    }

    @Test
    void testCheckIn_UserNotFound() {
        when(userService.getUserEntityById(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> attendanceService.checkIn(requestDTO));
    }

    // ================= CHECK OUT =================

    @Test
    void testCheckOut_Success() {
        LocalDateTime checkInTime = LocalDateTime.now().minusHours(8);
        Attendance existingAttendance = new Attendance();
        existingAttendance.setCheckInTime(checkInTime);
        existingAttendance.setCheckOutTime(null);

        when(userService.getUserEntityById(1L)).thenReturn(Optional.of(testUser));
        when(attendanceRepository.findByUserAndDate(testUser, LocalDate.now()))
                .thenReturn(Optional.of(existingAttendance));

        String result = attendanceService.checkOut(requestDTO);

        assertTrue(result.startsWith("Check-out successful"));
        verify(attendanceRepository).save(existingAttendance);
        verify(userService).saveUser(testUser);
        assertEquals(User.AttendanceStatus.ABSENT, testUser.getCurrentStatus());
        assertNotNull(existingAttendance.getWorkHours());
        assertTrue(existingAttendance.getWorkHours().compareTo(BigDecimal.ZERO) > 0);
    }

    @Test
    void testCheckOut_AlreadyCheckedOut() {
        Attendance existingAttendance = new Attendance();
        existingAttendance.setCheckInTime(LocalDateTime.now().minusHours(8));
        existingAttendance.setCheckOutTime(LocalDateTime.now());

        when(userService.getUserEntityById(1L)).thenReturn(Optional.of(testUser));
        when(attendanceRepository.findByUserAndDate(testUser, LocalDate.now()))
                .thenReturn(Optional.of(existingAttendance));

        String result = attendanceService.checkOut(requestDTO);

        assertEquals("Already checked out for today", result);
        verify(attendanceRepository, never()).save(any());
    }

    @Test
    void testCheckOut_CannotCheckOutWithoutCheckIn() {
        Attendance existingAttendance = new Attendance();
        existingAttendance.setCheckInTime(null);

        when(userService.getUserEntityById(1L)).thenReturn(Optional.of(testUser));
        when(attendanceRepository.findByUserAndDate(testUser, LocalDate.now()))
                .thenReturn(Optional.of(existingAttendance));

        String result = attendanceService.checkOut(requestDTO);

        assertEquals("Cannot check out without check-in", result);
        verify(attendanceRepository, never()).save(any());
    }

    @Test
    void testCheckOut_NoCheckInRecord() {
        when(userService.getUserEntityById(1L)).thenReturn(Optional.of(testUser));
        when(attendanceRepository.findByUserAndDate(testUser, LocalDate.now()))
                .thenReturn(Optional.empty());

        String result = attendanceService.checkOut(requestDTO);

        assertEquals("No check-in record found for today", result);
    }

    @Test
    void testCheckOut_UserNotFound() {
        when(userService.getUserEntityById(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> attendanceService.checkOut(requestDTO));
    }

    // ================= MARK ATTENDANCE =================

    @Test
    void testMarkAttendance_UserNotFound() {
        when(userService.getUserEntityById(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> attendanceService.markAttendance(requestDTO));
    }

    @Test
    void testMarkAttendance_NewAttendance_ShouldCallCheckIn() {
        when(userService.getUserEntityById(1L)).thenReturn(Optional.of(testUser));
        when(attendanceRepository.findByUserAndDate(testUser, LocalDate.now()))
                .thenReturn(Optional.empty());

        String result = attendanceService.markAttendance(requestDTO);

        assertEquals("Check-in successful", result);
    }

    @Test
    void testMarkAttendance_ShouldCallCheckOut() {
        Attendance existingAttendance = new Attendance();
        existingAttendance.setCheckInTime(LocalDateTime.now().minusHours(5));
        existingAttendance.setCheckOutTime(null);

        when(userService.getUserEntityById(1L)).thenReturn(Optional.of(testUser));
        when(attendanceRepository.findByUserAndDate(testUser, LocalDate.now()))
                .thenReturn(Optional.of(existingAttendance));

        String result = attendanceService.markAttendance(requestDTO);

        assertTrue(result.startsWith("Check-out successful"));
    }

    @Test
    void testMarkAttendance_AlreadyCheckedOut() {
        Attendance existingAttendance = new Attendance();
        existingAttendance.setCheckInTime(LocalDateTime.now().minusHours(5));
        existingAttendance.setCheckOutTime(LocalDateTime.now());

        when(userService.getUserEntityById(1L)).thenReturn(Optional.of(testUser));
        when(attendanceRepository.findByUserAndDate(testUser, LocalDate.now()))
                .thenReturn(Optional.of(existingAttendance));

        String result = attendanceService.markAttendance(requestDTO);

        assertEquals("Already checked out for today", result);
    }

    // ================= GET METHOD =================

    @Test
    void testGetAttendanceByUserAndDate() {
        Attendance attendance = new Attendance();
        LocalDate date = LocalDate.now();

        when(attendanceRepository.findByUserAndDate(testUser, date))
                .thenReturn(Optional.of(attendance));

        Optional<Attendance> result =
                attendanceService.getAttendanceByUserAndDate(testUser, date);

        assertTrue(result.isPresent());
        assertEquals(attendance, result.get());
    }

    @Test
void testAutoCheckOutForgottenUsers() {
    // Arrange
    User user = new User();
    user.setId(1L);

    Attendance attendance = new Attendance();
    attendance.setUser(user);
    attendance.setDate(LocalDate.now().minusDays(1));
    attendance.setCheckInTime(LocalDateTime.now().minusHours(8));
    attendance.setCheckOutTime(null);

    List<Attendance> pendingList = List.of(attendance);

    when(attendanceRepository
            .findByCheckInTimeNotNullAndCheckOutTimeIsNullAndDateBefore(any(LocalDate.class)))
            .thenReturn(pendingList);

    // Act
    attendanceService.autoCheckOutForgottenUsers();

    // Assert
    assertNotNull(attendance.getCheckOutTime());
    assertNotNull(attendance.getWorkHours());

    verify(attendanceRepository).save(attendance);
    verify(userService).saveUser(user);
}

}
