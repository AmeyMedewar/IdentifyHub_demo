# TODO: Fix Meeting Test Failures

## MeetingControllerTest Fixes
- [ ] Fix startMeeting_validMeetingId_returns200: Ensure meeting status updates to IN_PROGRESS in JSON response
- [ ] Fix stopMeeting_missingFile_returnsError: Adjust test to expect correct status for missing multipart file
- [ ] Fix stopMeeting_validMultipartFile_returns200: Ensure multipart request is handled correctly
- [ ] Fix getMeetingAudio_audioExistsAndReadable_returns200: Properly mock Resource for file existence checks
- [ ] Fix getMeetingAudio_fileNotReadable_returns404: Same as above
- [ ] Fix getMeetingVideo_videoExistsAndReadable_returns200: Same as above
- [ ] Fix getMeetingVideo_fileNotReadable_returns404: Same as above
- [ ] Fix scheduleMeeting_invalidDateFormat_returnsException: Handle date parsing exception properly
- [ ] Fix startMeeting_meetingNotFound_returnsException: Ensure correct exception handling

## MeetingServiceTest Fixes
- [ ] Remove unnecessary stubbings in setUp method to avoid UnnecessaryStubbingException

## Followup Steps
- [ ] Run Maven tests to verify fixes
- [ ] Check for any remaining issues
