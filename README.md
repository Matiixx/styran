# Styran - Advanced Project Management System 🚀

![Styran](https://kf9zqq869t.ufs.sh/f/UXq6fJAGg0ksa5HUXgnwUrjWuRN3c5vzyk4816q9HfGlOeDp)

**Styran** to nowoczesna aplikacja webowa do zarządzania projektami, zaprojektowana z myślą o zespołach programistycznych wykorzystujących metodyki Agile/Scrum. Nazwa pochodzi od starego angielskiego słowa oznaczającego "kierowanie", "prowadzenie" symbolizującego prowadzenie projektów ku sukcesowi.

## 🎯 Główne funkcjonalności

### 📋 Zarządzanie zadaniami

- **Kompleksny system zadań** z priorytetami i statusami
- **Tablica Kanban** z drag & drop
- **Story points** dla estymacji
- **Przypisywanie zadań** członkom zespołu
- **System komentarzy** dla komunikacji

### 🏃‍♂️ Sprint Management

- **Planowanie sprintów** z datami rozpoczęcia i zakończenia
- **Burndown charts** do śledzenia postępów
- **Velocity tracking** zespołu
- **Backlog management** z możliwością przenoszenia zadań

### 📅 Kalendarz projektowy

- **Integracja z Google Calendar**
- **Wizualizacja deadlines** i terminów
- **Drag & drop** zadań w kalendarzu
- **Automatyczna synchronizacja** wydarzeń

### ⏱️ Time Tracking

- **Precyzyjne śledzenie czasu** pracy nad zadaniami
- **Raporty czasowe** dla zespołu
- **Analiza wykorzystania zasobów**
- **Real-time tracking** z możliwością start/stop

### 🔗 Integracje zewnętrzne

- **Google Calendar** - synchronizacja wydarzeń
- **Discord Webhooks** - automatyczne powiadomienia
- **SendGrid** - system emailowy
- **Timezone awareness** - wsparcie dla różnych stref czasowych

### 📊 Analityka i raporty

- **Wykresy burndown** dla sprintów
- **Statystyki zespołu** i projektów
- **Resource utilization** analysis
- **Activity logs** z pełną historią zmian

## 🛠️ Stack technologiczny

### Frontend

- **Next.js 15** - React framework z SSR/SSG
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessibility-first components
- **React Hook Form + Zod** - Forms & validation
- **@dnd-kit** - Drag and drop functionality
- **React Big Calendar** - Calendar components

### Backend

- **tRPC** - Type-safe API
- **Prisma ORM** - Database management
- **PostgreSQL** - Primary database
- **Redis** - Caching & real-time subscriptions
- **NextAuth.js** - Authentication

### DevOps & Tools

- **ESLint + Prettier** - Code quality
- **Vitest** - Testing framework
- **Vercel** - Deployment platform

## 🚀 Szybki start

### Wymagania

- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- npm/yarn/pnpm

### Instalacja

1. **Klonowanie repozytorium**

```bash
git clone <repository-url>
cd styran
```

2. **Instalacja zależności**

```bash
npm install
```

3. **Konfiguracja środowiska**

```bash
cp .env.example .env
```

Uzupełnij plik `.env` z wymaganymi zmiennymi:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/styran"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
REDIS_URL="redis://localhost:6379"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
SENDGRID_API_KEY="your-sendgrid-key"
```

4. **Inicjalizacja bazy danych**

```bash
npm run db:push
npm run db:generate
```

5. **Uruchomienie w trybie deweloperskim**

```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem `http://localhost:3000`

## 📁 Struktura projektu

```
src/
├── app/                    # Next.js App Router
│   ├── projects/          # Strony zarządzania projektami
│   ├── my-profile/        # Profil użytkownika
│   └── api/               # API endpoints
├── components/            # Komponenty UI
├── server/               # Backend logic
│   ├── api/              # tRPC routers
│   ├── auth/             # Konfiguracja auth
│   └── integrations/     # Integracje zewnętrzne
├── lib/                  # Utilities i schemas
├── utils/                # Helper functions
└── styles/               # Style globalne
```

## 🔧 Dostępne skrypty

```bash
# Development
npm run dev              # Uruchomienie dev server
npm run build           # Build produkcyjny
npm run start           # Uruchomienie produkcyjne

# Database
npm run db:generate     # Generowanie Prisma client
npm run db:push         # Push schema do bazy
npm run db:studio       # Prisma Studio

# Code Quality
npm run lint            # Linting
npm run lint:fix        # Auto-fix lint errors
npm run format:check    # Sprawdzenie formatowania
npm run format:write    # Formatowanie kodu

# Testing
npm run test            # Uruchomienie testów
npm run typecheck       # Type checking
```

## 🌟 Kluczowe funkcjonalności w szczegółach

### Real-time Collaboration

- **WebSocket connections** via Redis
- **Live updates** statusów zadań
- **Collaborative editing** komentarzy
- **Instant notifications** o zmianach

### Zaawansowane filtrowanie

- **Multi-criteria filtering** zadań
- **Full-text search** w tytułach i opisach
- **Date range filtering** dla terminów
- **User-based filtering** według przypisania

### Inteligentne powiadomienia

- **Timezone-aware** Discord notifications
- **Weekly summaries** projektów
- **Deadline reminders**
- **Sprint completion** alerts

## 🔒 Bezpieczeństwo

- **NextAuth.js** authentication
- **Role-based access control**
- **Project-level permissions**
- **Secure API endpoints** z tRPC middleware
- **Input validation** z Zod schemas

## 📈 Performance

- **Server-side rendering** dla SEO
- **Static generation** gdzie możliwe
- **React Query** caching
- **Redis** dla session storage
- **Optimized bundle** z Next.js

## 🤝 Rozwój projektu

### Planowane funkcjonalności

- [ ] **Mobile app** (React Native)
- [ ] **Advanced analytics** dashboard
- [ ] **AI-powered** task estimation
- [ ] **Slack integration**
- [ ] **GitHub/GitLab** sync
- [ ] **Multi-tenant** architecture

### Contributing

1. Fork projektu
2. Stwórz feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push do branch (`git push origin feature/amazing-feature`)
5. Otwórz Pull Request

## 📝 Licencja

Ten projekt jest licencjonowany na licencji MIT - szczegóły w pliku [LICENSE](LICENSE).

## 👥 Zespół

Stworzony z ❤️ jako projekt magisterski

## 📞 Wsparcie

W przypadku problemów lub pytań:

- Otwórz [Issue](../../issues) na GitHubie
- Sprawdź [dokumentację](docs/)
- Skontaktuj się z zespołem

---

**Styran** - Twój partner w efektywnym zarządzaniu projektami! 🎯
