package com.example.faceattendance.controller;

import com.example.faceattendance.entity.Meeting;
import com.example.faceattendance.service.MeetingService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMultipartHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(MeetingController.class)
public class MeetingControllerTest {

    @TempDir
    Path tempDir;

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MeetingService meetingService;

    @Autowired
    private ObjectMapper objectMapper;

    private Meeting sampleMeeting;
    private Path audioFile;
    private Path videoFile;

    @BeforeEach
    void setUp() throws IOException {
        sampleMeeting = new Meeting();
        sampleMeeting.setMeetingId(1L);
        sampleMeeting.setMeetingTitle("Test Meeting");
        sampleMeeting.setMeetingDate(LocalDate.of(2023, 10, 1));
        sampleMeeting.setStartTime(LocalTime.of(10, 0));
        sampleMeeting.setEndTime(LocalTime.of(11, 0));
        sampleMeeting.setStatus(Meeting.MeetingStatus.SCHEDULED);

        // Create directories and dummy files for audio/video tests
        Path audioDir = tempDir.resolve("recordings/audio");
        Files.createDirectories(audioDir);
        audioFile = audioDir.resolve("test.mp3");
        Files.write(audioFile, "dummy audio".getBytes());

        Path videoDir = tempDir.resolve("recordings/video");
        Files.createDirectories(videoDir);
        videoFile = videoDir.resolve("test.mp4");
        Files.write(videoFile, "dummy video".getBytes());
    }

    @Test
    void testScheduleMeeting() throws Exception {
        when(meetingService.scheduleMeeting(anyString(), any(LocalDate.class), any(LocalTime.class),
                any(LocalTime.class), anyLong(), anyList()))
                .thenReturn(sampleMeeting);

        mockMvc.perform(post("/meetings/schedule")
                .param("title", "Test Meeting")
                .param("date", "2023-10-01")
                .param("startTime", "10:00")
                .param("endTime", "11:00")
                .param("organizerId", "1")
                .param("participantIds", "1,2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.meetingTitle").value("Test Meeting"));
    }

    @Test
    void testStartMeeting() throws Exception {
        sampleMeeting.setStatus(Meeting.MeetingStatus.IN_PROGRESS);
        when(meetingService.startMeeting(1L)).thenReturn(sampleMeeting);

        mockMvc.perform(put("/meetings/1/start"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));
    }

    @Test
    void testStopMeeting() throws Exception {
        sampleMeeting.setStatus(Meeting.MeetingStatus.COMPLETED);
        MockMultipartFile recording = new MockMultipartFile("recording", "test.mp3", "audio/mpeg",
                "test data".getBytes());
        when(meetingService.stopMeeting(eq(1L), any())).thenReturn(sampleMeeting);

        MockMultipartHttpServletRequestBuilder builder = multipart("/meetings/1/stop");
        builder.with(new RequestPostProcessor() {
            @Override
            public MockHttpServletRequest postProcessRequest(MockHttpServletRequest request) {
                request.setMethod("PUT");
                return request;
            }
        });

        mockMvc.perform(builder.file(recording))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"));
    }

    @Test
    void testGetMeetingById() throws Exception {
        when(meetingService.getMeetingById(1L)).thenReturn(Optional.of(sampleMeeting));

        mockMvc.perform(get("/meetings/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.meetingTitle").value("Test Meeting"));
    }

    @Test
    void testGetMeetingByIdNotFound() throws Exception {
        when(meetingService.getMeetingById(1L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/meetings/1"))
                .andExpect(status().isNotFound());
    }

    @Test
    void testGetMeetingAudio() throws Exception {
        sampleMeeting.setMeetingAudioPath("recordings/audio/test.mp3");
        when(meetingService.getMeetingById(1L)).thenReturn(Optional.of(sampleMeeting));

        mockMvc.perform(get("/meetings/1/audio"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "attachment; filename=\"test.mp3\""));
    }

    @Test
    void testGetMeetingVideo() throws Exception {
        sampleMeeting.setMeetingVideoPath("recordings/video/test.mp4");
        when(meetingService.getMeetingById(1L)).thenReturn(Optional.of(sampleMeeting));

        mockMvc.perform(get("/meetings/1/video"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "attachment; filename=\"test.mp4\""));
    }
}
