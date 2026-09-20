package com.gramacare.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gramacare.backend.entity.User;
import com.gramacare.backend.repository.UserRepository;
import com.gramacare.backend.services.UserService;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5182",
        "http://localhost:8091"
})
public class AdminController {

    private final UserRepository userRepository;
    private final UserService userService;

    public AdminController(
            UserRepository userRepository,
            UserService userService) {

        this.userRepository = userRepository;
        this.userService = userService;
    }

    // =====================================================
    // GET ALL USERS
    // =====================================================

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {

        try {

            List<User> users = userRepository.findAll();

            return ResponseEntity.ok(users);

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "Failed to fetch users"
                    ));
        }
    }

    // =====================================================
    // GET USER BY ID
    // =====================================================

    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUserById(
            @PathVariable Long id) {

        try {

            User user = userRepository
                    .findById(id)
                    .orElse(null);

            if (user == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(Map.of(
                                "success", false,
                                "message", "User not found"
                        ));
            }

            return ResponseEntity.ok(user);

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "Failed to fetch user"
                    ));
        }
    }

    // =====================================================
    // BLOCK USER ACCOUNT
    // =====================================================

    @PutMapping("/users/{id}/block")
    public ResponseEntity<?> blockUser(
            @PathVariable Long id) {

        try {

            User blockedUser =
                    userService.blockUser(id);

            return ResponseEntity.ok(
                    Map.of(
                            "success", true,
                            "blocked", true,
                            "userId", blockedUser.getId(),
                            "message",
                            "Account blocked successfully"
                    )
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "success", false,
                            "blocked", false,
                            "message", e.getMessage()
                    ));

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "blocked", false,
                            "message",
                            "Failed to block account"
                    ));
        }
    }

    // =====================================================
    // UNBLOCK USER ACCOUNT
    // =====================================================

    @PutMapping("/users/{id}/unblock")
    public ResponseEntity<?> unblockUser(
            @PathVariable Long id) {

        try {

            User unblockedUser =
                    userService.unblockUser(id);

            return ResponseEntity.ok(
                    Map.of(
                            "success", true,
                            "blocked", false,
                            "userId", unblockedUser.getId(),
                            "message",
                            "Account unblocked successfully"
                    )
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "success", false,
                            "blocked", true,
                            "message", e.getMessage()
                    ));

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "blocked", true,
                            "message",
                            "Failed to unblock account"
                    ));
        }
    }

    // =====================================================
    // GET BLOCKED USERS
    // =====================================================

    @GetMapping("/users/blocked")
    public ResponseEntity<?> getBlockedUsers() {

        try {

            List<User> blockedUsers =
                    userRepository.findByBlocked(true);

            return ResponseEntity.ok(blockedUsers);

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message",
                            "Failed to fetch blocked users"
                    ));
        }
    }

    // =====================================================
    // GET ACTIVE USERS
    // =====================================================

    @GetMapping("/users/active")
    public ResponseEntity<?> getActiveUsers() {

        try {

            List<User> activeUsers =
                    userRepository.findByBlocked(false);

            return ResponseEntity.ok(activeUsers);

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message",
                            "Failed to fetch active users"
                    ));
        }
    }
}