import type { ContentPage } from "./ContentData";

export const contentMock: ContentPage[] = [
    {
        key:     "about",
        title:   "À propos",
        content: `<h2>À propos de RiLyBricoule</h2><p>RiLyBricoule est une plateforme de mise en relation entre clients et prestataires de services à domicile au Maroc.</p><p>Notre mission est de simplifier la réservation de services à domicile : bricolage, plomberie, électricité, jardinage et bien plus encore.</p>`,
        updatedAt: "2025-03-01",
    },
    {
        key:     "faq",
        title:   "FAQ",
        content: `<h2>Questions fréquentes</h2><h3>Comment réserver un service ?</h3><p>Recherchez un prestataire, consultez son profil et cliquez sur "Réserver".</p><h3>Comment devenir prestataire ?</h3><p>Inscrivez-vous et soumettez vos documents pour validation par notre équipe.</p>`,
        updatedAt: "2025-03-05",
    },
    {
        key:     "cgu",
        title:   "CGU / CGV",
        content: `<h2>Conditions Générales d'Utilisation</h2><p>En utilisant RiLyBricoule, vous acceptez les présentes conditions générales d'utilisation.</p><h3>1. Objet</h3><p>La plateforme RiLyBricoule est un service de mise en relation entre particuliers et professionnels.</p><h3>2. Responsabilité</h3><p>RiLyBricoule agit en tant qu'intermédiaire et ne peut être tenu responsable des prestations effectuées.</p>`,
        updatedAt: "2025-03-10",
    },
];