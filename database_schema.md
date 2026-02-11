IdentifyHub Database Schema

Overview
This document contains the complete database schema for the IdentifyHub face attendance and meeting management system. The schema includes three main entities: Users, Attendance, and Meetings with proper relationships and indexing for optimal performance.

Entity Relationship Diagram (ERD)

Original Diagram (Simplified)

┌─────────────────┐       ┌─────────────────┐
│     Users       │       │   Attendance    │
├─────────────────┤       ├─────────────────┤
│ userId (PK)     │◄────┐ │ id (PK)         │
│ name            │     │ │ user_id (FK)    │
│ email           │     │ │ date            │
│ phone_number    │     │ │ check_in_time   │
│ date_of_birth   │     │ │ check_out_time  │
│ gender          │     │ │ attendance_status│
│ current_status  │     │ │ working_hours   │
└─────────────────┘     └─────────────────┘
         │
         │
         ▼
┌─────────────────┐       ┌─────────────────┐
│   Meetings      │       │Meeting_Participants│
├─────────────────┤       ├─────────────────┤
│ meeting_id (PK) │◄────┐ │ id (PK)         │
│ meeting_title   │     │ │ meeting_id (FK) │
│ meeting_date    │     │ │ user_id (FK)    │
│ start_time      │     │ │ joined_at       │
│ end_time        │     └─│                 │
│ status          │       └─────────────────┘
│ organizer_id(FK)│
│ meeting_audio_path│
│ meeting_video_path│
└─────────────────┘


Clean ER Diagram (Standard Notation)

┌─────────────────────────────────────┐
│             USERS                   │
├─────────────────────────────────────┤
│ ◇ userId (PK)                       │
│ ○ name                              │
│ ◆ email (UQ)                        │
│ ○ phone_number                      │
│ ○ date_of_birth                     │
│ ○ gender                            │
│ ○ current_status                    │
└─────────────────┬───────────────────┘
                  │
                  │ organizes (1:N)
                  │
                  ▼
┌─────────────────────────────────────┐
│           MEETINGS                  │
├─────────────────────────────────────┤
│ ◇ meeting_id (PK)                   │
│ ○ meeting_title                     │
│ ○ meeting_date                      │
│ ○ start_time                        │
│ ○ end_time                          │
│ ○ status                            │
│ ◆ organizer_id (FK→Users.userId)    │
│ ○ meeting_audio_path                │
│ ○ meeting_video_path                │
│ ○ createdAt                         │
│ ○ updatedAt                         │
└─────────────┬───────────────────────┘
              │
              │ has_participants (1:N)
              │
              ▼
┌─────────────────────────────────────┐       ┌─────────────────────────────────────┐
│    MEETING_PARTICIPANTS             │       │           ATTENDANCE               │
├─────────────────────────────────────┤       ├─────────────────────────────────────┤
│ ◇ id (PK)                           │       │ ◇ id (PK)                          │
│ ◆ meeting_id (FK→Meetings.meeting_id)│       │ ◆ user_id (FK→Users.userId)       │
│ ◆ user_id (FK→Users.userId)         │       │ ○ date                             │
│ ○ joined_at                         │       │ ○ check_in_time                    │
└─────────────────┬───────────────────┘       │ ○ check_out_time                   │
                  │                           │ ○ attendance_status                │
                  │ participates (N:1)        │ ○ working_hours                    │
                  ▼                           └─────────────────────────────────────┘
┌─────────────────────────────────────┐
│             USERS                   │
├─────────────────────────────────────┤
│ ◇ userId (PK)                       │
│ ○ name                              │
│ ◆ email (UQ)                        │
│ ○ phone_number                      │
│ ○ date_of_birth                     │
│ ○ gender                            │
│ ○ current_status                    │
└─────────────────────────────────────┘


ER Diagram Legend
- Rectangles: Entity types
- ◇: Primary Key attributes
- ◆: Foreign Key / Unique attributes
- ○: Regular attributes
- Lines with arrows: Relationships with cardinality
- Relationship Labels: Type of relationship (organizes, has_participants, participates, has_attendance)
- Numbers: Cardinality notation (1:N = One-to-Many, N:1 = Many-to-One)

Relationships

 1. Users ↔ Attendance (One-to-Many)
- One User can have Many Attendance records (one per day)
- Foreign Key: `Attendance.user_id → Users.id`

 2. Users ↔ Meetings (as Organizer) (One-to-Many)
- One User can organize Many Meetings
- Foreign Key: `Meetings.organizer_id → Users.userId`

 3. Users ↔ Meetings (as Participants) (Many-to-Many)
- Many Users can participate in Many Meetings
- Junction Table: `meeting_participants`
- Foreign Keys: `meeting_participants.meeting_id → meetings.meeting_id`
- Foreign Keys: `meeting_participants.user_id → users.id`

 4. Meetings ↔ Meeting Participants (One-to-Many)
- One Meeting can have Many Participants
- Foreign Key: `meeting_participants.meeting_id → meetings.meeting_id`

 Complete Database Schema (MySQL)

```sql
-- Users table
CREATE TABLE users (
    userId BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(20) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10) NOT NULL,
    current_status ENUM('PRESENT', 'ABSENT') DEFAULT 'ABSENT',

    INDEX idx_email (email),
    INDEX idx_current_status (current_status)
);

-- Attendance table
CREATE TABLE attendance (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    date DATE NOT NULL,
    check_in_time DATETIME,
    check_out_time DATETIME,
    attendance_status ENUM('PRESENT', 'ABSENT') NOT NULL,
    working_hours DECIMAL(5,2), -- Hours worked (calculated field)

    FOREIGN KEY (user_id) REFERENCES users(userId) ON DELETE CASCADE,
    UNIQUE KEY unique_user_date (user_id, date),
    INDEX idx_user_id (user_id),
    INDEX idx_date (date),
    INDEX idx_attendance_status (attendance_status)
);

-- Meetings table (MOM feature)
CREATE TABLE meetings (
    meeting_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    meeting_title VARCHAR(255) NOT NULL,
    meeting_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME,
    status ENUM('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') DEFAULT 'SCHEDULED',
    organizer_id BIGINT NOT NULL,
    meeting_audio_path VARCHAR(500),
    meeting_video_path VARCHAR(500),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (organizer_id) REFERENCES users(userId) ON DELETE CASCADE,
    INDEX idx_meeting_date (meeting_date),
    INDEX idx_status (status),
    INDEX idx_organizer_id (organizer_id),
    INDEX idx_meeting_title (meeting_title)
);

-- Meeting participants junction table (many-to-many relationship)
CREATE TABLE meeting_participants (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    meeting_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (meeting_id) REFERENCES meetings(meeting_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(userId) ON DELETE CASCADE,
    UNIQUE KEY unique_meeting_user (meeting_id, user_id),
    INDEX idx_meeting_id (meeting_id),
    INDEX idx_user_id (user_id)
);
```

 Key Design Decisions

 1. Data Types
- `BIGINT` for primary keys (handles large datasets)
- `VARCHAR(255)` for names/titles (standard length)
- `DECIMAL(5,2)` for working hours (precision for hours/minutes)
- `TIME` for scheduled meeting times (HH:MM:SS format)
- `DATE` for attendance and meeting dates

 2. Constraints
- `UNIQUE` on user email (prevents duplicate accounts)
- `UNIQUE` on user+date in attendance (one attendance record per user per day)
- `UNIQUE` on meeting+user in participants (user can't join same meeting twice)
- `NOT NULL` on essential fields
- `DEFAULT` values for status fields

 3. Indexing Strategy
- Primary Keys: Automatically indexed
- Foreign Keys: Automatically indexed for referential integrity
- Additional Indexes: On frequently queried fields
  - `users.email` - for authentication
  - `users.current_status` - for filtering active users
  - `attendance.date` - for date-based queries
  - `meetings.meeting_date` - for calendar views
  - `meetings.status` - for filtering by status

 4. Cascade Deletes
- `ON DELETE CASCADE` ensures data integrity
- Deleting a user removes their attendance records and meetings
- Deleting a meeting removes participant associations

 5. Storage Strategy for Recordings
- Audio/Video files stored locally in `recordings/audio/` and `recordings/video/` directories
- Only file paths stored in database (hybrid approach)
- File naming: `meeting_{meeting_id}_{timestamp}.{extension}`
- Keeps database lightweight and improves performance

Business Logic

Attendance System
- Users check in/out through face recognition
- `current_status` updated to PRESENT on check-in
- Working hours calculated: `TIMESTAMPDIFF(SECOND, check_in_time, check_out_time) / 3600.0`
- One attendance record per user per day

 Meeting Management (MOM)
- Meetings can be scheduled with participants
- Status transitions: SCHEDULED → IN_PROGRESS → COMPLETED/CANCELLED
- Recordings stored locally with metadata in database
- Many-to-many participant relationships

 Performance Considerations
- Indexes on all foreign keys and commonly filtered fields
- Unique constraints prevent data duplication
- Timestamps for audit trails
- Efficient queries for dashboard statistics and reporting

This schema provides a solid foundation for the complete IdentifyHub system with face attendance tracking and meeting management capabilities.
