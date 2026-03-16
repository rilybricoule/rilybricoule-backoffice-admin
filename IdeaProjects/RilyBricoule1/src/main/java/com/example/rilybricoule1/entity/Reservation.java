package com.example.rilybricoule1.entity;
import com.example.rilybricoule1.eums.ReservationStatus;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate date;

    private LocalTime heure;

    @Enumerated(EnumType.STRING)
    private ReservationStatus statut;

    private Double prix;



    public Reservation() {
    }




    @ManyToOne
    @JoinColumn(name = "client_id")
    private Client client;


    @ManyToOne
    @JoinColumn(name = "prestataire_id")
    private Prestataire prestataire;


    @ManyToOne
    @JoinColumn(name = "service_id")
    private Services service;



    @OneToOne
    @JoinColumn(name = "paiement_id")
    private Paiment paiement;


    @ManyToOne
    @JoinColumn(name = "coupon_id")
    private Coupon coupon;


}
