import type {
  MedicationInfo,
  MedicationWarnings,
  MedicationInteractionsResult,
  MedicalArticleResult,
  InteractionPair,
  RiskLevel,
} from '../types/medical';

const TRUSTED_SOURCES = {
  openfda: 'https://api.fda.gov/drug/label.json',
  dailymed: 'https://dailymed.nlm.nih.gov',
  medlineplus: 'https://medlineplus.gov',
  nih: 'https://www.nih.gov',
  mayoclinic: 'https://www.mayoclinic.org',
  clevelandclinic: 'https://my.clevelandclinic.org',
  nhs: 'https://www.nhs.uk',
  drugscom: 'https://www.drugs.com',
} as const;

const SEARCH_URLS: Record<string, (query: string) => string> = {
  medlineplus: (q) => `https://medlineplus.gov/search.html?query=${encodeURIComponent(q)}`,
  drugscom: (q) => `https://www.drugs.com/search.php?searchterm=${encodeURIComponent(q)}`,
  mayoclinic: (q) => `https://www.mayoclinic.org/search/search-results?q=${encodeURIComponent(q)}`,
  nhs: (q) => `https://www.nhs.uk/search/?q=${encodeURIComponent(q)}`,
  dailymed: (q) => `https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=${encodeURIComponent(q)}`,
};

interface CacheEntry {
  data: unknown;
  expiresAt: number;
}

class WebResearchService {
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000;
  private readonly baseUrl =
    process.env.WEB_SEARCH_API_URL || 'https://websearch.miyami.tech';

  private getCacheKey(key: string): string {
    return `wr:${Buffer.from(key).toString('base64url')}`;
  }

  private getCached<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  private setCache(key: string, data: unknown): void {
    this.cache.set(key, { data, expiresAt: Date.now() + this.CACHE_DURATION });
  }

  private async fetchWithTimeout(url: string, timeoutMs = 12000, retries = 2): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            Accept: 'text/plain,text/markdown,application/json,*/*',
            'User-Agent': 'MediHealth/1.0 (medication research service)',
          },
        });
        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
        }
      }
    }

    throw lastError || new Error('Network request failed');
  }

  async fetchUrlContent(url: string): Promise<string | null> {
    const cacheKey = this.getCacheKey(`fetch:${url}`);
    const cached = this.getCached<string>(cacheKey);
    if (cached) return cached;

    try {
      const apiUrl = `${this.baseUrl}/fetch?url=${encodeURIComponent(url)}&format=markdown`;
      const response = await this.fetchWithTimeout(apiUrl);
      if (!response.ok) return null;
      const content = await response.text();
      if (content && content.length > 50) {
        this.setCache(cacheKey, content.slice(0, 8000));
        return content.slice(0, 8000);
      }
    } catch {
      // skip source
    }
    return null;
  }

  async fetchMedicationInformation(medicationName: string): Promise<MedicationInfo> {
    const cacheKey = this.getCacheKey(`info:${medicationName.toLowerCase()}`);
    const cached = this.getCached<MedicationInfo>(cacheKey);
    if (cached) return cached;

    const sourcesUsed: string[] = [];
    const warnings: string[] = [];
    const precautions: string[] = [];
    let summary = '';

    try {
      const openFdaUrl = `${TRUSTED_SOURCES.openfda}?search=openfda.generic_name:"${encodeURIComponent(medicationName)}"&limit=1`;
      const response = await this.fetchWithTimeout(openFdaUrl);
      if (response.ok) {
        const data = (await response.json()) as { results?: Array<Record<string, unknown>> };
        const result = data.results?.[0];
        if (result) {
          sourcesUsed.push('OpenFDA');
          const openfda = result.openfda as Record<string, string[]> | undefined;
          if (openfda?.generic_name?.[0]) {
            summary += `Generic name: ${openfda.generic_name[0]}. `;
          }
          const warn = (result as Record<string, string[]>).warnings;
          if (warn?.[0]) warnings.push(warn[0].slice(0, 500));
        }
      }
    } catch {
      // skip
    }

    for (const [source, buildUrl] of Object.entries(SEARCH_URLS).slice(0, 3)) {
      try {
        const content = await this.fetchUrlContent(buildUrl(medicationName));
        if (content) {
          sourcesUsed.push(source);
          summary += content.slice(0, 400) + ' ';
          break;
        }
      } catch {
        // skip
      }
    }

    const result: MedicationInfo = {
      medication: medicationName,
      summary: summary.trim() || undefined,
      warnings: warnings.length ? warnings : undefined,
      precautions: precautions.length ? precautions : undefined,
      sources: sourcesUsed,
      timestamp: Date.now(),
    };

    this.setCache(cacheKey, result);
    return result;
  }

  async fetchMedicationWarnings(medicationName: string): Promise<MedicationWarnings> {
    const cacheKey = this.getCacheKey(`warnings:${medicationName.toLowerCase()}`);
    const cached = this.getCached<MedicationWarnings>(cacheKey);
    if (cached) return cached;

    const warnings: unknown[] = [];

    try {
      const openFdaUrl = `${TRUSTED_SOURCES.openfda}?search=openfda.generic_name:"${encodeURIComponent(medicationName)}"&limit=1`;
      const response = await this.fetchWithTimeout(openFdaUrl);
      if (response.ok) {
        const data = (await response.json()) as { results?: Array<Record<string, unknown>> };
        const result = data.results?.[0];
        if (result) {
          warnings.push({
            source: 'OpenFDA',
            boxed_warning: (result as Record<string, string[]>).boxed_warning?.[0],
            warnings: (result as Record<string, string[]>).warnings?.[0],
            precautions: (result as Record<string, string[]>).precautions?.[0],
          });
        }
      }
    } catch {
      // skip
    }

    try {
      const content = await this.fetchUrlContent(
        SEARCH_URLS.drugscom(`${medicationName} warnings`)
      );
      if (content) {
        warnings.push({ source: 'Drugs.com', content: content.slice(0, 1000) });
      }
    } catch {
      // skip
    }

    const result: MedicationWarnings = {
      medication: medicationName,
      warnings,
      timestamp: Date.now(),
    };

    this.setCache(cacheKey, result);
    return result;
  }

  async fetchMedicationInteractions(medications: string[]): Promise<MedicationInteractionsResult> {
    const cacheKey = this.getCacheKey(`interactions:${medications.sort().join(',')}`);
    const cached = this.getCached<MedicationInteractionsResult>(cacheKey);
    if (cached) return cached;

    const pairs = this.detectKnownInteractions(medications);

    for (const med of medications.slice(0, 3)) {
      try {
        const content = await this.fetchUrlContent(
          SEARCH_URLS.drugscom(`${med} drug interactions`)
        );
        if (content) {
          pairs.push({
            drug1: med,
            drug2: 'other medications',
            severity: 'moderate' as RiskLevel,
            description: content.slice(0, 300),
          });
        }
      } catch {
        // skip
      }
    }

    const result: MedicationInteractionsResult = {
      pairs,
      checkedAt: Date.now(),
      source: 'verified_sources',
    };

    this.setCache(cacheKey, result);
    return result;
  }

  async fetchMedicalArticle(query: string): Promise<MedicalArticleResult> {
    const cacheKey = this.getCacheKey(`article:${query.toLowerCase()}`);
    const cached = this.getCached<MedicalArticleResult>(cacheKey);
    if (cached) return cached;

    const snippets: MedicalArticleResult['snippets'] = [];
    const sources = ['medlineplus', 'mayoclinic', 'nhs'] as const;

    for (const source of sources) {
      try {
        const url = SEARCH_URLS[source](query);
        const content = await this.fetchUrlContent(url);
        if (content) {
          snippets.push({
            source,
            url,
            title: `${query} - ${source}`,
            content: content.slice(0, 1500),
          });
          break;
        }
      } catch {
        // skip
      }
    }

    const result: MedicalArticleResult = {
      query,
      snippets,
      timestamp: Date.now(),
    };

    this.setCache(cacheKey, result);
    return result;
  }

  async buildMedicalContext(
    medications: string[],
    symptoms?: string
  ): Promise<{ context: string; verificationAvailable: boolean; sourcesUsed: string[] }> {
    const contextParts: string[] = [];
    const sourcesUsed: string[] = [];
    let verificationAvailable = false;

    const infoResults = await Promise.allSettled(
      medications.slice(0, 5).map((med) => this.fetchMedicationInformation(med))
    );

    for (const result of infoResults) {
      if (result.status === 'fulfilled' && result.value.sources.length > 0) {
        verificationAvailable = true;
        const info = result.value;
        sourcesUsed.push(...info.sources);
        const section = [
          `## ${info.medication}`,
          info.summary,
          info.warnings?.length ? `Warnings: ${info.warnings.join('; ')}` : '',
        ]
          .filter(Boolean)
          .join('\n');
        contextParts.push(section);
      }
    }

    if (medications.length >= 2) {
      try {
        const interactions = await this.fetchMedicationInteractions(medications);
        if (interactions.pairs.length > 0) {
          verificationAvailable = true;
          contextParts.push(`## Interaction Data\n${JSON.stringify(interactions.pairs)}`);
        }
      } catch {
        // skip
      }
    }

    if (symptoms) {
      try {
        const article = await this.fetchMedicalArticle(symptoms);
        if (article.snippets.length > 0) {
          verificationAvailable = true;
          sourcesUsed.push(...article.snippets.map((s) => s.source));
          contextParts.push(
            `## Medical Context for: ${symptoms}\n${article.snippets.map((s) => s.content).join('\n')}`
          );
        }
      } catch {
        // skip
      }
    }

    const context =
      contextParts.join('\n\n') ||
      'No verified medical information was available. Please proceed with AI analysis only.';

    return { context, verificationAvailable, sourcesUsed: [...new Set(sourcesUsed)] };
  }

  private detectKnownInteractions(medications: string[]): InteractionPair[] {
    const known: Record<string, Array<{ drug: string; severity: RiskLevel; description: string }>> = {
      warfarin: [
        { drug: 'aspirin', severity: 'high', description: 'Increased bleeding risk' },
        { drug: 'ibuprofen', severity: 'high', description: 'Increased bleeding risk' },
      ],
      ibuprofen: [
        { drug: 'lisinopril', severity: 'moderate', description: 'Reduced antihypertensive effect' },
        { drug: 'warfarin', severity: 'high', description: 'Increased bleeding risk' },
      ],
      metformin: [
        { drug: 'contrast dye', severity: 'high', description: 'Risk of lactic acidosis' },
      ],
      simvastatin: [
        { drug: 'grapefruit', severity: 'high', description: 'Increases drug levels' },
      ],
      sertraline: [
        { drug: 'tramadol', severity: 'moderate', description: 'Serotonin syndrome risk' },
      ],
      levothyroxine: [
        { drug: 'omeprazole', severity: 'moderate', description: 'Reduced absorption' },
      ],
    };

    const interactions: InteractionPair[] = [];
    const normalized = medications.map((m) => m.toLowerCase());

    for (let i = 0; i < normalized.length; i++) {
      for (let j = i + 1; j < normalized.length; j++) {
        for (const [key, pairs] of Object.entries(known)) {
          if (normalized[i].includes(key) || normalized[j].includes(key)) {
            const match = pairs.find(
              (p) => normalized[j].includes(p.drug) || normalized[i].includes(p.drug)
            );
            if (match) {
              interactions.push({
                drug1: medications[i],
                drug2: medications[j],
                severity: match.severity,
                description: match.description,
              });
            }
          }
        }
      }
    }

    return interactions;
  }
}

export const webResearchService = new WebResearchService();
