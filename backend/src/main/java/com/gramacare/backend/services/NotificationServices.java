package com.gramacare.backend.services;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gramacare.backend.entity.Notification;
import com.gramacare.backend.entity.NotificationType;
import com.gramacare.backend.entity.ServiceRequest;
import com.gramacare.backend.entity.User;
import com.gramacare.backend.repository.Notificationrepository;

@Service
public class NotificationServices {

    private final Notificationrepository notificationRepository;

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public NotificationServices(
            Notificationrepository notificationRepository) {

        this.notificationRepository = notificationRepository;
    }

    // =====================================================
    // CREATE NOTIFICATION
    // =====================================================

    public Notification createNotification(
            User receiver,
            User sender,
            ServiceRequest request,
            NotificationType type,
            String title,
            String message) {

        if (receiver == null) {
            throw new IllegalArgumentException(
                    "Notification receiver is required");
        }

        if (type == null) {
            throw new IllegalArgumentException(
                    "Notification type is required");
        }

        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Notification title is required");
        }

        if (message == null || message.trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Notification message is required");
        }

        Notification notification = new Notification();

        notification.setReceiver(receiver);
        notification.setSender(sender);
        notification.setRequest(request);
        notification.setType(type);
        notification.setTitle(title.trim());
        notification.setMessage(message.trim());
        notification.setRead(false);

        return notificationRepository.save(notification);
    }

    // =====================================================
    // GET ALL USER NOTIFICATIONS
    // =====================================================

    public List<Notification> getUserNotifications(
            Long userId) {

        if (userId == null) {
            throw new IllegalArgumentException(
                    "User ID is required");
        }

        return notificationRepository
                .findByReceiverIdOrderByCreatedAtDesc(userId);
    }

    // =====================================================
    // GET UNREAD NOTIFICATIONS
    // =====================================================

    public List<Notification> getUnreadNotifications(
            Long userId) {

        if (userId == null) {
            throw new IllegalArgumentException(
                    "User ID is required");
        }

        return notificationRepository
                .findByReceiverIdAndIsReadFalseOrderByCreatedAtDesc(
                        userId);
    }

    // =====================================================
    // GET UNREAD COUNT
    // =====================================================

    public long getUnreadCount(Long userId) {

        if (userId == null) {
            throw new IllegalArgumentException(
                    "User ID is required");
        }

        return notificationRepository
                .countByReceiverIdAndIsReadFalse(userId);
    }

    // =====================================================
    // MARK ONE NOTIFICATION AS READ
    // =====================================================

    public Notification markAsRead(
            Long notificationId) {

        if (notificationId == null) {
            throw new IllegalArgumentException(
                    "Notification ID is required");
        }

        Notification notification =
                notificationRepository.findById(notificationId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Notification not found: "
                                                + notificationId));

        notification.setRead(true);

        return notificationRepository.save(notification);
    }

    // =====================================================
    // MARK ALL NOTIFICATIONS AS READ
    // =====================================================

    @Transactional
    public void markAllAsRead(Long userId) {

        if (userId == null) {
            throw new IllegalArgumentException(
                    "User ID is required");
        }

        List<Notification> notifications =
                notificationRepository
                        .findByReceiverIdAndIsReadFalseOrderByCreatedAtDesc(
                                userId);

        for (Notification notification : notifications) {
            notification.setRead(true);
        }

        notificationRepository.saveAll(notifications);
    }
}