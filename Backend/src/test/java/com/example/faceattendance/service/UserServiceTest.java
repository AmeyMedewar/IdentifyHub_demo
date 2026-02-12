package com.example.faceattendance.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.faceattendance.dto.UserRequestDTO;
import com.example.faceattendance.dto.UserResponseDTO;
import com.example.faceattendance.entity.User;
import com.example.faceattendance.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    // ================= REGISTER USER =================

    @Test
    void testRegisterUser_Success() {
        UserRequestDTO dto = new UserRequestDTO();
        dto.setName("John");
        dto.setEmail("john@example.com");
        dto.setPhoneNumber("1234567890");
        dto.setDateOfBirth(LocalDate.of(1990, 1, 1));
        dto.setGender("Male");

        User savedUser = new User();
        savedUser.setId(1L);
        savedUser.setName("John");
        savedUser.setEmail("john@example.com");
        savedUser.setPhoneNumber("1234567890");
        savedUser.setDateOfBirth(LocalDate.of(1990, 1, 1));
        savedUser.setGender("Male");
        savedUser.setCurrentStatus(User.AttendanceStatus.ABSENT);

        when(userRepository.existsByEmail("john@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        UserResponseDTO result = userService.registerUser(dto);

        assertNotNull(result);
        assertEquals("John", result.getName());
        assertEquals("ABSENT", result.getCurrentStatus());

        verify(userRepository).existsByEmail("john@example.com");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void testRegisterUser_DuplicateEmail() {
        UserRequestDTO dto = new UserRequestDTO();
        dto.setEmail("john@example.com");

        when(userRepository.existsByEmail("john@example.com")).thenReturn(true);

        RuntimeException ex =
                assertThrows(RuntimeException.class, () -> userService.registerUser(dto));

        assertEquals("User with this email already exists", ex.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    void testRegisterUser_SaveFails() {
        UserRequestDTO dto = new UserRequestDTO();
        dto.setEmail("john@example.com");

        when(userRepository.existsByEmail("john@example.com")).thenReturn(false);
        when(userRepository.save(any())).thenThrow(new RuntimeException("DB error"));

        assertThrows(RuntimeException.class, () -> userService.registerUser(dto));
    }

    // ================= UPDATE USER =================

    @Test
    void testUpdateUser_Success_EmailNotChanged() {
        UserRequestDTO dto = new UserRequestDTO();
        dto.setName("Updated");
        dto.setEmail("same@example.com");

        User existing = new User();
        existing.setId(1L);
        existing.setEmail("same@example.com");
        existing.setCurrentStatus(User.AttendanceStatus.ABSENT);

        when(userRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(userRepository.save(any())).thenReturn(existing);

        UserResponseDTO result = userService.updateUser(1L, dto);

        assertEquals(1L, result.getId());
        verify(userRepository, never()).existsByEmail(any());
    }

    @Test
    void testUpdateUser_EmailChanged_ButAvailable() {
        UserRequestDTO dto = new UserRequestDTO();
        dto.setEmail("new@example.com");

        User existing = new User();
        existing.setId(1L);
        existing.setEmail("old@example.com");
        existing.setCurrentStatus(User.AttendanceStatus.ABSENT);

        when(userRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(userRepository.save(any())).thenReturn(existing);

        userService.updateUser(1L, dto);

        verify(userRepository).existsByEmail("new@example.com");
        verify(userRepository).save(any());
    }

    @Test
    void testUpdateUser_EmailChanged_AndTaken() {
        UserRequestDTO dto = new UserRequestDTO();
        dto.setEmail("new@example.com");

        User existing = new User();
        existing.setId(1L);
        existing.setEmail("old@example.com");

        when(userRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(userRepository.existsByEmail("new@example.com")).thenReturn(true);

        RuntimeException ex =
                assertThrows(RuntimeException.class, () -> userService.updateUser(1L, dto));

        assertEquals("Email is already taken by another user", ex.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    void testUpdateUser_UserNotFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        RuntimeException ex =
                assertThrows(RuntimeException.class,
                        () -> userService.updateUser(1L, new UserRequestDTO()));

        assertEquals("User not found", ex.getMessage());
    }

    // ================= GET METHODS =================

    @Test
    void testGetAllUsers_NonEmpty() {
        User user = new User();
        user.setId(1L);
        user.setName("John");
        user.setEmail("john@example.com");
        user.setCurrentStatus(User.AttendanceStatus.ABSENT);

        when(userRepository.findAll()).thenReturn(List.of(user));

        List<UserResponseDTO> result = userService.getAllUsers();

        assertEquals(1, result.size());
        assertEquals("John", result.get(0).getName());
    }

    @Test
    void testGetAllUsers_Empty() {
        when(userRepository.findAll()).thenReturn(List.of());

        List<UserResponseDTO> result = userService.getAllUsers();

        assertTrue(result.isEmpty());
    }

    @Test
    void testGetUserById_Found() {
        User user = new User();
        user.setId(1L);
        user.setName("John");
        user.setEmail("john@example.com");
        user.setCurrentStatus(User.AttendanceStatus.ABSENT);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        Optional<UserResponseDTO> result = userService.getUserById(1L);

        assertTrue(result.isPresent());
        assertEquals("John", result.get().getName());
    }

    @Test
    void testGetUserById_NotFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        Optional<UserResponseDTO> result = userService.getUserById(1L);

        assertFalse(result.isPresent());
    }

    @Test
    void testGetUserEntityById() {
        User user = new User();
        user.setId(1L);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        Optional<User> result = userService.getUserEntityById(1L);

        assertTrue(result.isPresent());
    }

    @Test
    void testSaveUser() {
        User user = new User();
        user.setId(1L);

        when(userRepository.save(user)).thenReturn(user);

        User result = userService.saveUser(user);

        assertEquals(user, result);
    }
}
