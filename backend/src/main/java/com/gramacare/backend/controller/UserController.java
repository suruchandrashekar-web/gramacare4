
package com.gramacare.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gramacare.backend.dto.LoginRequest;
import com.gramacare.backend.dto.RegisterRequest;
import com.gramacare.backend.entity.User;
import com.gramacare.backend.services.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5182",
        "http://localhost:8091"
})
public class UserController {

    private final UserService userService;

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // =====================================================
    // REGISTER USER
    // POST /api/users/register
    // =====================================================

    @PostMapping("/register")
    public ResponseEntity<User> register(
            @Valid @RequestBody RegisterRequest request) {

        User user = userService.register(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(user);
    }

    // =====================================================
    // LOGIN USER
    // POST /api/users/login
    // =====================================================

    @PostMapping("/login")
    public ResponseEntity<User> login(
            @Valid @RequestBody LoginRequest request) {

        User user = userService.login(request);

        return ResponseEntity.ok(user);
    }

    // =====================================================
    // GET ALL USERS
    // GET /api/users
    // =====================================================

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {

        List<User> users = userService.getAllUsers();

        return ResponseEntity.ok(users);
    }

    // =====================================================
    // GET USER BY EMAIL
    // GET /api/users/by-email?email=example@gmail.com
    // =====================================================

    @GetMapping("/by-email")
    public ResponseEntity<User> getUserByEmail(
            @RequestParam String email) {

        User user = userService.getByEmail(email);

        return ResponseEntity.ok(user);
    }

    // =====================================================
    // GET ALL PROVIDERS
    // GET /api/users/providers
    // =====================================================

    @GetMapping("/providers")
    public ResponseEntity<List<User>> getProviders() {

        List<User> providers = userService.getProviders();

        return ResponseEntity.ok(providers);
    }

    // =====================================================
    // GET USER BY ID
    // GET /api/users/{id}
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(
            @PathVariable Long id) {

        User user = userService.getById(id);

        return ResponseEntity.ok(user);
    }

    // =====================================================
    // UPDATE USER
    // PUT /api/users/{id}
    // =====================================================

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(
            @PathVariable Long id,
            @RequestBody User user) {

        User updatedUser =
                userService.update(id, user);

        return ResponseEntity.ok(updatedUser);
    }

    // =====================================================
    // BLOCK USER
    // PUT /api/users/block/{id}
    // =====================================================

    @PutMapping("/block/{id}")
    public ResponseEntity<User> blockUser(
            @PathVariable Long id) {

        User blockedUser =
                userService.blockUser(id);

        return ResponseEntity.ok(blockedUser);
    }

    // =====================================================
    // UNBLOCK USER
    // PUT /api/users/unblock/{id}
    // =====================================================

    @PutMapping("/unblock/{id}")
    public ResponseEntity<User> unblockUser(
            @PathVariable Long id) {

        User unblockedUser =
                userService.unblockUser(id);

        return ResponseEntity.ok(unblockedUser);
    }

    // =====================================================
    // DELETE USER
    // DELETE /api/users/{id}
    // =====================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable Long id) {

        userService.delete(id);

        return ResponseEntity.noContent().build();
    }
}

