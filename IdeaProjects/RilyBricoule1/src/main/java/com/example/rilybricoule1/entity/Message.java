package com.example.rilybricoule1.entity;



import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String contenu;

    private LocalDateTime date;


    @ManyToOne
    @JoinColumn(name = "user_id")
    private User auteur;


    @ManyToOne
    @JoinColumn(name = "chat_id")
    private Chat chat;

    // Constructeurs
    public Message() {}

    public Message(String contenu, LocalDateTime date, User auteur, Chat chat) {
        this.contenu = contenu;
        this.date = date;
        this.auteur = auteur;
        this.chat = chat;
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getContenu() { return contenu; }
    public void setContenu(String contenu) { this.contenu = contenu; }

    public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }

    public User getAuteur() { return auteur; }
    public void setAuteur(User auteur) { this.auteur = auteur; }

    public Chat getChat() { return chat; }
    public void setChat(Chat chat) { this.chat = chat; }
}

