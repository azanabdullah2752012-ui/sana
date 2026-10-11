# 🌸 Sana & Me — Private Two-Person Sanctuary

A soft, cozy, and private sanctuary built for two friends using **React, Vite, TypeScript, Tailwind CSS, and Supabase**.

Protected by secret passcodes:
- ☕ **Azan's Passcode:** `azanisthebest`
- 🌸 **Sana's Passcode:** `sanaisthebest`

**No email sign-up, no email confirmation links, and zero email rate limits.**

---

## ☕ Key Features

### 1. Landing Page & Welcoming Dashboard
- **Secret Passcode Gate:** Enter `azanisthebest` or `sanaisthebest` to unlock your respective persona immediately.
- **Partner Presence Card:** Real-time online/activity card showing partner's avatar, bio, and quick-chat shortcut.
- **Home Hub:** Daily question glance, upcoming countdowns, recent scrapbook photos, and pinned notes.

### 2. Strict 2-Person Security & Access Control
- **No Email Hassle:** Direct authentication via your secret passcodes, persistent across sessions and browser restarts.
- **Invite-Only Whitelist:** Restricted to **exactly two authorized user accounts** (`user-azan-001` and `user-sana-002`).
- **PostgreSQL Row Level Security (RLS):** Every table enforces database-level policies checked by `sender_id IN ('user-azan-001', 'user-sana-002')`. Unauthorized users cannot read or write any data.
- **Client Security:** No `service_role` secrets or private credentials are ever exposed in client code.

### 3. Real-Time Private Chat
- **1-on-1 Shared Conversation:** Single dedicated channel between Azan and Sana.
- **Supabase Realtime:** Instant message delivery across devices.
- **Message Replies:** Quote and reply to previous messages with context banners.
- **Emoji Reactions:** Quick floating bar (🌸, 💖, ☕, 🍰, ✨, etc.) with reaction counts.
- **Edit & Delete:** Modify or remove your own messages with owner checks.
- **Auto-scroll & Empty States:** Smooth scroll to bottom and friendly conversation starters.

### 4. Shared Memories (Digital Scrapbook)
- **Polaroid-style Memory Cards:** Title, story description, date, location tag, and tags.
- **Supabase Storage:** Storage bucket (`memory-images`) with photo upload and lightbox zoom.
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
- **Quick Switcher:** Instant persona switcher between Azan and Sana in the top navigation bar.

---

## 🎨 Design & Aesthetic System

- **Backgrounds:** Warm cream (`#FDFCF7`, `#FAF6ED`) and obsidian slate in dark mode (`#121019`, `#191624`).
- **Accents:** Blush pink (`#F68CAE`, `#FBB7CD`, `#FED7E2`) and pastel lavender (`#BA9BF0`, `#E7DCFA`).
- **Typography:** *Playfair Display* (serif) for warm, elegant headlines and *Plus Jakarta Sans* for clean, modern body text.
- **Shadows & Borders:** Soft diffuse glows (`shadow-cozy`), rounded pill borders (`rounded-3xl`, `rounded-4xl`).

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ (Node 20+ or 24 recommended)
- Your Supabase project (`https://vxsushxqhqpjwayadqyj.supabase.co`)

### 2. Run Database Setup in Supabase
1. Open your **[Supabase Dashboard](https://supabase.com/dashboard/project/vxsushxqhqpjwayadqyj)**.
2. In the left sidebar, click **SQL Editor**.
3. Open `supabase/schema.sql`, copy all contents, paste into the editor, and click **Run**.
4. (Optional) Open `supabase/seed.sql`, copy all contents, paste into the editor, and click **Run** to load initial sample memories, notes, and countdowns.

### 3. Run the App
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

- Type `azanisthebest` to enter as **Azan ☕**.
- Type `sanaisthebest` to enter as **Sana 🌸**.
- Anyone typing an incorrect passcode is politely blocked at the gate.
