import 'dotenv/config';
import { Client, Users, ID } from 'node-appwrite';
import { db } from '../src/services/appwriteDb.service';

const DEMO_EMAIL = 'demo@medihealth.app';
const DEMO_PASSWORD = 'Demo123!';
const DEMO_NAME = 'حساب تجريبي';

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT!)
  .setProject(process.env.APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const users = new Users(client);

async function main() {
  console.log('Seeding demo account...\n');

  let userId: string;

  try {
    const list = await users.list({ search: DEMO_EMAIL });
    const existing = list.users.find((u) => u.email === DEMO_EMAIL);
    if (existing) {
      userId = existing.$id;
      console.log(`Demo user exists: ${userId}`);
    } else {
      userId = ID.unique();
      await users.create({ userId, email: DEMO_EMAIL, password: DEMO_PASSWORD, name: DEMO_NAME });
      console.log(`Created demo user: ${userId}`);
    }
  } catch (e) {
    console.error('Failed to create demo user:', e);
    process.exit(1);
  }

  let profile = await db.getUserProfile(userId);
  if (!profile) {
    profile = await db.createUserProfile({
      userId,
      email: DEMO_EMAIL,
      fullName: DEMO_NAME,
      preferredLanguage: 'ar',
    });
  }

  const existingMeds = await db.getUserMedications(userId);
  if (existingMeds.length === 0) {
    const meds = [
      { name: 'Metformin', dosage: '500mg', activeIngredient: 'Metformin HCl', form: 'Tablet', instructions: 'Take with meals twice daily', isActive: true },
      { name: 'Lisinopril', dosage: '10mg', activeIngredient: 'Lisinopril', form: 'Tablet', instructions: 'Take once daily in the morning', isActive: true },
      { name: 'Atorvastatin', dosage: '20mg', activeIngredient: 'Atorvastatin Calcium', form: 'Tablet', instructions: 'Take at bedtime', isActive: true },
      { name: 'Aspirin', dosage: '81mg', activeIngredient: 'Acetylsalicylic Acid', form: 'Tablet', instructions: 'Take once daily', isActive: true },
    ];

    const createdMeds = [];
    for (const med of meds) {
      const doc = await db.createUserMedication(userId, med);
      createdMeds.push(doc);
      console.log(`  Medication: ${med.name}`);
    }

    for (const med of createdMeds) {
      await db.createReminder(userId, { medicationId: med.$id, time: '08:00', frequency: 'daily', daysOfWeek: [], isActive: true });
      await db.createReminder(userId, { medicationId: med.$id, time: '20:00', frequency: 'daily', daysOfWeek: [], isActive: true });
    }
    console.log(`  Reminders created`);

    const demoAnalysis = {
      score: 72,
      riskLevel: 'moderate',
      safetyCategory: 'monitor',
      interactions: [
        { drug: 'Metformin + Lisinopril', severity: 'moderate', description: 'Both may affect kidney function — monitor renal labs' },
        { drug: 'Aspirin + Atorvastatin', severity: 'low', description: 'Generally safe combination for cardiovascular protection' },
      ],
      sideEffects: [
        { symptom: 'Nausea', likelihood: 'common', description: 'Common with Metformin' },
        { symptom: 'Dry cough', likelihood: 'uncommon', description: 'Possible with Lisinopril' },
      ],
      foodInteractions: [
        { food: 'Grapefruit', advice: 'Avoid grapefruit with Atorvastatin — increases drug levels' },
        { food: 'Alcohol', advice: 'Limit alcohol with Metformin — lactic acidosis risk' },
      ],
      safetyConcerns: ['Monitor blood pressure and kidney function regularly'],
      recommendations: ['Consult your physician about aspirin use with your current regimen', 'Take Metformin with food to reduce GI side effects'],
      verificationAvailable: true,
      disclaimer: 'هذا التحليل لأغراض إعلامية فقط.',
    };

    await db.createAnalysisReport(userId, {
      medications: JSON.stringify({ names: ['Metformin', 'Lisinopril', 'Atorvastatin', 'Aspirin'] }),
      symptoms: 'تعب خفيف، دوخة أحياناً',
      notes: 'Demo analysis for judges',
      results: JSON.stringify(demoAnalysis),
      riskLevel: 'moderate',
      safetyScore: 72,
      language: 'ar',
    });

    await db.createScanHistory(userId, {
      imageUrl: 'demo_scan',
      detectedMedications: JSON.stringify([
        { name: 'Metformin', dosage: '500mg', activeIngredient: 'Metformin HCl' },
        { name: 'Lisinopril', dosage: '10mg', activeIngredient: 'Lisinopril' },
      ]),
      analysisResults: JSON.stringify(demoAnalysis),
    });

    console.log(`  Analysis & scan history created`);
  } else {
    console.log(`  Demo data already exists`);
  }

  console.log('\nDemo seed complete!');
  console.log(`Email: ${DEMO_EMAIL}`);
  console.log(`Password: ${DEMO_PASSWORD}`);
}

main().catch(console.error);
