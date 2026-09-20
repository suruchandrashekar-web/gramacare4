package com.gramacare.backend.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class Emailservices {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${gramacare.admin.email}")
    private String adminEmail;

    public Emailservices(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // =====================================================
    // SEND REGISTRATION NOTIFICATION TO ADMIN
    // =====================================================

    public void sendRegistrationNotification(
            String fullName,
            String email,
            String phone,
            String role
    ) {

        try {
            SimpleMailMessage message =
                    new SimpleMailMessage();

            message.setFrom(fromEmail);

            message.setTo(adminEmail);

            message.setSubject(
                    "New GramaCare Registration"
            );

            String text =
                    "A new user has registered in GramaCare.\n\n"
                    + "Name: " + safe(fullName) + "\n"
                    + "Email: " + safe(email) + "\n"
                    + "Phone: " + safe(phone) + "\n"
                    + "Role: " + safe(role) + "\n\n"
                    + "This is an automatic notification from GramaCare.";

            message.setText(text);

            mailSender.send(message);

        } catch (Exception e) {

            // Do not stop user registration
            // if email sending fails.
            System.err.println(
                    "Registration email notification failed: "
                            + e.getMessage()
            );
        }
    }

    // =====================================================
    // SAFE TEXT
    // =====================================================

    private String safe(String value) {

        if (value == null || value.trim().isEmpty()) {
            return "-";
        }

        return value.trim();
    }
}