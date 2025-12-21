/**
 * Project Templates - Pre-configured project templates for quick start
 */

const ProjectTemplates = {
    "studio-etudiant": {
        name: "Studio Étudiant",
        description: "Petit investissement locatif pour étudiants. Idéal pour débuter dans l'immobilier avec un budget limité.",
        simulation: {
            credit: null,
            profit: {
                price: 80000,
                propertyType: "ancien",
                rent: 500,
                notary: 6000,
                works: 3000,
                charges: 600,
                tax: 400,
                vacancyRate: 8,
                agencyFees: 0,
                managementFees: 0
            },
            capacity: null
        },
        tags: ["studio", "étudiant", "petit-budget"],
        category: "investissement",
        color: "#10b981"
    },

    "t2-famille": {
        name: "T2 Famille",
        description: "Appartement 2 pièces pour famille ou jeune couple. Bon équilibre entre investissement et rentabilité.",
        simulation: {
            credit: {
                amount: 135000,
                rate: 3.5,
                years: 20
            },
            profit: {
                price: 150000,
                propertyType: "ancien",
                rent: 750,
                notary: 11250,
                works: 5000,
                charges: 1200,
                tax: 800,
                vacancyRate: 5,
                agencyFees: 0,
                managementFees: 0
            },
            capacity: null
        },
        tags: ["t2", "famille", "investissement-moyen"],
        category: "investissement",
        color: "#3b82f6"
    },

    "t3-colocation": {
        name: "T3 Colocation",
        description: "Appartement 3 pièces idéal pour la colocation étudiante. Rentabilité optimisée.",
        simulation: {
            credit: {
                amount: 180000,
                rate: 3.5,
                years: 20
            },
            profit: {
                price: 200000,
                propertyType: "ancien",
                rent: 1200,
                notary: 15000,
                works: 8000,
                charges: 1500,
                tax: 1000,
                vacancyRate: 6,
                agencyFees: 0,
                managementFees: 0
            },
            capacity: null
        },
        tags: ["t3", "colocation", "étudiants"],
        category: "investissement",
        color: "#8b5cf6"
    },

    "immeuble-rapport": {
        name: "Immeuble de Rapport",
        description: "Immeuble de rapport avec plusieurs appartements. Investissement conséquent pour revenus réguliers.",
        simulation: {
            credit: {
                amount: 450000,
                rate: 3.8,
                years: 25
            },
            profit: {
                price: 500000,
                propertyType: "ancien",
                rent: 3000,
                notary: 37500,
                works: 30000,
                charges: 3000,
                tax: 2500,
                vacancyRate: 7,
                agencyFees: 0,
                managementFees: 0
            },
            capacity: null
        },
        tags: ["immeuble", "rapport", "gros-investissement"],
        category: "investissement",
        color: "#f59e0b"
    },

    "residence-principale": {
        name: "Ma Résidence Principale",
        description: "Achat de résidence principale. Profitez des aides de l'État (PTZ, etc.).",
        simulation: {
            credit: {
                amount: 180000,
                rate: 3.5,
                years: 25
            },
            profit: null,
            capacity: null
        },
        tags: ["résidence-principale", "primo-accédant"],
        category: "achat",
        color: "#ec4899"
    },

    "residence-secondaire": {
        name: "Résidence Secondaire",
        description: "Maison de vacances ou pied-à-terre. Peut être louée en saisonnier.",
        simulation: {
            credit: {
                amount: 162000,
                rate: 3.8,
                years: 20
            },
            profit: {
                price: 180000,
                propertyType: "ancien",
                rent: 600,
                notary: 13500,
                works: 10000,
                charges: 800,
                tax: 900,
                vacancyRate: 40,
                agencyFees: 0,
                managementFees: 0
            },
            capacity: null
        },
        tags: ["résidence-secondaire", "vacances"],
        category: "achat",
        color: "#06b6d4"
    },

    "lmnp-neuf": {
        name: "LMNP Neuf",
        description: "Investissement en LMNP dans le neuf. Avantages fiscaux et TVA récupérable.",
        simulation: {
            credit: {
                amount: 225000,
                rate: 3.5,
                years: 20
            },
            profit: {
                price: 250000,
                propertyType: "new",
                rent: 900,
                notary: 6250,
                works: 0,
                charges: 1000,
                tax: 700,
                vacancyRate: 4,
                agencyFees: 0,
                managementFees: 0
            },
            capacity: null
        },
        tags: ["lmnp", "neuf", "défiscalisation"],
        category: "investissement",
        color: "#14b8a6"
    },

    "parking-garage": {
        name: "Parking / Garage",
        description: "Investissement petit budget avec peu de gestion. Idéal pour compléter un patrimoine.",
        simulation: {
            credit: null,
            profit: {
                price: 15000,
                propertyType: "ancien",
                rent: 80,
                notary: 1125,
                works: 500,
                charges: 50,
                tax: 100,
                vacancyRate: 10,
                agencyFees: 0,
                managementFees: 0
            },
            capacity: null
        },
        tags: ["parking", "garage", "petit-budget"],
        category: "investissement",
        color: "#6366f1"
    }
};

// Expose globally
window.ProjectTemplates = ProjectTemplates;
