package com.example.faceattendance.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.faceattendance.entity.Attendance;
import com.example.faceattendance.entity.User;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    Optional<Attendance> findByUserAndDate(User user, LocalDate date);

    // ✅ ADD THIS for auto checkout
    List<Attendance> findByCheckInTimeNotNullAndCheckOutTimeIsNullAndDateBefore(LocalDate date);
}
