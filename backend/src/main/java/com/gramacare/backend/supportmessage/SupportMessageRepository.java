package com.gramacare.backend.supportmessage;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SupportMessageRepository
        extends JpaRepository<Supportmessage, Long> {

    List<Supportmessage> findByUserEmailOrderByCreatedAtAsc(
            String userEmail
    );
}