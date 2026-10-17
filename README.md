# Eagle Launcher 🦅

A high-performance, minimalist, and unified PC game launcher for Windows built with **Tauri 2**, **React 18**, **TypeScript**, **Tailwind CSS**, and **Rust**.

---

## ✨ Features

- **Unified Multi-Platform Scanner**:
  - Automatically discovers installed games across **Steam**, **Epic Games Store**, **GOG Galaxy**, and **Xbox / PC Game Pass**.
  - **Standalone Games (No Launcher)**: Automatically detects standalone PC games (e.g. *Stray*, *Minecraft*, *osu!*, DRM-free titles, custom executables).
  - **Retro Emulation**: Built-in support for SNES, PS2, GBA, and Switch ROM directories.

- **Crisp Horizontal Box Art**:
  - Direct integration with Steam's CDN and Storefront API with multi-mirror failover (`Fastly`, `Cloudflare`, `Akamai`).
  - Procedural gradient card fallbacks with gamepad emblems for unlisted homebrew or offline games.

- **Pulse — Zero Decision Fatigue**:
  - Overwhelmed by your library? Choose your mental bandwidth (*20 Min & Low Energy*, *High-Focus / Mechanical*, *Rainy Sunday Cozy*, *Deep Story Immersion*).
  - Spotlights **one single game** to play right now with a liquid-glass instant launch button and dice reroll.

- **Deal Finder & Platform Sales Radar**:
  - Live, real-time verified specials directly from Steam's storefront API.
  - Accurate countdown calendar to major sales (*Steam Scream Fest*, *Autumn Sale*, *Epic Holiday 15 Days of Free Games*, *GOG Winter Sale*, *Xbox Countdown*).

- **Google Drive Cloud Game Saves**:
  - Automatic save snapshots: zips and syncs game save files directly to your Google Drive upon game exit.
  - Interactive "Explain How" setup guide with 3-step walkthrough and folder selector.
  - Universal coverage: works for Steam, Standalone PC games, and retro ROM emulators.

- **First-Launch Onboarding Wizard**:
  - Prompts only on the very first launch to configure game scanning permissions and Google Drive cloud saves.
  - 100% private and local; settings can be reviewed or re-run anytime in Settings.

- **Theme Engine**:
  - Switch between themes (Default, OLED Abyss, Liquid Glass, Cyberpunk, Emerald, Nord) or import custom theme JSON files.

- **Seamless Standalone Runtime**:
  - Native Windows executable that runs cleanly without leaving console or command prompt windows open.

---

## 🚀 Download & Installation

### Option 1: Setup Wizard (Recommended for Users)
Run **`Eagle-Launcher-Setup.exe`**:
- Automatically installs Eagle Launcher to your PC (`%LOCALAPPDATA%\EagleLauncher`).
- Registers the official **Windows Start Menu shortcut** (searchable by pressing `Win` and typing `Eagle Launcher`).
- Creates a **Desktop shortcut** and launches into your library.

### Option 2: Portable Executable
Run `Eagle Launcher.exe` directly from the folder:
```powershell
.\Eagle Launcher.exe
```
No installation or extra dependencies required.

### Option 3: One-Click Installer Script
Double-click **`Install-Eagle-Launcher.bat`** to install shortcuts and start the launcher.

---

## 🛠️ Building From Source

### Prerequisites
1. [Node.js](https://nodejs.org/) (v18+ recommended)
2. [Rust & Cargo](https://rustup.rs/) (Windows MSVC toolchain)

### Steps
```bash
# 1. Install frontend dependencies
npm install

# 2. Build frontend assets
npm run build

# 3. Build release binary with Tauri
cd src-tauri
cargo build --release
```

The compiled standalone executable will be located at:
`src-tauri/target/release/unified-launcher.exe`

---

## 📂 Project Structure

```
├── Eagle Launcher.exe        # Pre-compiled standalone executable
├── src/                     # React + TypeScript frontend
│   ├── components/          # Reusable UI components (cards, layout, modals)
│   ├── store/               # Zustand application stores
│   ├── types/               # TypeScript interface definitions
│   ├── utils/               # Metadata and box art resolvers
│   ├── views/               # Main views (Library, Pulse, Deals, Settings)
│   ├── App.tsx              # Main application shell
│   └── main.tsx             # Frontend entry point
├── src-tauri/               # Rust backend & native integrations
│   ├── src/                 # Native scanners (Steam, Epic, GOG, Xbox, Standalone)
│   ├── icons/               # Multi-resolution eagle application icons
│   ├── tauri.conf.json      # Tauri application configuration
│   └── Cargo.toml           # Rust package manifest
├── package.json             # NPM package manifest
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite bundler configuration
└── README.md                # Project documentation
```

---

## 📄 License
MIT License. Free and open-source.
