package com.gramacare.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.gramacare.backend.entity.Message;
import com.gramacare.backend.entity.Role;
import com.gramacare.backend.services.MessageServices;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(
    origins = {
        "http://localhost:5173",
        "http://localhost:5175"
    },
    allowedHeaders = "*",
    methods = {
        RequestMethod.GET,
        RequestMethod.POST,
        RequestMethod.PATCH,
        RequestMethod.DELETE,
        RequestMethod.OPTIONS
    }
)
public class MessageController {

    private final MessageServices messageService;

    public MessageController(MessageServices messageService) {
        this.messageService = messageService;
    }

    // =====================================================
    // SEND MESSAGE
    // =====================================================

    @PostMapping
    public ResponseEntity<Message> sendMessage(
            @RequestBody SendMessageRequest request) {

        Message message = messageService.sendMessage(
                request.getSenderId(),
                request.getReceiverId(),
                request.getRequestId(),
                request.getMessage(),
                request.getSenderRole(),
                request.getReceiverRole()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(message);
    }

    // =====================================================
    // GET RECEIVED MESSAGES
    // =====================================================

    @GetMapping("/received/{userId}")
    public ResponseEntity<List<Message>> getReceivedMessages(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                messageService.getReceivedMessages(userId)
        );
    }

    // =====================================================
    // GET SENT MESSAGES
    // =====================================================

    @GetMapping("/sent/{userId}")
    public ResponseEntity<List<Message>> getSentMessages(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                messageService.getSentMessages(userId)
        );
    }

    // =====================================================
    // GET CONVERSATION
    // =====================================================

    @GetMapping("/conversation/{senderId}/{receiverId}")
    public ResponseEntity<List<Message>> getConversation(
            @PathVariable Long senderId,
            @PathVariable Long receiverId) {

        return ResponseEntity.ok(
                messageService.getConversation(
                        senderId,
                        receiverId
                )
        );
    }

    // =====================================================
    // GET REQUEST MESSAGES
    // =====================================================

    @GetMapping("/request/{requestId}")
    public ResponseEntity<List<Message>> getRequestMessages(
            @PathVariable Long requestId) {

        return ResponseEntity.ok(
                messageService.getRequestMessages(requestId)
        );
    }

    // =====================================================
    // MARK MESSAGE AS READ
    // =====================================================

    @PatchMapping("/{messageId}/read")
    public ResponseEntity<Message> markAsRead(
            @PathVariable Long messageId) {

        return ResponseEntity.ok(
                messageService.markAsRead(messageId)
        );
    }

    // =====================================================
    // DELETE MESSAGE
    // =====================================================

    @DeleteMapping("/{messageId}")
    public ResponseEntity<Void> deleteMessage(
            @PathVariable Long messageId) {

        messageService.deleteMessage(messageId);

        return ResponseEntity.noContent().build();
    }

    // =====================================================
    // REQUEST BODY CLASS
    // =====================================================

    public static class SendMessageRequest {

        private Long senderId;
        private Long receiverId;
        private Long requestId;
        private String message;

        private Role senderRole;
        private Role receiverRole;

        public SendMessageRequest() {
        }

        public Long getSenderId() {
            return senderId;
        }

        public void setSenderId(Long senderId) {
            this.senderId = senderId;
        }

        public Long getReceiverId() {
            return receiverId;
        }

        public void setReceiverId(Long receiverId) {
            this.receiverId = receiverId;
        }

        public Long getRequestId() {
            return requestId;
        }

        public void setRequestId(Long requestId) {
            this.requestId = requestId;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public Role getSenderRole() {
            return senderRole;
        }

        public void setSenderRole(Role senderRole) {
            this.senderRole = senderRole;
        }

        public Role getReceiverRole() {
            return receiverRole;
        }

        public void setReceiverRole(Role receiverRole) {
            this.receiverRole = receiverRole;
        }
    }
}