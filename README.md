# Pastely

A fast, real-time, and ephemeral cross-device clipboard pastebin. Send text, photos, and files between your phone and computer instantly.

Everything is temporary and automatically self-destructs after **5 minutes**.

---

## ✨ Features

- **⚡ Real-time Sync**: Instant updates across all connected devices using Convex WebSockets.
- **⏳ Auto-Destruct**: All clips and files permanently expire and delete after 5 minutes.
- **📱 Cross-Platform**: Works smoothly across iOS, Android, Windows, and macOS browsers.
- **📄 Multi-format**: Paste or upload text snippets, photos, and documents.
- **📲 PWA Support**: Installable directly on your iPhone or desktop home screen.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Backend & Realtime**: [Convex](https://www.convex.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Fonts**: [Poppins](https://fonts.google.com/specimen/Poppins) & [Inter](https://fonts.google.com/specimen/Inter)

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/alxjann/Pastely.git
cd Pastely
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start Convex backend
```bash
npx convex dev
```

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or your local IP `http://192.168.x.x:3000` to test across other devices on the same Wi-Fi).

---

## 📄 License
MIT
