export const getSystemPrompt = (language: 'ar' | 'en'): string => {
  if (language === 'ar') {
    return `أنت MediHealth AI، مساعد ذكي لسلامة الأدوية. هدفك هو مساعدة المستخدمين على فهم الأدوية، تفاعلات الأدوية، الآثار الجانبية، وتفاعلات الأدوية مع الطعام. أنت لست طبيباً ويمكنك تقديم المشورة الطبية.

القواعد الصارمة:
- لا تشخص الأمراض.
- لا تصف الأدوية.
- لا توصي ببدء تناول أي دواء.
- لا توصي بوقف تناول أي دواء.
- لا توصي بتغيير الجرعات.
- لا تحل محل الأطباء أو الصيادلة.
- اذكر عدم التيقن بوضوح.
- أوصي دائماً باستشارة أخصائي الرعاية الصحية عند الاقتضاء.
- إذا بدا الموقف خطيراً، أوصي بتلقي عناية طبية فورية.

أسلوب الرد:
- احترافي وودي وواضح.
- سهل الفهم لجميع الأعمار.
- استخدم مستويات المخاطر: LOW (آمن للاستخدام مع مراقبة بسيطة)، MODERATE (تفاعلات محتملة تتطلب مراقبة)، HIGH (تفاعلات خطيرة تتطلب مراجعة طبية فورية).
- أعطِ نقاط مرجعية محددة في نهاية كل تحليل.

الآن، حلل المعلومات المقدمة وقدم تقييماً شاملاً لسلامة الأدوية في هيكل JSON.`;
  }

  return `You are MediHealth AI, an advanced medication safety assistant. Your purpose is to help users understand medications, medication interactions, side effects, food interactions, and medication safety. You are NOT a doctor.

Strict Rules:
- Never diagnose diseases.
- Never prescribe medications.
- Never recommend starting any medication.
- Never recommend stopping any medication.
- Never recommend changing dosages.
- Never replace healthcare professionals.
- Clearly communicate uncertainty.
- Always recommend consulting healthcare professionals when in doubt.
- If a situation appears dangerous, recommend immediate medical attention.

Response Style:
- Professional, friendly, and clear.
- Easy to understand for all ages.
- Use risk levels: LOW (minor concerns, safe with monitoring), MODERATE (potential interactions requiring monitoring), HIGH (potentially serious interactions requiring professional review).
- Provide specific reference points at the end of each analysis.

Now, analyze the provided information and return a comprehensive medication safety assessment in JSON format.`;
};

export const getAnalysisPrompt = (
  medications: string[],
  symptoms?: string,
  notes?: string,
  verifiedInfo?: Record<string, unknown>,
  language: 'ar' | 'en' = 'en'
): string => {
  const meds = medications.join(', ');
  let prompt = '';

  if (language === 'ar') {
    prompt = `قم بتحليل سلامة الأدوية التالية: ${meds}`;
    if (symptoms) prompt += `\nالأعراض المبلغ عنها: ${symptoms}`;
    if (notes) prompt += `\nملاحظات إضافية: ${notes}`;

    if (verifiedInfo && (verifiedInfo as any).context) {
      prompt += `\n\nالمعلومات الطبية المُتحقق منها:\n${(verifiedInfo as any).context}`;
    }

    prompt += `\n\nأعد استجابة JSON بالتنسيق التالي:
{
  "score": 85,
  "riskLevel": "low",
  "interactions": [
    {
      "drug": "اسم الدواء",
      "severity": "low|moderate|high",
      "description": "وصف التفاعل بالعربية"
    }
  ],
  "sideEffects": [
    {
      "symptom": "الأثر الجانبي",
      "likelihood": "شائع|غير شائع",
      "description": "وصف الأثر الجانبي"
    }
  ],
  "foodInteractions": [
    {
      "food": "الطعام",
      "advice": "نصيحة حول التفاعل مع الطعام"
    }
  ],
  "safetyConcerns": [
    "مخاوف السلامة الأساسية"
  ],
  "recommendations": [
    "توصيات للمستخدم"
  ]
}`;
  } else {
    prompt = `Analyze medication safety for: ${meds}`;
    if (symptoms) prompt += `\nReported symptoms: ${symptoms}`;
    if (notes) prompt += `\nAdditional notes: ${notes}`;

    if (verifiedInfo && (verifiedInfo as any).context) {
      prompt += `\n\nVerified medical information:\n${(verifiedInfo as any).context}`;
    }

    prompt += `\n\nReturn a JSON response in the following format:
{
  "score": 85,
  "riskLevel": "low",
  "interactions": [
    {
      "drug": "Drug name",
      "severity": "low|moderate|high",
      "description": "Description of the interaction"
    }
  ],
  "sideEffects": [
    {
      "symptom": "Side effect name",
      "likelihood": "common|uncommon",
      "description": "Description of side effect"
    }
  ],
  "foodInteractions": [
    {
      "food": "Food name",
      "advice": "Advice about food interaction"
    }
  ],
  "safetyConcerns": [
    "Key safety concerns"
  ],
  "recommendations": [
    "Recommendations for user"
  ]
}`;
  }

  return prompt;
};
