package com.gramacare.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "services")
public class ServiceEntity {

    // =========================================================
    // ID
    // =========================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =========================================================
    // SERVICE NAME
    // =========================================================

    @Column(nullable = false)
    private String name;

    // =========================================================
    // DESCRIPTION
    // =========================================================

    @Column(length = 1000)
    private String description;

    // =========================================================
    // PRICE
    // =========================================================

    private Double price;

    // =========================================================
    // CATEGORY
    // =========================================================

    private String category;

    // =========================================================
    // LOCATION
    // =========================================================

    private String location;

    // =========================================================
    // AVAILABILITY
    // =========================================================

    @Column(nullable = false)
    private boolean available = true;

    // =========================================================
    // LATITUDE
    // =========================================================

    @Column
    private Double latitude;

    // =========================================================
    // LONGITUDE
    // =========================================================

    @Column
    private Double longitude;

    // =========================================================
    // PROVIDER
    // =========================================================

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "provider_id", nullable = false)
    private User provider;

    // =========================================================
    // DEFAULT CONSTRUCTOR
    // =========================================================

    public ServiceEntity() {
    }

    // =========================================================
    // GET ID
    // =========================================================

    public Long getId() {
        return id;
    }

    // =========================================================
    // SET ID
    // =========================================================

    public void setId(Long id) {
        this.id = id;
    }

    // =========================================================
    // GET NAME
    // =========================================================

    public String getName() {
        return name;
    }

    // =========================================================
    // SET NAME
    // =========================================================

    public void setName(String name) {
        this.name = name;
    }

    // =========================================================
    // GET DESCRIPTION
    // =========================================================

    public String getDescription() {
        return description;
    }

    // =========================================================
    // SET DESCRIPTION
    // =========================================================

    public void setDescription(String description) {
        this.description = description;
    }

    // =========================================================
    // GET PRICE
    // =========================================================

    public Double getPrice() {
        return price;
    }

    // =========================================================
    // SET PRICE
    // =========================================================

    public void setPrice(Double price) {
        this.price = price;
    }

    // =========================================================
    // GET CATEGORY
    // =========================================================

    public String getCategory() {
        return category;
    }

    // =========================================================
    // SET CATEGORY
    // =========================================================

    public void setCategory(String category) {
        this.category = category;
    }

    // =========================================================
    // GET LOCATION
    // =========================================================

    public String getLocation() {
        return location;
    }

    // =========================================================
    // SET LOCATION
    // =========================================================

    public void setLocation(String location) {
        this.location = location;
    }

    // =========================================================
    // GET AVAILABLE
    // =========================================================

    public boolean isAvailable() {
        return available;
    }

    // =========================================================
    // SET AVAILABLE
    // =========================================================

    public void setAvailable(boolean available) {
        this.available = available;
    }

    // =========================================================
    // GET LATITUDE
    // =========================================================

    public Double getLatitude() {
        return latitude;
    }

    // =========================================================
    // SET LATITUDE
    // =========================================================

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    // =========================================================
    // GET LONGITUDE
    // =========================================================

    public Double getLongitude() {
        return longitude;
    }

    // =========================================================
    // SET LONGITUDE
    // =========================================================

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    // =========================================================
    // GET PROVIDER
    // =========================================================

    public User getProvider() {
        return provider;
    }

    // =========================================================
    // SET PROVIDER
    // =========================================================

    public void setProvider(User provider) {
        this.provider = provider;
    }
}