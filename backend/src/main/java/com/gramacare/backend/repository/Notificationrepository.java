package com.gramacare.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gramacare.backend.entity.Notification;

@Repository
public interface Notificationrepository
        extends JpaRepository<Notification, Long> {

    // =====================================================
    // GET ALL NOTIFICATIONS OF A USER
    // =====================================================

    List<Notification> findByReceiverIdOrderByCreatedAtDesc(
            Long receiverId
    );

    // =====================================================
    // GET UNREAD NOTIFICATIONS
    // =====================================================

    List<Notification> findByReceiverIdAndIsReadFalseOrderByCreatedAtDesc(
            Long receiverId
    );

    // =====================================================
    // COUNT UNREAD NOTIFICATIONS
    // =====================================================

    long countByReceiverIdAndIsReadFalse(
            Long receiverId
    );
}