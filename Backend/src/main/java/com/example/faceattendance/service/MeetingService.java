package com.example.faceattendance.service;

import com.example.faceattendance.entity.Meeting;
import com.example.faceattendance.entity.MeetingParticipant;
import com.example.faceattendance.entity.User;
import com.example.faceattendance.exception.ConflictException;
import com.example.faceattendance.exception.ResourceNotFoundException;
import com.example.faceattendance.repository.MeetingRepository;
import com.example.faceattendance.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MeetingService {

    @Autowired
    private MeetingRepository meetingRepository;

    @Autowired
    private UserRepository userRepository;

    private static final String AUDIO_DIR = "recordings/audio/";
    private static final String VIDEO_DIR = "recordings/video/";

    public Meeting scheduleMeeting(String title, LocalDate date, LocalTime startTime, LocalTime endTime,
            Long organizerId, List<Long> participantIds) {
        validateScheduleInput(date, startTime, endTime, participantIds);

        User organizer = userRepository.findById(organizerId)
                .orElseThrow(() -> new ResourceNotFoundException("Organizer not found"));
        Meeting meeting = new Meeting();
        meeting.setMeetingTitle(title);
        meeting.setMeetingDate(date);
        meeting.setStartTime(startTime);
        meeting.setEndTime(endTime);
        meeting.setOrganizer(organizer);
        meeting.setStatus(Meeting.MeetingStatus.SCHEDULED);

        List<MeetingParticipant> participants = participantIds.stream().map(id -> {
            User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Participant not found"));
            MeetingParticipant mp = new MeetingParticipant();
            mp.setMeeting(meeting);
            mp.setUser(user);
            return mp;
        }).collect(Collectors.toList());

        meeting.setParticipants(participants);
        return meetingRepository.save(meeting);
    }

    public Meeting startMeeting(Long meetingId) {
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new ResourceNotFoundException("Meeting not found"));
        if (meeting.getStatus() != Meeting.MeetingStatus.SCHEDULED) {
            throw new ConflictException("Meeting cannot be started");
        }
        meeting.setStatus(Meeting.MeetingStatus.IN_PROGRESS);
        return meetingRepository.save(meeting);
    }

    public Meeting stopMeeting(Long meetingId, MultipartFile recording) throws IOException {
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new ResourceNotFoundException("Meeting not found"));
        if (meeting.getStatus() != Meeting.MeetingStatus.IN_PROGRESS) {
            throw new ConflictException("Meeting is not in progress");
        }
        meeting.setStatus(Meeting.MeetingStatus.COMPLETED);

        String contentType = recording.getContentType();
        String dir = contentType != null && contentType.startsWith("video/") ? VIDEO_DIR : AUDIO_DIR;
        String fileName = "meeting_" + meetingId + "_" + System.currentTimeMillis()
                + getFileExtension(recording.getOriginalFilename());
        Path filePath = Paths.get(dir, fileName);

        Files.createDirectories(filePath.getParent());
        Files.write(filePath, recording.getBytes());

        if (contentType != null && contentType.startsWith("video/")) {
            meeting.setMeetingVideoPath(filePath.toString());
        } else {
            meeting.setMeetingAudioPath(filePath.toString());
        }

        return meetingRepository.save(meeting);
    }

    public Optional<Meeting> getMeetingById(Long meetingId) {
        return meetingRepository.findById(meetingId);
    }

    private String getFileExtension(String filename) {
        return filename != null && filename.contains(".") ? filename.substring(filename.lastIndexOf(".")) : "";
    }

    private void validateScheduleInput(LocalDate date, LocalTime startTime, LocalTime endTime, List<Long> participantIds) {
        if (date == null || startTime == null || endTime == null) {
            throw new IllegalArgumentException("Date and time are required");
        }
        if (date.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Meeting date cannot be in the past");
        }
        if (!endTime.isAfter(startTime)) {
            throw new IllegalArgumentException("End time must be after start time");
        }
        if (participantIds == null || participantIds.isEmpty()) {
            throw new IllegalArgumentException("At least one participant is required");
        }
    }
}
