package com.example.faceattendance.controller;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.example.faceattendance.dto.UserRequestDTO;
import com.example.faceattendance.dto.UserResponseDTO;
import com.example.faceattendance.exception.ConflictException;
import com.example.faceattendance.exception.GlobalExceptionHandler;
import com.example.faceattendance.exception.ResourceNotFoundException;
import com.example.faceattendance.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;

class UserControllerTest {

    private MockMvc mockMvc;

    @Mock
    private UserService userService;

    @InjectMocks
    private UserController userController;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(userController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
        objectMapper = new ObjectMapper();
        objectMapper.findAndRegisterModules();
    }

    @Test
    void testRegisterUser_Success() throws Exception {
        UserRequestDTO requestDTO = new UserRequestDTO();
        requestDTO.setName("John Doe");
        requestDTO.setEmail("john.doe@example.com");
        requestDTO.setPhoneNumber("1234567890");
        requestDTO.setDateOfBirth(LocalDate.of(1990, 1, 1));
        requestDTO.setGender("Male");

        UserResponseDTO responseDTO = new UserResponseDTO();
        responseDTO.setId(1L);
        responseDTO.setName("John Doe");
        responseDTO.setEmail("john.doe@example.com");

        when(userService.registerUser(any(UserRequestDTO.class))).thenReturn(responseDTO);

        mockMvc.perform(post("/users/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.name").value("John Doe"))
                .andExpect(jsonPath("$.email").value("john.doe@example.com"));
    }

    @Test
    void testRegisterUser_DuplicateEmail() throws Exception {
        UserRequestDTO requestDTO = new UserRequestDTO();
        requestDTO.setName("John Doe");
        requestDTO.setEmail("john.doe@example.com");
        requestDTO.setPhoneNumber("1234567890");
        requestDTO.setDateOfBirth(LocalDate.of(1990, 1, 1));
        requestDTO.setGender("Male");

        when(userService.registerUser(any(UserRequestDTO.class)))
                .thenThrow(new ConflictException("User with this email already exists"));

        mockMvc.perform(post("/users/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("User with this email already exists"));
    }

    @Test
    void testGetAllUsers() throws Exception {
        UserResponseDTO user1 = new UserResponseDTO();
        user1.setId(1L);
        user1.setName("John Doe");

        UserResponseDTO user2 = new UserResponseDTO();
        user2.setId(2L);
        user2.setName("Jane Doe");

        List<UserResponseDTO> users = Arrays.asList(user1, user2);

        when(userService.getAllUsers()).thenReturn(users);

        mockMvc.perform(get("/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value("John Doe"))
                .andExpect(jsonPath("$[1].name").value("Jane Doe"));
    }

    @Test
    void testGetUserById_Found() throws Exception {
        UserResponseDTO user = new UserResponseDTO();
        user.setId(1L);
        user.setName("John Doe");

        when(userService.getUserById(1L)).thenReturn(Optional.of(user));

        mockMvc.perform(get("/users/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.name").value("John Doe"));
    }

    @Test
    void testGetUserById_NotFound() throws Exception {
        when(userService.getUserById(1L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/users/1"))
                .andExpect(status().isNotFound());
    }

    @Test
    void testUpdateUser_Success() throws Exception {
        UserRequestDTO requestDTO = new UserRequestDTO();
        requestDTO.setName("John Updated");
        requestDTO.setEmail("john.updated@example.com");
        requestDTO.setPhoneNumber("1234567890");
        requestDTO.setDateOfBirth(LocalDate.of(1990, 1, 1));
        requestDTO.setGender("Male");

        UserResponseDTO responseDTO = new UserResponseDTO();
        responseDTO.setId(1L);
        responseDTO.setName("John Updated");
        responseDTO.setEmail("john.updated@example.com");

        when(userService.updateUser(eq(1L), any(UserRequestDTO.class))).thenReturn(responseDTO);

        mockMvc.perform(put("/users/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.name").value("John Updated"));
    }

    @Test
    void testUpdateUser_NotFound() throws Exception {
        UserRequestDTO requestDTO = new UserRequestDTO();
        requestDTO.setName("John Updated");
        requestDTO.setEmail("john.updated@example.com");
        requestDTO.setPhoneNumber("1234567890");
        requestDTO.setDateOfBirth(LocalDate.of(1990, 1, 1));
        requestDTO.setGender("Male");

        when(userService.updateUser(eq(1L), any(UserRequestDTO.class)))
                .thenThrow(new ResourceNotFoundException("User not found"));

        mockMvc.perform(put("/users/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("User not found"));
    }
}
