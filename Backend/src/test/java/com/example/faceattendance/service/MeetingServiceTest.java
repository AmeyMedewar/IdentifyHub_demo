package com.example.faceattendance.service;

import com.example.faceattendance.entity.Meeting;
import com.example.faceattendance.entity.User;
import com.example.faceattendance.repository.MeetingRepository;
import com.example.faceattendance.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;
import java.util.Arrays;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MeetingServiceTest {

    @Mock
    private MeetingRepository meetingRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private MeetingService meetingService;

    private User organizer;
    private User participant;
    private Meeting meeting;

    @BeforeEach
    void setUp() {
        organizer = new User();
        organizer.setId(1L);

        participant = new User();
        participant.setId(2L);

        meeting = new Meeting();
        meeting.setMeetingTitle("Test Meeting");
        meeting.setMeetingDate(LocalDate.now());
        meeting.setStartTime(LocalTime.now());
        meeting.setEndTime(LocalTime.now().plusHours(1));
        meeting.setOrganizer(organizer);
        meeting.setStatus(Meeting.MeetingStatus.SCHEDULED);
    }

    @Test
    void scheduleMeeting_validOrganizerAndParticipants_success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(organizer));
        when(userRepository.findById(2L)).thenReturn(Optional.of(participant));
        when(meetingRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        Meeting result = meetingService.scheduleMeeting(
                "Test Meeting",
                LocalDate.now(),
                LocalTime.now(),
                LocalTime.now().plusHours(1),
                1L,
                Arrays.asList(2L));

        assertNotNull(result);
        assertEquals(Meeting.MeetingStatus.SCHEDULED, result.getStatus());
    }

    @Test
    void scheduleMeeting_organizerNotFound_throwsException() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> meetingService.scheduleMeeting(
                "Test Meeting",
                LocalDate.now(),
                LocalTime.now(),
                LocalTime.now().plusHours(1),
                1L,
                Arrays.asList(2L)));

        assertEquals("Organizer not found", ex.getMessage());
        verify(meetingRepository, never()).save(any());
    }

    @Test
    void scheduleMeeting_participantNotFound_throwsException() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(organizer));
        when(userRepository.findById(2L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> meetingService.scheduleMeeting(
                "Test Meeting",
                LocalDate.now(),
                LocalTime.now(),
                LocalTime.now().plusHours(1),
                1L,
                Arrays.asList(2L)));

        assertEquals("Participant not found", ex.getMessage());
        verify(meetingRepository, never()).save(any());
    }

    @Test
    void scheduleMeeting_emptyParticipants_throwsException() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> meetingService.scheduleMeeting(
                "Test Meeting",
                LocalDate.now(),
                LocalTime.now(),
                LocalTime.now().plusHours(1),
                1L,
                Collections.emptyList()));

        assertEquals("At least one participant is required", ex.getMessage());
        verify(meetingRepository, never()).save(any());
    }

    @Test
    void scheduleMeeting_endTimeNotAfterStartTime_throwsException() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> meetingService.scheduleMeeting(
                "Test Meeting",
                LocalDate.now(),
                LocalTime.of(11, 0),
                LocalTime.of(10, 0),
                1L,
                Arrays.asList(2L)));

        assertEquals("End time must be after start time", ex.getMessage());
        verify(meetingRepository, never()).save(any());
    }

    @Test
    void scheduleMeeting_pastDate_throwsException() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> meetingService.scheduleMeeting(
                "Test Meeting",
                LocalDate.now().minusDays(1),
                LocalTime.of(10, 0),
                LocalTime.of(11, 0),
                1L,
                Arrays.asList(2L)));

        assertEquals("Meeting date cannot be in the past", ex.getMessage());
        verify(meetingRepository, never()).save(any());
    }

    @Test
    void startMeeting_validScheduledMeeting() {
        when(meetingRepository.findById(1L)).thenReturn(Optional.of(meeting));
        when(meetingRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        Meeting result = meetingService.startMeeting(1L);

        assertEquals(Meeting.MeetingStatus.IN_PROGRESS, result.getStatus());
    }

    @Test
    void startMeeting_notFound_throwsException() {
        when(meetingRepository.findById(1L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> meetingService.startMeeting(1L));
        assertEquals("Meeting not found", ex.getMessage());
    }

    @Test
    void startMeeting_invalidStatus_throwsException() {
        meeting.setStatus(Meeting.MeetingStatus.COMPLETED);
        when(meetingRepository.findById(1L)).thenReturn(Optional.of(meeting));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> meetingService.startMeeting(1L));
        assertEquals("Meeting cannot be started", ex.getMessage());
        verify(meetingRepository, never()).save(any());
    }

    @Test
    void getMeetingById_found() {
        when(meetingRepository.findById(1L)).thenReturn(Optional.of(meeting));

        Optional<Meeting> result = meetingService.getMeetingById(1L);

        assertTrue(result.isPresent());
    }

    @Test
    void getMeetingById_notFound() {
        when(meetingRepository.findById(1L)).thenReturn(Optional.empty());

        Optional<Meeting> result = meetingService.getMeetingById(1L);

        assertTrue(result.isEmpty());
    }

    // =============================
    // NEW TESTS FOR COVERAGE
    // =============================

    @Test
    void stopMeeting_success() throws Exception {

        meeting.setStatus(Meeting.MeetingStatus.IN_PROGRESS);

        MultipartFile mockFile = mock(MultipartFile.class);
        when(mockFile.getContentType()).thenReturn("video/mp4");
        when(mockFile.getOriginalFilename()).thenReturn("test.mp4");
        when(mockFile.getBytes()).thenReturn("data".getBytes());

        when(meetingRepository.findById(1L)).thenReturn(Optional.of(meeting));
        when(meetingRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        try (MockedStatic<Files> mockedFiles = mockStatic(Files.class);
             MockedStatic<Paths> mockedPaths = mockStatic(Paths.class)) {

            Path mockPath = mock(Path.class);

            mockedPaths.when(() -> Paths.get(anyString(), anyString()))
                    .thenReturn(mockPath);

            when(mockPath.getParent()).thenReturn(mockPath);
            when(mockPath.toString()).thenReturn("recordings/video/test.mp4");

            mockedFiles.when(() -> Files.createDirectories(any())).thenAnswer(i -> null);
            mockedFiles.when(() -> Files.write(any(), any(byte[].class))).thenAnswer(i -> null);

            Meeting result = meetingService.stopMeeting(1L, mockFile);

            assertEquals(Meeting.MeetingStatus.COMPLETED, result.getStatus());
            assertNotNull(result.getMeetingVideoPath());

            verify(meetingRepository).save(any());
        }
    }

    @Test
    void stopMeeting_fileWriteIOException() throws Exception {

        meeting.setStatus(Meeting.MeetingStatus.IN_PROGRESS);

        MultipartFile mockFile = mock(MultipartFile.class);
        when(mockFile.getContentType()).thenReturn("video/mp4");
        when(mockFile.getOriginalFilename()).thenReturn("test.mp4");
        when(mockFile.getBytes()).thenReturn("data".getBytes());

        when(meetingRepository.findById(1L)).thenReturn(Optional.of(meeting));

        try (MockedStatic<Files> mockedFiles = mockStatic(Files.class);
             MockedStatic<Paths> mockedPaths = mockStatic(Paths.class)) {

            Path mockPath = mock(Path.class);

            mockedPaths.when(() -> Paths.get(anyString(), anyString()))
                    .thenReturn(mockPath);

            when(mockPath.getParent()).thenReturn(mockPath);

            mockedFiles.when(() -> Files.createDirectories(any())).thenAnswer(i -> null);

            mockedFiles.when(() -> Files.write(any(), any(byte[].class)))
                    .thenThrow(new IOException("Write failed"));

            assertThrows(IOException.class,
                    () -> meetingService.stopMeeting(1L, mockFile));
        }
    }

    @Test
    void stopMeeting_notFound_throwsException() {
        MultipartFile mockFile = mock(MultipartFile.class);
        when(meetingRepository.findById(1L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> meetingService.stopMeeting(1L, mockFile));
        assertEquals("Meeting not found", ex.getMessage());
    }

    @Test
    void stopMeeting_invalidStatus_throwsException() {
        meeting.setStatus(Meeting.MeetingStatus.SCHEDULED);

        MultipartFile mockFile = mock(MultipartFile.class);
        when(meetingRepository.findById(1L)).thenReturn(Optional.of(meeting));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> meetingService.stopMeeting(1L, mockFile));
        assertEquals("Meeting is not in progress", ex.getMessage());
        verify(meetingRepository, never()).save(any());
    }
}
