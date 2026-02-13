package com.example.faceattendance.controller;

import com.example.faceattendance.entity.Meeting;
import com.example.faceattendance.exception.ConflictException;
import com.example.faceattendance.exception.ResourceNotFoundException;
import com.example.faceattendance.service.MeetingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;


@WebMvcTest(MeetingController.class)
class MeetingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MeetingService meetingService;

    private Meeting meeting;
    private MockMultipartFile file;

    @TempDir
    Path tempDir;

    @BeforeEach
    void setup() throws Exception {
        meeting = new Meeting();
        meeting.setMeetingTitle("Test Meeting");
        meeting.setMeetingDate(LocalDate.now());
        meeting.setStartTime(LocalTime.now());
        meeting.setEndTime(LocalTime.now().plusHours(1));
        meeting.setStatus(Meeting.MeetingStatus.SCHEDULED);

        Path audio = tempDir.resolve("meeting.mp3");
        Files.write(audio, "test".getBytes());
        meeting.setMeetingAudioPath(audio.toString());

        Path video = tempDir.resolve("meeting.mp4");
        Files.write(video, "test".getBytes());
        meeting.setMeetingVideoPath(video.toString());

        file = new MockMultipartFile("recording", "test.mp4", "video/mp4", "data".getBytes());
    }

    @Test
    void startMeeting_ok() throws Exception {
        meeting.setStatus(Meeting.MeetingStatus.IN_PROGRESS);
        when(meetingService.startMeeting(1L)).thenReturn(meeting);

        mockMvc.perform(put("/meetings/1/start"))
                .andExpect(status().isOk());
    }

 @Test
void stopMeeting_ok() throws Exception {

    meeting.setStatus(Meeting.MeetingStatus.COMPLETED);

    when(meetingService.stopMeeting(eq(1L), any()))
            .thenReturn(meeting);

    MockMultipartFile file =
            new MockMultipartFile(
                    "recording",              // MUST match controller param name
                    "test.mp4",
                    "video/mp4",
                    "dummy content".getBytes()
            );

    mockMvc.perform(
            multipart("/meetings/{id}/stop", 1L)
                    .file(file)
                    .contentType(MediaType.MULTIPART_FORM_DATA)
    )
    .andExpect(status().isOk())
    .andExpect(jsonPath("$.status").value("COMPLETED"));

    verify(meetingService).stopMeeting(eq(1L), any());
}

    @Test
    void getMeetingVideo_ok() throws Exception {
        when(meetingService.getMeetingById(1L)).thenReturn(Optional.of(meeting));

        mockMvc.perform(get("/meetings/1/video"))
                .andExpect(status().isOk());
    }

    @Test
    void getMeeting_notFound() throws Exception {
        when(meetingService.getMeetingById(1L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/meetings/1"))
                .andExpect(status().isNotFound());
    }

    @Test
void scheduleMeeting_invalidDate_returns400() throws Exception {

    mockMvc.perform(post("/meetings/schedule")
                    .param("title", "Test")
                    .param("date", "invalid-date")
                    .param("startTime", "10:00")
                    .param("endTime", "11:00")
                    .param("organizerId", "1")
                    .param("participantIds", "2", "3"))
            .andExpect(status().isBadRequest());
}
@Test
void scheduleMeeting_invalidTime_returns400() throws Exception {

    mockMvc.perform(post("/meetings/schedule")
                    .param("title", "Test")
                    .param("date", LocalDate.now().toString())
                    .param("startTime", "25:00")
                    .param("endTime", "26:00")
                    .param("organizerId", "1")
                    .param("participantIds", "2", "3"))
            .andExpect(status().isBadRequest());
}
@Test
void startMeeting_serviceThrows_returns500() throws Exception {

    when(meetingService.startMeeting(1L))
            .thenThrow(new RuntimeException("Start failed"));

    mockMvc.perform(put("/meetings/1/start"))
            .andExpect(status().isInternalServerError());
}
@Test
void startMeeting_notFound_returns404() throws Exception {

    when(meetingService.startMeeting(1L))
            .thenThrow(new ResourceNotFoundException("Meeting not found"));

    mockMvc.perform(put("/meetings/1/start"))
            .andExpect(status().isNotFound());
}
@Test
void startMeeting_invalidState_returns409() throws Exception {

    when(meetingService.startMeeting(1L))
            .thenThrow(new ConflictException("Meeting cannot be started"));

    mockMvc.perform(put("/meetings/1/start"))
            .andExpect(status().isConflict());
}
@Test
void stopMeeting_missingFile_returns400() throws Exception {

    mockMvc.perform(
            multipart("/meetings/{id}/stop", 1L)
                    .contentType(MediaType.MULTIPART_FORM_DATA)
    ).andExpect(status().isBadRequest());
}
@Test
void stopMeeting_serviceThrows_returns500() throws Exception {

    when(meetingService.stopMeeting(eq(1L), any()))
            .thenThrow(new RuntimeException("Stop failed"));

    mockMvc.perform(
            multipart("/meetings/{id}/stop", 1L)
                    .file(file)
    ).andExpect(status().isInternalServerError());
}
@Test
void stopMeeting_notFound_returns404() throws Exception {

    when(meetingService.stopMeeting(eq(1L), any()))
            .thenThrow(new ResourceNotFoundException("Meeting not found"));

    mockMvc.perform(
            multipart("/meetings/{id}/stop", 1L)
                    .file(file)
    ).andExpect(status().isNotFound());
}
@Test
void stopMeeting_invalidState_returns409() throws Exception {

    when(meetingService.stopMeeting(eq(1L), any()))
            .thenThrow(new ConflictException("Meeting is not in progress"));

    mockMvc.perform(
            multipart("/meetings/{id}/stop", 1L)
                    .file(file)
    ).andExpect(status().isConflict());
}
@Test
void getMeetingAudio_ok() throws Exception {

    when(meetingService.getMeetingById(1L))
            .thenReturn(Optional.of(meeting));

    mockMvc.perform(get("/meetings/1/audio"))
            .andExpect(status().isOk());
}
@Test
void getMeetingAudio_fileMissing_returns404() throws Exception {

    Path missing = tempDir.resolve("missing.mp3");
    meeting.setMeetingAudioPath(missing.toString());

    when(meetingService.getMeetingById(1L))
            .thenReturn(Optional.of(meeting));

    mockMvc.perform(get("/meetings/1/audio"))
            .andExpect(status().isNotFound());
}
@Test
void getMeetingAudio_pathNull_returns404() throws Exception {

    meeting.setMeetingAudioPath(null);

    when(meetingService.getMeetingById(1L))
            .thenReturn(Optional.of(meeting));

    mockMvc.perform(get("/meetings/1/audio"))
            .andExpect(status().isNotFound());
}
@Test
void getMeetingAudio_meetingNotFound_returns404() throws Exception {

    when(meetingService.getMeetingById(1L))
            .thenReturn(Optional.empty());

    mockMvc.perform(get("/meetings/1/audio"))
            .andExpect(status().isNotFound());
}
@Test
void getMeetingVideo_fileMissing_returns404() throws Exception {

    Path missing = tempDir.resolve("missing.mp4");
    meeting.setMeetingVideoPath(missing.toString());

    when(meetingService.getMeetingById(1L))
            .thenReturn(Optional.of(meeting));

    mockMvc.perform(get("/meetings/1/video"))
            .andExpect(status().isNotFound());
}
@Test
void getMeetingVideo_pathNull_returns404() throws Exception {

    meeting.setMeetingVideoPath(null);

    when(meetingService.getMeetingById(1L))
            .thenReturn(Optional.of(meeting));

    mockMvc.perform(get("/meetings/1/video"))
            .andExpect(status().isNotFound());
}
@Test
void getMeetingVideo_meetingNotFound_returns404() throws Exception {

    when(meetingService.getMeetingById(1L))
            .thenReturn(Optional.empty());

    mockMvc.perform(get("/meetings/1/video"))
            .andExpect(status().isNotFound());
}
@Test
void scheduleMeeting_ok() throws Exception {

    when(meetingService.scheduleMeeting(
            any(), any(), any(), any(), any(), any()))
            .thenReturn(meeting);

    mockMvc.perform(post("/meetings/schedule")
                    .param("title", "Test")
                    .param("date", LocalDate.now().toString())
                    .param("startTime", "10:00")
                    .param("endTime", "11:00")
                    .param("organizerId", "1")
                    .param("participantIds", "2", "3"))
            .andExpect(status().isOk());
}
@Test
void scheduleMeeting_organizerMissing_returns404() throws Exception {

    when(meetingService.scheduleMeeting(
            any(), any(), any(), any(), any(), any()))
            .thenThrow(new ResourceNotFoundException("Organizer not found"));

    mockMvc.perform(post("/meetings/schedule")
                    .param("title", "Test")
                    .param("date", LocalDate.now().toString())
                    .param("startTime", "10:00")
                    .param("endTime", "11:00")
                    .param("organizerId", "1")
                    .param("participantIds", "2", "3"))
            .andExpect(status().isNotFound());
}
@Test
void scheduleMeeting_endBeforeStart_returns400() throws Exception {

    when(meetingService.scheduleMeeting(
            any(), any(), any(), any(), any(), any()))
            .thenThrow(new IllegalArgumentException("End time must be after start time"));

    mockMvc.perform(post("/meetings/schedule")
                    .param("title", "Test")
                    .param("date", LocalDate.now().toString())
                    .param("startTime", "11:00")
                    .param("endTime", "10:00")
                    .param("organizerId", "1")
                    .param("participantIds", "2", "3"))
            .andExpect(status().isBadRequest());
}
@Test
void scheduleMeeting_emptyParticipantsFromService_returns400() throws Exception {

    when(meetingService.scheduleMeeting(
            any(), any(), any(), any(), any(), any()))
            .thenThrow(new IllegalArgumentException("At least one participant is required"));

    mockMvc.perform(post("/meetings/schedule")
                    .param("title", "Test")
                    .param("date", LocalDate.now().toString())
                    .param("startTime", "10:00")
                    .param("endTime", "11:00")
                    .param("organizerId", "1")
                    .param("participantIds", "2"))
            .andExpect(status().isBadRequest());
}
@Test
void scheduleMeeting_pastDateFromService_returns400() throws Exception {

    when(meetingService.scheduleMeeting(
            any(), any(), any(), any(), any(), any()))
            .thenThrow(new IllegalArgumentException("Meeting date cannot be in the past"));

    mockMvc.perform(post("/meetings/schedule")
                    .param("title", "Test")
                    .param("date", LocalDate.now().minusDays(1).toString())
                    .param("startTime", "10:00")
                    .param("endTime", "11:00")
                    .param("organizerId", "1")
                    .param("participantIds", "2"))
            .andExpect(status().isBadRequest());
}

}
