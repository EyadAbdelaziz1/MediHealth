# Appwrite Database Schema — MediHealth AI

Database ID: `6a3469eb002697b97c06`

## Collections

### user_profiles
| Attribute | Type | Required |
|-----------|------|----------|
| email | string | yes |
| fullName | string | yes |
| preferredLanguage | string | no (default: ar) |

Document ID = Appwrite User ID

### user_medications
| Attribute | Type |
|-----------|------|
| userId | string |
| name | string |
| dosage | string |
| activeIngredient | string |
| form | string |
| instructions | string |
| prescribedBy | string |
| startDate | string |
| endDate | string |
| isActive | boolean |
| notes | string |

### reminders
| Attribute | Type |
|-----------|------|
| userId | string |
| medicationId | string |
| time | string (HH:mm) |
| frequency | string |
| daysOfWeek | string (JSON) |
| isActive | boolean |

### reminder_completions
| Attribute | Type |
|-----------|------|
| reminderId | string |
| status | string (taken/missed) |
| completedAt | string |

### analysis_reports
| Attribute | Type |
|-----------|------|
| userId | string |
| medicationId | string |
| medications | string (JSON) |
| symptoms | string |
| notes | string |
| results | string (JSON) |
| riskLevel | string |
| safetyScore | integer |
| language | string |

### scan_histories
| Attribute | Type |
|-----------|------|
| userId | string |
| imageUrl | string |
| detectedMedications | string (JSON) |
| analysisResults | string (JSON) |

### password_resets
| Attribute | Type |
|-----------|------|
| userId | string |
| code | string |
| expiresAt | string |
| used | boolean |

## Safety Score Categories

| Score | Category |
|-------|----------|
| 80–100 | Safe |
| 60–79 | Monitor |
| 40–59 | Warning |
| 0–39 | High Risk |

## Prisma Reference

See `server/prisma/schema.prisma` for equivalent relational model (legacy reference).
