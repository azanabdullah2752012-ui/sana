# 🌸 Sana & Me — Private Two-Person Sanctuary

A soft, cozy, and private sanctuary built for two friends using **React, Vite, TypeScript, Tailwind CSS, and Supabase**.

Designed with warm cream backgrounds, blush pink accents, pastel lavender, rounded cards, subtle shadows, gentle animations, and mobile-first layouts.

---

## ☕ Key Features

### 1. Landing Page & Welcoming Dashboard
- **Welcoming Hero:** Soft typography with custom title, blossom animations, and personalized greetings.
- **Partner Presence Card:** Real-time online/activity card showing partner's avatar, bio, and quick-chat shortcut.
- **Home Hub:** Daily question glance, upcoming countdowns, recent scrapbook photos, and pinned notes.

### 2. Strict 2-Person Security & Access Control
- **Supabase Authentication:** Secure email/password login, signup, password reset, and session persistence.
- **Invite-Only Whitelist:** Restricted to **exactly two authorized user accounts** (`member_1` and `member_2`).
- **PostgreSQL Row Level Security (RLS):** Every table enforces database-level policies checked by `is_approved_member(auth.uid())`. Unauthorized users cannot read, insert, update, or delete any data—even if they bypass the React frontend.
- **Max-2 Trigger:** Database trigger prevents inserting more than two accounts into `authorized_members`.
- **Client Security:** No `service_role` secrets or private credentials are ever exposed in client code.

### 3. Real-Time Private Chat
- **1-on-1 Shared Conversation:** Single dedicated channel between the two approved users.
- **Supabase Realtime:** Instant message delivery across devices.
- **Message Replies:** Quote and reply to previous messages with context banners.
- **Emoji Reactions:** Quick floating bar (🌸, 💖, ☕, 🍰, ✨, etc.) with reaction counts.
- **Edit & Delete:** Modify or remove your own messages with owner checks.
- **Auto-scroll & Empty States:** Smooth scroll to bottom and friendly conversation starters.

### 4. Shared Memories (Digital Scrapbook)
- **Polaroid-style Memory Cards:** Title, story description, date, location tag, and tags.
- **Supabase Storage:** Private bucket (`memory-images`) with strict RLS storage policies and signed URLs.
- **Favorites & Search:** One-click heart favorite toggle and instant search.
- **Lightbox Viewer:** Fullscreen zoom for high-res photo viewing.

### 5. Shared Notebook
- **Categorized Notes:** Ideas, reminders, checklists, inside jokes (`🍋`), and things to discuss later.
- **Pastel Color Tags:** Blush, Lavender, Cream, Mint, and Peach card styles.
- **Author Attribution:** Clearly indicates who created each note and who last edited it.
- **Pin to Top:** Keep important checklists pinned to the top of the board.

### 6. Fun Shared Features
- **Daily Reflection Prompt:** A cozy question every morning. Read and compare each other's answers.
- **Random Question Generator:** Deep, cozy, wanderlust, and playful prompts with one-click **"Send to Chat"**.
- **Things to Do Together (Bucket List):** Interactive checklist with celebratory confetti animations on completion!
- **Countdowns & Special Dates:** Track birthdays, friendship anniversaries, and planned getaways with remaining days badges.

### 7. Settings & Aesthetics
- **Theme Switcher:** Light mode, cozy dark mode (deep obsidian-violet slate), and system preference.
- **Accent Palettes:** Blush Pink, Pastel Lavender, and Cream.
- **Profile Customization:** Display name, bio, and curated aesthetic avatars.
- **Security Badge:** Real-time verification badge confirming approved member status (e.g. `member_1` or `member_2`).

---

## 🎨 Design & Aesthetic System

- **Backgrounds:** Warm cream (`#FDFCF7`, `#FAF6ED`) and obsidian slate in dark mode (`#121019`, `#191624`).
- **Accents:** Blush pink (`#F68CAE`, `#FBB7CD`, `#FED7E2`) and pastel lavender (`#BA9BF0`, `#E7DCFA`).
- **Typography:** *Playfair Display* (serif) for warm, elegant headlines and *Plus Jakarta Sans* for clean, modern body text.
- **Shadows & Borders:** Soft diffuse glows (`shadow-cozy`), rounded pill borders (`rounded-3xl`, `rounded-4xl`).

---

## 🗄️ Database Schema & Security (`supabase/schema.sql`)

The repository includes a complete, production-ready SQL migration:

| Table | Description | RLS Policy Summary |
|---|---|---|
| `authorized_members` | Whitelist table of the 2 authorized emails | Read only if approved; client writes strictly blocked (`WITH CHECK (false)`) |
| `profiles` | User profiles (names, bio, avatars, theme) | Read by approved members; write only for own user (`id = auth.uid()`) |
| `conversations` | Private conversation container | Read/Write only if `is_approved_member(auth.uid())` |
| `messages` | Chat messages with replies & edit status | Read by approved members; write/edit/delete only for author |
| `message_reactions` | Emoji reactions on messages | Read by approved members; insert/delete only by author |
| `memories` | Digital scrapbook memories & photos | Read/Write/Delete only if `is_approved_member(auth.uid())` |
| `notes` | Shared notebook with category & pin status | Read/Write/Edit by approved members with author tracking |
| `daily_prompts` | Daily reflection questions | Read by approved members |
| `daily_answers` | Daily answers by both users | Read by approved members; upsert only for own answer |
| `bucket_list_items` | Shared adventures wishlist | Read/Write/Complete by approved members |
| `special_dates` | Countdowns & anniversaries | Read/Write/Delete by approved members |
| `user_preferences` | Widget toggles and display settings | Read/Write only for own user |
| `storage.objects` (`memory-images`) | Private image bucket | Upload/view only allowed if `is_approved_member(auth.uid())` |

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ (Node 20+ or 24 recommended)
- A Supabase account (free tier works great)

### 2. Clone & Install
```bash
git clone <your-repo>
cd s
npm install
```

### 3. Supabase Setup
1. Create a new project in the [Supabase Dashboard](https://supabase.com).
2. Go to **SQL Editor** in your Supabase dashboard.
3. Open `supabase/schema.sql` and run it. This creates all tables, triggers, functions, storage bucket, and RLS policies.
4. Open `supabase/seed.sql`, replace the placeholder emails (`azan@example.com` and `sana@example.com`) with your actual email addresses, and run the script.
5. In **Project Settings -> API**, copy your **Project URL** and **anon public key**.

### 4. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update `.env` with your public Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key
```

### 5. Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 💡 Out-of-the-Box Demo Mode

If you run the app before connecting Supabase (or leave `.env` empty), the app automatically enters **Demo Mode**:
- Pre-loaded with warm demo memories, chat history, inside jokes, and bucket list items.
- A **Demo Persona Switcher** appears in the top navigation and settings to let you switch between **Azan** and **Sana** with 1 click.
- Test message replies, emoji reactions, photo scrapbook uploads, note pinning, and bucket list completions locally with instant state synchronization.
- Test the strict gatekeeper by typing an unauthorized email during sign-up to see the RLS access denial screen.

---

## 📦 Build for Production
```bash
npm run build
npm run preview
```
Production assets are generated in `dist/` with optimal chunk splitting (`vendor`, `supabase`, `icons`).
