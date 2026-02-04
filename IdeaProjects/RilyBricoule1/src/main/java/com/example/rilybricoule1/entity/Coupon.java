package com.example.rilybricoule1.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "coupons")
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String code;

    private double reduction; // en pourcentage ou valeur fixe

    private LocalDateTime dateExpiration;


    @OneToMany(mappedBy = "coupon", cascade = CascadeType.ALL)
    private List<Reservation> reservations;


    public Coupon() {}

    public Coupon(String code, double reduction, LocalDateTime dateExpiration) {
        this.code = code;
        this.reduction = reduction;
        this.dateExpiration = dateExpiration;
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public double getReduction() { return reduction; }
    public void setReduction(double reduction) { this.reduction = reduction; }

    public LocalDateTime getDateExpiration() { return dateExpiration; }
    public void setDateExpiration(LocalDateTime dateExpiration) { this.dateExpiration = dateExpiration; }

    public List<Reservation> getReservations() { return reservations; }
    public void setReservations(List<Reservation> reservations) { this.reservations = reservations; }
}

