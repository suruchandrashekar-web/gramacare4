package com.gramacare.backend.supportmessage;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class SupportMessageServices {

    private final SupportMessageRepository repository;

    public SupportMessageServices(
            SupportMessageRepository repository) {

        this.repository = repository;
    }

    // ==========================================
    // USER MESSAGE
    // ==========================================

    public Supportmessage saveUserMessage(
            String message,
            String userName,
            String userEmail) {

        Supportmessage supportMessage =
                new Supportmessage(
                        message,
                        userName,
                        userEmail,
                        "USER"
                );

        return repository.save(supportMessage);
    }

    // ==========================================
    // ADMIN REPLY
    // ==========================================

    public Supportmessage saveAdminMessage(
            String message,
            String userName,
            String userEmail) {

        Supportmessage supportMessage =
                new Supportmessage(
                        message,
                        userName,
                        userEmail,
                        "ADMIN"
                );

        return repository.save(supportMessage);
    }

    // ==========================================
    // ALL MESSAGES FOR ADMIN
    // ==========================================

    public List<Supportmessage> getAllMessages() {

        return repository.findAll(
                Sort.by(
                        Sort.Direction.ASC,
                        "createdAt"
                )
        );
    }

    // ==========================================
    // USER CONVERSATION
    // ==========================================

    public List<Supportmessage> getUserMessages(
            String userEmail) {

        return repository
                .findByUserEmailOrderByCreatedAtAsc(
                        userEmail
                );
    }

    // ==========================================
    // DELETE
    // ==========================================

    public boolean existsById(Long id) {

        return repository.existsById(id);
    }

    public void deleteMessage(Long id) {

        repository.deleteById(id);
    }
}