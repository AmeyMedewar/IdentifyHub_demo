# TODO: Fix Hibernate + MySQL User Entity Mapping

## Tasks
- [x] Update User.java: Change @Column(name = "user_id") to @Column(name = "id") for the id field
- [x] Verify other field mappings: phoneNumber -> phone_number, dateOfBirth -> date_of_birth, currentStatus -> current_status (no changes needed)
- [x] Update Attendance.java: Change referencedColumnName from "user_id" to "id" in @JoinColumn
- [x] Update MeetingParticipant.java: Change referencedColumnName from "user_id" to "id" in @JoinColumn
- [x] Update Meeting.java: Change referencedColumnName from "user_id" to "id" in @JoinColumn
- [x] Suggest MySQL table schema update: ALTER TABLE users CHANGE user_id id BIGINT PRIMARY KEY AUTO_INCREMENT; (Not needed - DB already has 'id' column)
- [x] Test the application to verify the fix (Application now starts successfully on port 8081)
