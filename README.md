# KYNTHOR — Strona sprzedażowa z chatbotem AI

[![Netlify](https://img.shields.io/badge/Hosting-Netlify-00C7B7?logo=netlify&logoColor=white)](https://kynthor.pl)
[![Claude](https://img.shields.io/badge/AI-Claude%20Sonnet-D97706?logo=anthropic&logoColor=white)](https://anthropic.com)
![Licencja](https://img.shields.io/badge/Licencja-Prywatna-red)

Strona sprzedażowa ebooka **„TO TYLKO PRĄD"** z wbudowanym asystentem AI odpowiadającym na pytania potencjalnych klientów.

Projekt rozwiązuje problem konwersji odwiedzających stronę — zamiast biernego przeglądania, użytkownik może natychmiast zadać pytanie i otrzymać konkretną odpowiedź dotyczącą produktu, ceny czy dostawy. Chatbot działa 24/7, zna bazę wiedzy o firmie i produkcie, i potrafi zbijać najczęstsze obiekcje zakupowe. Backend oparty jest o Netlify Functions i Claude API, dzięki czemu nie wymaga własnego serwera — całość jest bezserwerowa i skaluje się automatycznie.

---

## Spis treści

- [Funkcjonalności](#funkcjonalności)
- [Wymagania](#wymagania)
- [Instalacja](#instalacja)
- [Użycie](#użycie)
- [Struktura projektu](#struktura-projektu)
- [Technologie](#technologie)
- [Testowanie](#testowanie)
- [Deployment](#deployment)
- [Licencja](#licencja)

---

## Funkcjonalności

### Strona sprzedażowa
- Responsywny landing page zoptymalizowany pod konwersję
- Lazy loading obrazów i czcionek (Core Web Vitals)
- Opóźnione ładowanie Google Analytics (po interakcji lub po 3s)
- Structured data (Schema.org `Product`) dla wyszukiwarek
- Baner cookie z granularną kontrolą zgód

### Chatbot „Darnok"
- **Widget osadzany** — pojawia się w prawym dolnym rogu na każdej stronie bez przebudowy layoutu
- **Historia rozmowy** — zapamiętuje ostatnie 10 wiadomości w ramach sesji
- **Wskaźnik pisania** — animacja trzech kropek podczas oczekiwania na odpowiedź
- **Rate limiting** — max 20 wiadomości/godzinę per IP (konfigurowalny)
- **Filtr prompt injection** — blokuje próby zmiany zachowania modelu (polskie i angielskie wzorce)
- **Filtr wulgaryzmów** — lista słów PL + EN, odpowiedź z komunikatem kulturalnym
- **Sanityzacja inputu** — każda wiadomość obcinana do 2000 znaków
- **Obsługa błędów** — osobne komunikaty dla błędu sieci, przeciążenia API i błędu autoryzacji
- **Baza wiedzy** — chatbot odpowiada wyłącznie na podstawie zdefiniowanej wiedzy o firmie i produkcie

---

## Wymagania

- **Node.js** 18+ (wymagany przez Netlify Functions)
- **Konto Netlify** — hosting + serverless functions
- **Klucz Anthropic API** — model `claude-sonnet-4-20250514`
- Przeglądarka z obsługą ES2017+ (Fetch API, async/await)

---

## Instalacja

### 1. Sklonuj repozytorium

```bash
git clone https://github.com/TWOJ_USERNAME/strona-kynthor.git
cd strona-kynthor
```

### 2. Zainstaluj zależności chatbota

```bash
cd chatbot
npm install
```

### 3. Skonfiguruj zmienne środowiskowe

Skopiuj plik przykładowy i uzupełnij dane:

```bash
cp .env.example .env
```

Zawartość `.env`:

```env
ANTHROPIC_API_KEY=sk-ant-...      # Klucz z console.anthropic.com
CLAUDE_MODEL=claude-sonnet-4-20250514
MAX_TOKENS=1000
RATE_LIMIT=20
BOT_NAME=Darnok
```

> Klucz API ustaw w panelu Netlify (Site settings → Environment variables), nie commituj go do repozytorium.

### 4. Uruchom lokalnie

```bash
npx netlify dev
```

Strona będzie dostępna pod `http://localhost:8888`.

---

## Użycie

### Osadzanie widgetu na stronie

Dodaj przed zamknięciem `</body>`:

```html
<link rel="stylesheet" href="/chatbot/widget.css" media="print" onload="this.media='all'">
<script src="/chatbot/widget.js" defer></script>
```

Widget automatycznie buduje swój DOM i dołącza się do `document.body` — nie wymaga żadnego kontenera.

### Dostosowanie chatbota

Edytuj plik `chatbot/netlify/functions/knowledge.js` — to tam definiujesz:
- tożsamość i ton chatbota
- informacje o firmie i produktach
- odpowiedzi na typowe obiekcje
- granice (czego chatbot nie robi)

Zmiany w bazie wiedzy nie wymagają przebudowy widgetu, tylko redeploy funkcji.

### Konfiguracja zachowania widgetu

Na górze `chatbot/widget.js` znajdziesz sekcję `CONFIG`:

```js
const API_URL   = "https://kynthor.pl/.netlify/functions/chat";
const BOT_NAME  = "Darnok";
const WELCOME_MSG = "Cześć! Jestem Darnok, asystent AI KYNTHOR. W czym mogę Ci pomóc?";
const MAX_HISTORY = 10; // liczba wiadomości wysyłanych do API
```

---

## Struktura projektu

```
strona-kynthor/
├── index.html                        # Główna strona sprzedażowa
├── polityka_prywatnosci.html
├── polityka_cookies.html
├── regulamin.html
├── favicon.ico
├── favicon-32x32.png
├── apple-touch-icon.png
├── img/
│   ├── ebook-cover-480.webp          # Okładka ebooka (responsive)
│   ├── ebook-cover-640.webp
│   ├── ebook-cover-960.webp
│   └── ebook-page-0[1-6].webp        # Podgląd stron ebooka
└── chatbot/
    ├── widget.js                     # Frontend widgetu (vanilla JS, IIFE)
    ├── widget.css                    # Style widgetu
    ├── test.html                     # Strona do ręcznego testowania widgetu
    ├── .env.example                  # Przykładowe zmienne środowiskowe
    ├── netlify.toml                  # Konfiguracja Netlify (esbuild, pliki)
    └── netlify/
        └── functions/
            ├── chat.js               # Serverless function — rate limiting, filtry, Claude API
            ├── knowledge.js          # Baza wiedzy chatbota (moduł JS)
            └── knowledge.txt         # Baza wiedzy (format tekstowy — kopia)
```

---

## Technologie

| Technologia | Wersja | Zastosowanie |
|---|---|---|
| HTML5 / CSS3 | — | Strona i widget |
| JavaScript (Vanilla) | ES2017+ | Frontend widgetu |
| Node.js | 18+ | Środowisko Netlify Functions |
| Netlify | — | Hosting, serverless functions, CI/CD |
| Anthropic Claude API | claude-sonnet-4-20250514 | Model językowy chatbota |
| @anthropic-ai/sdk | latest | Klient Claude API |
| esbuild | (via Netlify) | Bundler funkcji serverless |

---

## Testowanie

Projekt nie posiada automatycznego zestawu testów. Testowanie odbywa się ręcznie przez dedykowaną stronę testową.

### Uruchomienie strony testowej

```bash
cd chatbot
npx netlify dev
# otwórz http://localhost:8888/test.html
```

### Checklist przed deployem

- [ ] Klucz `ANTHROPIC_API_KEY` ustawiony w Netlify → Site settings → Environment variables
- [ ] `npm install` w folderze `chatbot/` wykonane
- [ ] Widget pojawia się w prawym dolnym rogu
- [ ] Wiadomość testowa zwraca odpowiedź (nie błąd serwera)
- [ ] Filtr wulgaryzmów działa (wpisz słowo z listy)
- [ ] Rate limiting działa po 20 wiadomościach z jednego IP
- [ ] Konsola przeglądarki (`F12`) nie pokazuje błędów JS

---

## Deployment

Projekt jest skonfigurowany pod Netlify — deployment odbywa się automatycznie po pushu na `main`.

### Pierwsze wdrożenie

1. Zaloguj się na [netlify.com](https://netlify.com) i połącz repozytorium
2. W ustawieniach projektu ustaw:
   - **Base directory:** `chatbot`
   - **Publish directory:** `.` (korzeń repozytorium)
   - **Functions directory:** `netlify/functions`
3. Dodaj zmienne środowiskowe w **Site settings → Environment variables**:
   - `ANTHROPIC_API_KEY`
   - `CLAUDE_MODEL` (opcjonalnie, domyślnie `claude-sonnet-4-20250514`)
   - `MAX_TOKENS` (opcjonalnie, domyślnie `1000`)
   - `RATE_LIMIT` (opcjonalnie, domyślnie `20`)
   - `BOT_NAME` (opcjonalnie, domyślnie `Darnok`)
4. Wyzwól deploy ręcznie lub pushuj commit

### Ręczny deploy przez CLI

```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

### Domena własna

Skonfiguruj domenę w **Site settings → Domain management**. Netlify wystawia certyfikat SSL automatycznie.

---

## Licencja

Projekt jest własnością prywatną. Kod źródłowy udostępniany jest wyłącznie w celach poglądowych. Kopiowanie, modyfikowanie i redystrybucja bez zgody autora jest zabroniona.

© 2025 Konrad Pochwała / KYNTHOR
