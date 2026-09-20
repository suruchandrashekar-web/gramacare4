package com.gramacare.backend.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.gramacare.backend.dto.LoginRequest;
import com.gramacare.backend.dto.RegisterRequest;
import com.gramacare.backend.entity.Role;
import com.gramacare.backend.entity.User;
import com.gramacare.backend.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final Emailservices emailService;

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public UserService(
            UserRepository userRepository,
            Emailservices emailService) {

        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    // =====================================================
    // REGISTER USER
    // =====================================================

    public User register(RegisterRequest request) {

        String email = request.getEmail() == null
                ? ""
                : request.getEmail().trim();

        // Check duplicate email
        if (userRepository.findByEmailIgnoreCase(email).isPresent()) {

            throw new IllegalArgumentException(
                    "Email already registered"
            );
        }

        // Create new user
        User user = new User();

        user.setFullName(request.getFullName());
        user.setEmail(email);
        user.setPassword(request.getPassword());
        user.setRole(request.getRole());
        user.setPhone(request.getPhone());

        // New account is active
        user.setBlocked(false);

        // Save user
        User savedUser = userRepository.save(user);

        // Send admin email notification
        emailService.sendRegistrationNotification(
                savedUser.getFullName(),
                savedUser.getEmail(),
                savedUser.getPhone(),
                savedUser.getRole() != null
                        ? savedUser.getRole().name()
                        : "-"
        );

        return savedUser;
    }

    // =====================================================
    // LOGIN USER
    // =====================================================

    public User login(LoginRequest request) {

        String email = request.getEmail() == null
                ? ""
                : request.getEmail().trim();

        // Find user
        User user = userRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Invalid email or password"
                        )
                );

        // =================================================
        // BLOCKED ACCOUNT CHECK
        // =================================================
        //
        // blocked = true
        // COMPLETE ACCOUNT IS BLOCKED
        //
        // User cannot login.
        // =================================================

        if (user.isBlocked()) {

            throw new IllegalArgumentException(
                    "Your account has been blocked by the administrator."
            );
        }

        // Password check
        if (user.getPassword() == null
                || request.getPassword() == null
                || !user.getPassword().equals(
                        request.getPassword()
                )) {

            throw new IllegalArgumentException(
                    "Invalid email or password"
            );
        }

        return user;
    }

    // =====================================================
    // GET ALL USERS
    // =====================================================

    public List<User> getAllUsers() {

        return userRepository.findAll();
    }

    // =====================================================
    // GET USER BY EMAIL
    // =====================================================

    public User getByEmail(String email) {

        String normalizedEmail = email == null
                ? ""
                : email.trim();

        return userRepository
                .findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found with email: "
                                        + normalizedEmail
                        )
                );
    }

    // =====================================================
    // GET USER BY ID
    // =====================================================

    public User getById(Long id) {

        return userRepository
                .findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found with id: "
                                        + id
                        )
                );
    }

    // =====================================================
    // GET ALL PROVIDERS
    // =====================================================

    public List<User> getProviders() {

        return userRepository.findByRole(Role.PROVIDER);
    }

    // =====================================================
    // BLOCK USER
    // =====================================================

    public User blockUser(Long id) {

        User user = getById(id);

        // Admin account cannot be blocked
        if (user.getRole() == Role.ADMIN) {

            throw new IllegalArgumentException(
                    "Admin account cannot be blocked."
            );
        }

        // Complete account block
        user.setBlocked(true);

        return userRepository.save(user);
    }

    // =====================================================
    // UNBLOCK USER
    // =====================================================

    public User unblockUser(Long id) {

        User user = getById(id);

        // Activate complete account
        user.setBlocked(false);

        return userRepository.save(user);
    }

    // =====================================================
    // UPDATE USER
    // =====================================================

    public User update(
            Long id,
            User updatedUser) {

        User existingUser = getById(id);

        existingUser.setFullName(
                updatedUser.getFullName()
        );

        existingUser.setPhone(
                updatedUser.getPhone()
        );

        existingUser.setAddress(
                updatedUser.getAddress()
        );

        existingUser.setVillage(
                updatedUser.getVillage()
        );

        existingUser.setDistrict(
                updatedUser.getDistrict()
        );

        existingUser.setState(
                updatedUser.getState()
        );

        existingUser.setProfileImage(
                updatedUser.getProfileImage()
        );

        return userRepository.save(existingUser);
    }

    // =====================================================
    // DELETE USER
    // =====================================================

    public void delete(Long id) {

        User existingUser = getById(id);

        userRepository.delete(existingUser);
    }
}