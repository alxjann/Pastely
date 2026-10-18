# Pastely

A fast and real-time cross-device clipboard pastebin. Send text, photos, and files between your phone and computer instantly.

Everything is temporary and automatically self-destructs after **5 minutes**.

---

## ✨ Features

- **⚡ Real-time Sync**: Instant updates across all connected devices using Convex WebSockets.
- **⏳ Auto-Destruct**: All clips and files permanently expire and delete after 5 minutes.
- **📱 Cross-Platform**: Works across different device.
- **📄 Multi-format**: Paste or upload text, photos, and documents.
- **📲 PWA Support**: Installable directly on your iPhone or desktop home screen.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Database**: [Convex](https://www.convex.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)

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