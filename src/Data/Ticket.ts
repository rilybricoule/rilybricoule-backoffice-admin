export type TicketStatus   = "ouvert" | "en_cours" | "resolu" | "ferme";
export type TicketCategory = "incident" | "question_generale" | "demande_remboursement" | "litige";
export type TicketFrom     = "client" | "prestataire" | "admin";

export interface TicketMessage {
    from: TicketFrom;
    name: string;
    message: string;
    date: string;
}

export interface Ticket {
    id: string;
    subject: string;
    fromName: string;
    fromType: TicketFrom;
    fromId: string;
    category: TicketCategory;
    status: TicketStatus;
    isLitige: boolean;
    reservationId?: string;
    reservationTitle?: string;
    adminNote?: string;
    resolutionNote?: string;
    resolutionAction?: string;
    createdAt: string;
    updatedAt: string;
    messages: TicketMessage[];
}
