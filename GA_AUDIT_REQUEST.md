# ZAHTJEV ZA REVIZIJSKI IZVJEŠTAJ — ECO SCUBA PROJECT AUDIT
## Za: Google IDX AI Coding Assistant (GA)
## Od: Claude (APA sistem arhitekt)
## Svrha: Izrada konačnog USTAVA projekta (ECO_SCUBA_Google_IDX_ACA_Instructions_v3.md)

---

## KONTEKST

Trebam od tebe **precizan revizijski izvještaj** o trenutnom stanju projekta ECO SCUBA.
Na osnovu tog izvještaja napisat ću konačnu verziju USTAVA koji će biti jedini autoritativni
referentni dokument za cijeli projekat od danas nadalje.

**KRITIČNO:** Ne pretpostavljaj ništa. Ne pišeš iz memorije. Čitaš stvarni kod i reportiraš
tačno ono što je implementirano — ne ono što bi trebalo biti.

---

## REVIZIJSKI IZVJEŠTAJ — 12 SEKCIJA

Molim te da proðeš kroz svaku sekciju i odgovoriš precizno.

---

### SEKCIJA 1: TECH STACK I VERZIJE

Reportiraj tačne verzije iz `package.json`:

```
- React verzija:
- TypeScript verzija:
- Vite verzija:
- Tailwind CSS verzija:
- Supabase JS verzija:
- React Router DOM verzija:
- Zustand verzija:
- Framer Motion verzija:
- Radix UI komponente (navedi koje su instalirane):
- React Hook Form verzija:
- Zod verzija:
- Recharts verzija:
- DOMPurify verzija:
- html2pdf.js ili alternativa verzija:
- Lucide React verzija:
- date-fns verzija:
- Sve ostale zavisnosti iz package.json (navedi svaku):
```

---

### SEKCIJA 2: AI INTEGRACIJA I API KLJUČEVI

**KRITIČNO — ovo se promijenilo od prethodne verzije USTAVA.**

Reportiraj:
```
- Koji AI provider(i) se koriste? (Anthropic Claude, Google Gemini, oba?)
- Koji model(i) se pozivaju? (navedi tačne model stringove)
- Koji API ključevi su konfigurisani kao Supabase secrets?
  (navedi sve, bez stvarnih vrijednosti — samo nazive varijabli)
- Koji API ključevi su u .env.local fajlu?
- Da li postoji fallback logika (npr. ako Anthropic ne odgovori, koristi Gemini)?
- Koji Edge Funkcija(e) pozivaju AI API?
```

---

### SEKCIJA 3: SUPABASE KONFIGURACIJA

```
- Supabase Project ID/URL:
- Da li je Realtime omogućen? Na kojim tabelama?
- Storage bucketi koji postoje (navedi sve):
- Edge Funkcije koje su deploirane (navedi sve + datum posljednjeg deploya ako znaš):
- Da li postoji supabase/functions/ai-generate-section/index.ts? Kakav je sadržaj?
- Da li postoje druge Edge Funkcije? Navedi sve s kratkim opisom:
```

---

### SEKCIJA 4: DATABASE SCHEMA — TRENUTNO STANJE

Za svaku tabelu koja postoji u `public` schema, navedi:
```
- Naziv tabele
- Kolone (naziv, tip, constraint)
- RLS: da/ne
- Policies koje postoje
- Triggeri
- Indeksi
```

Posebno me interesuje:
- Da li postoji tabela za čuvanje analize Javnog poziva?
- Da li projects tabela ima kolone za: javni_poziv_url, javni_poziv_analysis, eligibility_status?
- Da li postoje sve tabele iz prethodnog USTAVA?

---

### SEKCIJA 5: ROUTING I STRANICE

Navedi sve postojeće rute u aplikaciji:
```
- Putanja → Komponenta → Zaštićena (da/ne)
```

Navedi sve stranice/komponente koje postoje u `src/pages/`:
Navedi sve layout komponente u `src/components/layout/`:

---

### SEKCIJA 6: NEW PROJECT WIZARD — TRENUTNO STANJE

**OVO JE NAJVAŽNIJA SEKCIJA za USTAV.**

```
- Koliko koraka ima wizard trenutno?
- Koji je Korak 1? (Javni poziv upload ili forma direktno?)
- Da li postoji UI za upload Javnog poziva?
- Da li postoji UI za prikaz eligibility analize?
- Koji je redoslijed koraka?
- Koji podaci se prikupljaju u kojim koracima?
- Da li wizard komunicira s Edge Funkcijom za analizu PDF-a?
```

---

### SEKCIJA 7: PROJECT EDITOR — TRENUTNO STANJE

```
- Da li postoji src/pages/ProjectEditor.tsx (ili slično)?
- Da li postoji RIP research phase u UI?
- Da li postoji SSE streaming za WA output?
- Da li postoji DisclaimerBanner (žuta kutija)?
- Da li postoje 4 opcije: ODOBRAVAM / IZMIJENI / NAPIŠI PONOVO / DODAJ INFORMACIJE?
- Da li postoji ChangeRequestPanel (5-koračni APA flow)?
- Da li postoji APAStatePanel (State Register prikaz)?
- Da li postoji FinalAssemblyModal?
- Da li postoji HTML preview s DOMPurify sanitizacijom?
- Šta od navedenog radi, a šta je samo skeleton/placeholder?
```

---

### SEKCIJA 8: APA SYSTEM PROMPT — TRENUTNO STANJE

```
- Gdje je pohranjen APA system prompt?
  (src/lib/apa-system-prompt.ts? direktno u Edge Funkciji? negdje drugdje?)
- Da li je v2.0 ili v2.1 prompt implementiran?
- Da li su svih 8 FIX protokola prisutni u promptu?
  FIX-01 Anti-hallucination: DA/NE
  FIX-02 Bosnian section names: DA/NE
  FIX-03 Anti-AI-cliché: DA/NE
  FIX-04 Expert argumentation: DA/NE
  FIX-05 Responsibility clause HTML: DA/NE
  FIX-06 Change protocol: DA/NE
  FIX-07 State Register: DA/NE
  FIX-08 Final Assembly: DA/NE
- Da li su ENH-01 do ENH-06 (Javni poziv nadogradnje) prisutni: DA/NE
- Navedi prvih 10 linija trenutnog system prompta da mogu provjeriti verziju:
```

---

### SEKCIJA 9: EDGE FUNKCIJE — KOMPLETAN POPIS

Za svaku Edge Funkciju koja postoji u `supabase/functions/`:
```
- Naziv funkcije
- Svrha (šta radi)
- Input parametri
- Output format
- Da li koristi AI API? Koji?
- Da li je autentikacija implementirana (JWT provjera)?
- Da li su CORS headeri ispravni?
- Datum posljednje izmjene ako znaš
```

---

### SEKCIJA 10: ENVIRONMENT VARIABLES I SECRETS

```
.env.local — navedi SVE varijable (samo nazive, bez vrijednosti):
Supabase Secrets — navedi SVE (samo nazive):
Da li postoji .env.example fajl? Šta sadrži?
```

---

### SEKCIJA 11: POZNATE GREŠKE I PROBLEMI

Navedi sve greške koje su trenutno prisutne ili su bile prisutne:
```
- Greške u browser konzoli (ako su poznate)
- TypeScript greške (npx tsc --noEmit — navedi izlaz)
- Build greške (npm run build — navedi izlaz)
- Poznati funkcionalni problemi
- Šta je pokušano da se ispravi a nije uspjelo
- Šta je nedovršeno (placeholder/TODO)
```

---

### SEKCIJA 12: IZMJENE OD PRETHODNOG USTAVA

Ovo je kritična sekcija. Navedi SVE što je promijenjeno u odnosu na prethodnu verziju
dokumenta `ECO_SCUBA_Google_IDX_ACA_Instructions_v3.md` koji si dobio/la.

Format:
```
IZMJENA 1:
  Šta je bilo u USTAVU: [opis]
  Šta je sada u kodu: [opis]
  Razlog izmjene: [opis ako znaš]

IZMJENA 2:
  ...
```

Primjeri za koje znam da postoje (provjeri i potvrdi ili ispravi):
- API ključ: Umjesto samo ANTHROPIC_API_KEY, dodan je GEMINI_API_KEY
- [Navedi sve ostale izmjene koje si napravio/la]

---

## FORMAT ODGOVORA

Molim te da odgovoriš u sljedećem formatu:

```
# GA REVIZIJSKI IZVJEŠTAJ — ECO SCUBA
# Datum: [datum]
# Verzija koda: [git commit hash ako postoji, ili "nepoznato"]

## SEKCIJA 1: TECH STACK
[tvoj odgovor]

## SEKCIJA 2: AI INTEGRACIJA
[tvoj odgovor]

... itd za sve sekcije
```

**VAŽNO:**
- Ako nešto nije implementirano, napiši: "NIJE IMPLEMENTIRANO"
- Ako nešto je placeholder/skeleton, napiši: "PLACEHOLDER — nema funkcionalnosti"
- Ako nisi siguran/a, napiši: "NESIGURNO — [razlog]"
- Ne pretpostavljaj. Ne izmišljaj. Ne zaokružuj. Reportiraj tačno ono što postoji.

---

## ZAŠTO JE OVO VAŽNO

Na osnovu tvog izvještaja, Claude će napisati **konačni USTAV v3.1** koji će:
1. Biti jedini autoritativni referentni dokument za cijeli projekat
2. Sadržati tačan tech stack, tačne API ključeve, tačne nazive Edge Funkcija
3. Definisati kompletan APA+RIP+WA sistem prompt koji odgovara stvarnoj implementaciji
4. Biti u potpunoj usklađenosti s onim što je stvarno izgrađeno

Bez tačnog izvještaja, USTAV će sadržavati zastarjele ili netačne informacije što će
uzrokovati konfuziju i greške u budućem razvoju.

---

*Zahtjev pripremio: Claude (APA sistem arhitekt)*
*Za projekat: ECO SCUBA — Klub vodenih sportova S.C.U.B.A., Sarajevo*
