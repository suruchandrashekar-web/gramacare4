package com.gramacare.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.gramacare.backend.entity.Notification;
import com.gramacare.backend.services.NotificationServices;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(
    origins = "http://localhost:5174",
    allowedHeaders = "*",
    methods = {
        RequestMethod.GET,
        RequestMethod.PATCH,
        RequestMethod.OPTIONS
    }
)
public class Notificationcontroller {

    private final NotificationServices notificationService;

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public Notificationcontroller(
            NotificationServices notificationService) {

        this.notificationService = notificationService;
    }

    // =====================================================
    // GET ALL NOTIFICATIONS
    // =====================================================

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> getNotifications(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                notificationService.getUserNotifications(userId)
        );
    }

    // =====================================================
    // GET UNREAD NOTIFICATIONS
    // =====================================================

    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                notificationService.getUnreadNotifications(userId)
        );
    }

    // =====================================================
    // GET UNREAD COUNT
    // =====================================================

    @GetMapping("/user/{userId}/count")
    public ResponseEntity<Long> getUnreadCount(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                notificationService.getUnreadCount(userId)
        );
    }

    // =====================================================
    // MARK ONE NOTIFICATION AS READ
    // =====================================================

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<Notification> markAsRead(
            @PathVariable Long notificationId) {

        return ResponseEntity.ok(
                notificationService.markAsRead(notificationId)
        );
    }

    // =====================================================
    // MARK ALL NOTIFICATIONS AS READ
    // =====================================================

    @PatchMapping("/user/{userId}/read-all")
    public ResponseEntity<Void> markAllAsRead(
            @PathVariable Long userId) {

        notificationService.markAllAsRead(userId);

        return ResponseEntity.noContent().build();
    }
}