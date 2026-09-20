package com.gramacare.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    // ==============================
    // TEST BACKEND API
    // ==============================

    @GetMapping("/hello")
    public String hello() {

        return "GRAMACARE Backend is Working!";
    }
}