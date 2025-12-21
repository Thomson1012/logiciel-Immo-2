/**
 * Constants.js
 * Centralized configuration for fiscal, legal, and default values.
 * 
 * @version 2024.1
 */

export const CONSTANTS = {
    // Métadonnées
    VERSION: '2.0.1',
    DATA_VERSION: '2024.12',
    LAST_UPDATE: '2024-12-01',
    TAX_YEAR: 2024,

    // --- Credit Simulation Defaults ---
    CREDIT: {
        DEFAULT_INSURANCE_RATE: 0.36, // %
        GUARANTEE_RATE: 0.01,         // 1% (Caution)
    },

    // --- Profitability Defaults ---
    PROFITABILITY: {
        NOTARY_FEES_NEW: 0.025,       // 2.5%
        NOTARY_FEES_OLD: 0.075,       // 7.5%
        VACANCY_RATE: 0.08,           // 8%
        DEFAULT_TAX_RATE: 0.30,       // 30% (Flat tax / TMI moyen)
        YIELD_THRESHOLDS: {
            LOW: 2,
            MEDIUM: 4,
            HIGH: 7
        },
        // Additional Fees (Frais Annexes)
        ADDITIONAL_FEES: {
            AGENCY_RATE: 0.05,              // 5% du prix (frais d'agence)
            BANK_APPLICATION_FEE: 1000,     // Frais de dossier bancaire (€)
            EXPERT_FEE: 300,                // Frais d'expertise (€)
            PNO_INSURANCE_ANNUAL: 200,      // Assurance PNO annuelle (€)
            GLI_RATE: 0.025,                // 2.5% des loyers annuels (Garantie Loyers Impayés)
            PROPERTY_MANAGEMENT_RATE: 0.08  // 8% des loyers annuels (gestion locative)
        }
    },

    // --- Tax Calculation (Fiscal Year 2024) ---
    TAX: {
        CSG_CRDS_RATE: 0.172,         // 17.2%
        MICRO_FONCIER_THRESHOLD: 15000, // €

        ABATEMENTS: {
            MICRO_FONCIER: 0.30,      // 30%
            MICRO_BIC: 0.50,          // 50%
            LMNP_AMORTIZATION_SIMPLIFIED: 0.03 // 3% (Estimation)
        },

        // Barème IR 2024 (Revenus 2023)
        BRACKETS: [
            { max: 11294, rate: 0 },
            { max: 28797, rate: 0.11 },
            { max: 82341, rate: 0.30 },
            { max: 177106, rate: 0.41 },
            { max: Infinity, rate: 0.45 }
        ],

        // Impôt sur les Sociétés (IS) 2024
        IS: {
            REDUCED_RATE: 0.15,       // 15%
            NORMAL_RATE: 0.25,        // 25%
            REDUCED_THRESHOLD: 42500  // €
        }
    },

    // --- DPE (Diagnostic de Performance Énergétique) ---
    DPE: {
        CLASSES: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
        RENTAL_BANS: {
            G: '2025-01-01',  // Interdit à la location dès 2025
            F: '2028-01-01',  // Interdit à la location dès 2028
            E: '2034-01-01'   // Interdit à la location dès 2034
        },
        // Coûts moyens de rénovation énergétique (€)
        RENOVATION_COSTS: {
            'G_to_D': 25000,  // Passoire thermique → Correct
            'F_to_D': 18000,  // Mauvais → Correct
            'E_to_D': 12000   // Moyen → Correct
        },
        // Gain énergétique estimé en kWh/m²/an
        ENERGY_SAVINGS: {
            'G_to_D': 200,
            'F_to_D': 150,
            'E_to_D': 100
        }
    },

    // --- State Aids (Aides de l'État) ---
    AIDS: {
        PTZ: {
            // Plafonds de revenus par zone et nombre d'occupants (2024)
            INCOME_LIMITS: {
                A: { // Paris, Côte d'Azur
                    1: 37000,
                    2: 51800,
                    3: 62900,
                    4: 74000,
                    5: 85100
                },
                B1: { // Grandes agglomérations > 250k hab
                    1: 30000,
                    2: 42000,
                    3: 51000,
                    4: 60000,
                    5: 69000
                },
                B2: { // Agglomérations 50-250k hab
                    1: 27000,
                    2: 37800,
                    3: 45900,
                    4: 54000,
                    5: 62100
                },
                C: { // Reste du territoire
                    1: 24000,
                    2: 33600,
                    3: 40800,
                    4: 48000,
                    5: 55200
                }
            },
            QUOTITE: {
                NEW: 0.50,          // 50% neuf
                OLD_WORKS: 0.40     // 40% ancien avec travaux
            },
            MAX_AMOUNT: {
                A: 150000,
                B1: 135000,
                B2: 110000,
                C: 100000
            }
        },
        MA_PRIME_RENOV: {
            THRESHOLDS: {
                BLUE: 30000,
                YELLOW: 50000,
                VIOLET: 80000
            },
            // Montants par type de travaux (€)
            WORKS: {
                HEAT_PUMP: {
                    name: 'Pompe à chaleur air/eau',
                    BLUE: 5000,
                    YELLOW: 4000,
                    VIOLET: 3000,
                    ROSE: 0
                },
                INSULATION_WALLS: {
                    name: 'Isolation murs extérieurs',
                    unit: '€/m²',
                    BLUE: 25,
                    YELLOW: 20,
                    VIOLET: 15,
                    ROSE: 15
                },
                INSULATION_ROOF: {
                    name: 'Isolation toiture',
                    unit: '€/m²',
                    BLUE: 25,
                    YELLOW: 20,
                    VIOLET: 15,
                    ROSE: 7
                },
                WINDOWS: {
                    name: 'Fenêtres double vitrage',
                    unit: '€/équipement',
                    BLUE: 100,
                    YELLOW: 80,
                    VIOLET: 40,
                    ROSE: 40
                },
                VENTILATION: {
                    name: 'VMC double flux',
                    BLUE: 4000,
                    YELLOW: 3000,
                    VIOLET: 2000,
                    ROSE: 2000
                },
                SOLAR_WATER_HEATER: {
                    name: 'Chauffe-eau solaire',
                    BLUE: 4000,
                    YELLOW: 3000,
                    VIOLET: 2000,
                    ROSE: 0
                }
            },
            BONUS: {
                BBC: 1500,              // Bonus Bâtiment Basse Consommation
                SORTIE_PASSOIRE: 10000  // Bonus sortie passoire (F/G → D)
            }
        },
        ECO_PTZ: {
            MAX_AMOUNT: 50000
        },
        TVA_REDUCED: 0.055, // 5.5%
        LOC_AVANTAGES: {
            // Nouveau dispositif 2024 remplaçant Pinel
            REDUCTION_RATES: {
                INTERMEDIATE: 0.15,  // 15% (loyer intermédiaire)
                SOCIAL: 0.20,        // 20% (loyer social)
                VERY_SOCIAL: 0.25    // 25% (loyer très social)
            },
            DURATION_YEARS: [6, 9, 12]
        }
    },

    // --- Vacancy Rate by Location Type ---
    VACANCY: {
        DEFAULT: 0.05,      // 5% (moyenne nationale)
        PARIS: 0.02,        // 2% (marché tendu)
        BIG_CITY: 0.04,     // 4% (grandes villes)
        MEDIUM_CITY: 0.06,  // 6% (villes moyennes)
        RURAL: 0.08         // 8% (zones rurales)
    },

    // --- Validation Limits ---
    VALIDATION: {
        CREDIT: {
            AMOUNT: { MIN: 1000, MAX: 100000000 },
            RATE: { MIN: 0, MAX: 20 }, // Increased max slightly for flexibility
            YEARS: { MIN: 1, MAX: 35 },
            INSURANCE_RATE: { MIN: 0, MAX: 5 }
        },
        PROFITABILITY: {
            PRICE: { MIN: 1000, MAX: 500000000 },
            RENT: { MIN: 50, MAX: 500000 }, // Lowered min rent
            CHARGES: { MIN: 0, MAX: 50000 },
            AX: { MIN: 0, MAX: 50000 }, // Property tax (Taxe foncière)
        },
        CAPACITY: {
            INCOME: { MIN: 0, MAX: 1000000 },
            EXPENSES: { MIN: 0, MAX: 500000 },
            DEBT_RATIO: { MIN: 1, MAX: 50 }
        }
    }
};
