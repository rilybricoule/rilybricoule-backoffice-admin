package com.example.rilybricoule1.entity;


import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notification")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String contenu;

    private LocalDateTime date;

    private boolean vu;

    // Many notifications belong to one Prestataire
    @ManyToOne
    @JoinColumn(name = "prestataire_id")
    private Prestataire prestataire;


    protected Notification() {} // required by JPA

    public Notification(String contenu, LocalDateTime date, boolean vu, Prestataire prestataire) {
        this.contenu = contenu;
        this.date = date;
        this.vu = vu;
        this.prestataire = prestataire;
    }

    // Getters & Setters
    public Long getId() { return id; }
    public String getContenu() { return contenu; }
    public void setContenu(String contenu) { this.contenu = contenu; }
    public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }
    public boolean isVu() { return vu; }
    public void setVu(boolean vu) { this.vu = vu; }
    public Prestataire getPrestataire() { return prestataire; }
    public void setPrestataire(Prestataire prestataire) { this.prestataire = prestataire; }
}

