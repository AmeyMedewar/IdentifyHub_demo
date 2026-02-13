package com.example.faceattendance.controller;

import com.example.faceattendance.entity.Meeting;
import com.example.faceattendance.service.MeetingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/meetings")
public class MeetingController {

    @Autowired
    private MeetingService meetingService;

    @PostMapping("/schedule")
    public ResponseEntity<Meeting> scheduleMeeting(
            @RequestParam String title,
            @RequestParam String date,
            @RequestParam String startTime,
            @RequestParam String endTime,
            @RequestParam Long organizerId,
            @RequestParam List<Long> participantIds) {
        LocalDate meetingDate = LocalDate.parse(date);
        LocalTime start = LocalTime.parse(startTime);
        LocalTime end = LocalTime.parse(endTime);
        Meeting meeting = meetingService.scheduleMeeting(title, meetingDate, start, end, organizerId, participantIds);
        return ResponseEntity.ok(meeting);
    }

    @PutMapping("/{id}/start")
    public ResponseEntity<Meeting> startMeeting(@PathVariable Long id) {
        Meeting meeting = meetingService.startMeeting(id);
        return ResponseEntity.ok(meeting);
    }

   @PostMapping("/{id}/stop")
public ResponseEntity<Meeting> stopMeeting(
        @PathVariable Long id,
        @RequestParam("recording") MultipartFile recording)throws IOException {
    Meeting meeting = meetingService.stopMeeting(id, recording);
    return ResponseEntity.ok(meeting);
}


    @GetMapping("/{id}")
    public ResponseEntity<Meeting> getMeetingById(@PathVariable Long id) {
        Optional<Meeting> meeting = meetingService.getMeetingById(id);
        return meeting.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/audio")
    public ResponseEntity<Resource> getMeetingAudio(@PathVariable Long id) throws MalformedURLException {
        Optional<Meeting> meetingOpt = meetingService.getMeetingById(id);
        if (meetingOpt.isPresent() && meetingOpt.get().getMeetingAudioPath() != null) {
            Path filePath = Paths.get(meetingOpt.get().getMeetingAudioPath());
            if (Files.exists(filePath) && Files.isReadable(filePath)) {
                Resource resource = new UrlResource(filePath.toUri());
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION,
                                "attachment; filename=\"" + resource.getFilename() + "\"")
                        .contentType(MediaType.APPLICATION_OCTET_STREAM)
                        .body(resource);
            }
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}/video")
    public ResponseEntity<Resource> getMeetingVideo(@PathVariable Long id) throws MalformedURLException {
        Optional<Meeting> meetingOpt = meetingService.getMeetingById(id);
        if (meetingOpt.isPresent() && meetingOpt.get().getMeetingVideoPath() != null) {
            Path filePath = Paths.get(meetingOpt.get().getMeetingVideoPath());
            if (Files.exists(filePath) && Files.isReadable(filePath)) {
                Resource resource = new UrlResource(filePath.toUri());
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION,
                                "attachment; filename=\"" + resource.getFilename() + "\"")
                        .contentType(MediaType.APPLICATION_OCTET_STREAM)
                        .body(resource);
            }
        }
        return ResponseEntity.notFound().build();
    }

}
