export const resStatusConfig: Record<
    string,
    { label: string; color: "default" | "warning" | "info" | "primary" | "success" | "error" }
> = {
    en_attente: { label: "En attente", color: "warning" },
    confirmee:  { label: "Confirmée",  color: "info"    },
    en_cours:   { label: "En cours",   color: "primary" },
    realisee:   { label: "Réalisée",   color: "success" },
    annulee:    { label: "Annulée",    color: "error"   },
};

export const payStatusConfig: Record<
    string,
    { label: string; color: "default" | "warning" | "success" | "error" }
> = {
    en_attente: { label: "En attente", color: "warning" },
    paye:       { label: "Payé",       color: "success" },
    rembourse:  { label: "Remboursé",  color: "error"   },
};

export const msgColor: Record<string, string> = {
    client:      "#2F7CC9",
    prestataire: "#F08A2F",
    admin:       "#9c27b0",
};