package com.example.rilybricoule1.entity;

import com.example.rilybricoule1.entity.Reservation;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "paiements")
public class Paiment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private double montant;

    private String mode; // ex: "Carte", "Paypal", "Cash"

    private LocalDateTime date;

    private String statut; // ex: "PENDING", "SUCCESS", "FAILED"

    // Relation avec Reservation (One-to-One)
    @OneToOne
    @JoinColumn(name = "reservation_id", referencedColumnName = "id")
    private Reservation reservation;

    // Constructeurs
    public  Paiment() {}

    public Paiment(double montant, String mode, LocalDateTime date, String statut, Reservation reservation) {
        this.montant = montant;
        this.mode = mode;
        this.date = date;
        this.statut = statut;
        this.reservation = reservation;
    }

    // Getters & Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public double getMontant() {
        return montant;
    }

    public void setMontant(double montant) {
        this.montant = montant;
    }

    public String getMode() {
        return mode;
    }

    public void setMode(String mode) {
        this.mode = mode;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }

    public String getStatut() {
        return statut;
    }

    public void setStatut(String statut) {
        this.statut = statut;
    }

    public Reservation getReservation() {
        return reservation;
    }

    public void setReservation(Reservation reservation) {
        this.reservation = reservation;
    }
}
