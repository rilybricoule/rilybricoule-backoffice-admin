package com.example.rilybricoule1.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "avis")
public class Avis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int note;

    private String commentaire;

    private LocalDateTime date;



    @ManyToOne
    @JoinColumn(name = "client_id")
    private Client client;


    @ManyToOne
    @JoinColumn(name = "prestataire_id")
    private Prestataire prestataire;


    @OneToOne
    @JoinColumn(name = "reservation_id")
    private Reservation reservation;


    public Avis() {}

    public Avis(int note, String commentaire, LocalDateTime date, Client client, Prestataire prestataire, Reservation reservation) {
        this.note = note;
        this.commentaire = commentaire;
        this.date = date;
        this.client = client;
        this.prestataire = prestataire;
        this.reservation = reservation;
    }


    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public int getNote() { return note; }
    public void setNote(int note) { this.note = note; }

    public String getCommentaire() { return commentaire; }
    public void setCommentaire(String commentaire) { this.commentaire = commentaire; }

    public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }

    public Client getClient() { return client; }
    public void setClient(Client client) { this.client = client; }

    public Prestataire getPrestataire() { return prestataire; }
    public void setPrestataire(Prestataire prestataire) { this.prestataire = prestataire; }

    public Reservation getReservation() { return reservation; }
    public void setReservation(Reservation reservation) { this.reservation = reservation; }
}
