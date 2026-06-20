// src/api/auditLog.ts
// ═══════════════════════════════════════════════════════════════════
// Ce fichier contient toutes les fonctions pour communiquer avec
// le backend Spring Boot pour le module Audit Log.
//
// Chaque fonction :
//   1. Appelle un endpoint du backend via axios
//   2. Retourne les données typées
//
// On utilise `api` (notre instance axios) qui ajoute automatiquement
// le token JWT dans le header Authorization.
// ═══════════════════════════════════════════════════════════════════

import api from "./api.ts";
// ↑ Notre instance axios configurée avec baseURL http://localhost:8086/api
//   et l'intercepteur qui ajoute le token JWT

// ── Types ─────────────────────────────────────────────────────────
// Ces types correspondent exactement au AuditLogDTO du backend Java

export interface AuditLogEntry {
    id:         number;       // L'ID généré par PostgreSQL (1, 2, 3...)
    adminId:    number;       // L'ID de l'admin qui a fait l'action
    adminName:  string;       // "Super Admin", "Karim Moderateur", etc.
    adminEmail: string;       // "admin@rilybricoule.com"
    action:     string;       // "Admin créé", "Prestataire suspendu", etc.
    module:     string;       // "Sécurité", "Clients", "Prestataires", etc.
    details:    string;       // Description détaillée de l'action
    createdAt:  string;       // "2026-03-20T14:30:00" (format ISO du backend)
    ipAddress:  string | null; // L'adresse IP (peut être null)
}

// Le backend retourne une Page (objet de pagination Spring Boot)
// Ce type décrit la structure de cet objet
export interface PageResponse<T> {
    content:          T[];     // Les éléments de CETTE page
    totalElements:    number;  // Nombre TOTAL d'éléments (ex: 150)
    totalPages:       number;  // Nombre total de pages (ex: 8 si 20 par page)
    number:           number;  // Numéro de la page actuelle (commence à 0)
    size:             number;  // Nombre d'éléments par page (ex: 20)
    first:            boolean; // true si c'est la première page
    last:             boolean; // true si c'est la dernière page
    numberOfElements: number;  // Nombre d'éléments sur CETTE page
}
// ↑ Pourquoi tout ça ? Parce que Spring Boot envoie automatiquement
//   toutes ces informations quand on utilise Page<> dans le controller.
//   Le frontend peut afficher "Page 1 sur 8 — 150 résultats"

// ── Fonctions API ─────────────────────────────────────────────────

/**
 * Récupère tous les logs d'audit, paginés.
 *
 * @param page - Numéro de page (commence à 0)
 * @param size - Nombre d'éléments par page
 * @returns Une Page contenant les AuditLogEntry
 *
 * Endpoint backend : GET /api/admin/audit?page=0&size=20
 */
export async function fetchAuditLogs(
    page: number = 0,
    size: number = 50
): Promise<PageResponse<AuditLogEntry>> {
    const { data } = await api.get("/admin/audit", {
        params: { page, size },
        // ↑ params transforme ça en URL : /admin/audit?page=0&size=50
        //   Axios s'occupe de construire les query parameters
    });
    return data;
    // ↑ data est directement l'objet Page<AuditLogDTO> envoyé par Spring Boot
}

/**
 * Récupère les logs filtrés par module.
 *
 * Endpoint backend : GET /api/admin/audit/module/ADMINS?page=0&size=20
 */
export async function fetchAuditLogsByModule(
    module: string,
    page: number = 0,
    size: number = 50
): Promise<PageResponse<AuditLogEntry>> {
    const { data } = await api.get(`/admin/audit/module/${module}`, {
        params: { page, size },
    });
    return data;
}

/**
 * Récupère les logs filtrés par admin.
 *
 * Endpoint backend : GET /api/admin/audit/admin/5?page=0&size=20
 */
export async function fetchAuditLogsByAdmin(
    adminId: number,
    page: number = 0,
    size: number = 50
): Promise<PageResponse<AuditLogEntry>> {
    const { data } = await api.get(`/admin/audit/admin/${adminId}`, {
        params: { page, size },
    });
    return data;
}
