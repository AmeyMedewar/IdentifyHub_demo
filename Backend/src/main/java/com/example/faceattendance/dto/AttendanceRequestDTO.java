package com.example.faceattendance.dto;

import jakarta.validation.constraints.NotNull;

public class AttendanceRequestDTO {

    @NotNull(message = "User ID is required")
    private Long userId;

    // Getters and Setters
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}
