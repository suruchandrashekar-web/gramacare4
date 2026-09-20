package com.gramacare.backend.supportmessage;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/support/messages")
@CrossOrigin(
    origins = {
        "http://localhost:5174",
        "http://localhost:3000"
    }
)
public class SupportMessageController {

    private final SupportMessageServices service;

    public SupportMessageController(
            SupportMessageServices service) {

        this.service = service;
    }

    // ==========================================
    // USER SEND MESSAGE
    // ==========================================

    @PostMapping
    public ResponseEntity<Supportmessage> sendUserMessage(
            @RequestBody SupportMessageRequest request) {

        if (request == null ||
            request.getMessage() == null ||
            request.getMessage().trim().isEmpty()) {

            return ResponseEntity.badRequest().build();
        }

        String userName = request.getUserName();

        String userEmail = request.getUserEmail();

        if (userName == null ||
            userName.trim().isEmpty()) {

            userName = "Unknown User";
        }

        if (userEmail == null ||
            userEmail.trim().isEmpty()) {

            userEmail = "Unknown Email";
        }

        Supportmessage savedMessage =
                service.saveUserMessage(
                        request.getMessage().trim(),
                        userName.trim(),
                        userEmail.trim()
                );

        return ResponseEntity.ok(savedMessage);
    }

    // ==========================================
    // ADMIN REPLY
    // ==========================================

    @PostMapping("/admin-reply")
    public ResponseEntity<Supportmessage> adminReply(
            @RequestBody SupportMessageRequest request) {

        if (request == null ||
            request.getMessage() == null ||
            request.getMessage().trim().isEmpty()) {

            return ResponseEntity.badRequest().build();
        }

        String userName = request.getUserName();

        String userEmail = request.getUserEmail();

        if (userName == null ||
            userName.trim().isEmpty()) {

            userName = "Unknown User";
        }

        if (userEmail == null ||
            userEmail.trim().isEmpty()) {

            userEmail = "Unknown Email";
        }

        Supportmessage savedMessage =
                service.saveAdminMessage(
                        request.getMessage().trim(),
                        userName.trim(),
                        userEmail.trim()
                );

        return ResponseEntity.ok(savedMessage);
    }

    // ==========================================
    // ADMIN - ALL MESSAGES
    // ==========================================

    @GetMapping
    public ResponseEntity<List<Supportmessage>>
            getAllMessages() {

        return ResponseEntity.ok(
                service.getAllMessages()
        );
    }

    // ==========================================
    // USER - OWN CHAT
    // ==========================================

    @GetMapping("/user/{email}")
    public ResponseEntity<List<Supportmessage>>
            getUserMessages(
                    @PathVariable String email) {

        return ResponseEntity.ok(
                service.getUserMessages(email)
        );
    }

    // ==========================================
    // DELETE MESSAGE
    // ==========================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMessage(
            @PathVariable Long id) {

        if (!service.existsById(id)) {

            return ResponseEntity.notFound().build();
        }

        service.deleteMessage(id);

        return ResponseEntity.noContent().build();
    }

    // ==========================================
    // REQUEST DTO
    // ==========================================

    public static class SupportMessageRequest {

        private String message;

        private String userName;

        private String userEmail;

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public String getUserName() {
            return userName;
        }

        public void setUserName(String userName) {
            this.userName = userName;
        }

        public String getUserEmail() {
            return userEmail;
        }

        public void setUserEmail(String userEmail) {
            this.userEmail = userEmail;
        }
    }
}