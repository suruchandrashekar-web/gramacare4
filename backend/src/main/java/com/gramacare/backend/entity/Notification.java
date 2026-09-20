package com.gramacare.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "notifications")
public class Notification {

    // =====================================================
    // ID
    // =====================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =====================================================
    // RECEIVER
    // =====================================================

    @ManyToOne
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;

    // =====================================================
    // SENDER
    // =====================================================

    @ManyToOne
    @JoinColumn(name = "sender_id")
    private User sender;

    // =====================================================
    // SERVICE REQUEST
    // =====================================================

    @ManyToOne
    @JoinColumn(name = "request_id")
    private ServiceRequest request;

    // =====================================================
    // NOTIFICATION TYPE
    // =====================================================

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    // =====================================================
    // TITLE
    // =====================================================

    @Column(nullable = false, length = 255)
    private String title;

    // =====================================================
    // MESSAGE
    // =====================================================

    @Column(nullable = false, length = 1000)
    private String message;

    // =====================================================
    // READ STATUS
    // =====================================================

    @Column(nullable = false)
    private boolean isRead = false;

    // =====================================================
    // CREATED TIME
    // =====================================================

    @Column(nullable = false)
    private LocalDateTime createdAt;

    // =====================================================
    // DEFAULT CONSTRUCTOR
    // =====================================================

    public Notification() {
    }

    // =====================================================
    // PRE PERSIST
    // =====================================================

    @PrePersist
    protected void onCreate() {

        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }

        if (type == null) {
            throw new IllegalStateException(
                "Notification type is required"
            );
        }
    }

    // =====================================================
    // GET ID
    // =====================================================

    public Long getId() {
        return id;
    }

    // =====================================================
    // SET ID
    // =====================================================

    public void setId(Long id) {
        this.id = id;
    }

    // =====================================================
    // GET RECEIVER
    // =====================================================

    public User getReceiver() {
        return receiver;
    }

    // =====================================================
    // SET RECEIVER
    // =====================================================

    public void setReceiver(User receiver) {
        this.receiver = receiver;
    }

    // =====================================================
    // GET SENDER
    // =====================================================

    public User getSender() {
        return sender;
    }

    // =====================================================
    // SET SENDER
    // =====================================================

    public void setSender(User sender) {
        this.sender = sender;
    }

    // =====================================================
    // GET REQUEST
    // =====================================================

    public ServiceRequest getRequest() {
        return request;
    }

    // =====================================================
    // SET REQUEST
    // =====================================================

    public void setRequest(ServiceRequest request) {
        this.request = request;
    }

    // =====================================================
    // GET TYPE
    // =====================================================

    public NotificationType getType() {
        return type;
    }

    // =====================================================
    // SET TYPE
    // =====================================================

    public void setType(NotificationType type) {
        this.type = type;
    }

    // =====================================================
    // GET TITLE
    // =====================================================

    public String getTitle() {
        return title;
    }

    // =====================================================
    // SET TITLE
    // =====================================================

    public void setTitle(String title) {
        this.title = title;
    }

    // =====================================================
    // GET MESSAGE
    // =====================================================

    public String getMessage() {
        return message;
    }

    // =====================================================
    // SET MESSAGE
    // =====================================================

    public void setMessage(String message) {
        this.message = message;
    }

    // =====================================================
    // GET READ STATUS
    // =====================================================

    public boolean isRead() {
        return isRead;
    }

    // =====================================================
    // SET READ STATUS
    // =====================================================

    public void setRead(boolean read) {
        isRead = read;
    }

    // =====================================================
    // GET CREATED TIME
    // =====================================================

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    // =====================================================
    // SET CREATED TIME
    // =====================================================

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}