# PROACTIVE DASHBOARD — SETUP & DEPLOYMENT GUIDE

> **Important Architecture Notice**:  
> ProActive Dashboard is a lightweight, high-performance analytical platform powered by **Vite**, **React**, and **TypeScript**.  
> - **NO Docker, NO Nginx, and NO external database servers (PostgreSQL/PostGIS) are required.**  
> - **NO live interactive map services (no Leaflet, Mapbox, or external OSM tile servers) are used.**  
> - The dashboard features a **static spatial conflict heatmap image** (`Conflict_Heatmaps.jpg.jpeg`) displayed alongside the video player, and local in-browser trajectory processing.  
> - All application source code, UI components, static public assets, and build configurations are organized cleanly inside the dedicated **`frontend/`** directory.

---

## 1. System Prerequisites

Before starting, ensure the following software is installed on your system:

| Prerequisite | Recommended Version | Verification Command |
| :--- | :--- | :--- |
| **Node.js** | `v18.x` or `v20.x` LTS (or higher) | `node -v` |
| **npm** | `v9.x` or `v10.x` (or higher) | `npm -v` |
| **Git** | Latest standard release | `git --version` |
| **Web Browser** | Google Chrome, Microsoft Edge, or Mozilla Firefox | Modern Chromium / Firefox |

---

## 2. Clone the Repository

Open your terminal or command prompt, navigate to your desired workspace folder, and clone the codebase:

```bash
git clone https://github.com/Bhaveshsuthar28/SVNIT-ProActive-DashBoard.git
cd SVNIT-ProActive-DashBoard
```

---

## 3. Install Project Dependencies

Navigate into the `frontend/` directory and install all required packages:

```bash
cd frontend
npm install
```

---

## 4. Setup External Assets (Not Tracked on GitHub)

Due to file size limits and confidentiality, large video files and proprietary trajectory datasets are excluded from GitHub via `.gitignore`. You must obtain the shared data package from the project team and place the files into their respective directories with the **exact file names** listed below.

### 4.1 Asset Placement Table

| # | Asset Description | Exact Required File Name | Target Destination Folder | Purpose / Function |
| :-: | :--- | :--- | :--- | :--- |
| **1** | **Annotated Video** | `NFD_Junction_annotated_5min.mp4` | `./frontend/public/` | Video player playback & frame inspector snapshots |
| **2** | **Trajectory Dataset** | `Smoothed_trajectories_5min.csv` | `./frontend/public/` | CSV streaming middleware |
| **3** | **Trajectory Dataset (Data)** | `trajectories.csv` | `./frontend/public/` **AND** `./frontend/public/data/` | In-browser trajectory parser & analytics engine |
| **4** | **Static Conflict Heatmap** | `Conflict_Heatmaps.jpg.jpeg` | `./frontend/public/` | Spatial conflict reference image displayed on Dashboard |
| **5** | **Dashboard Favicon / Icon** | `icon.png` | `./frontend/public/` | Browser tab favicon & brand identity |

---

### 4.2 Step-by-Step Asset Placement

#### Step A: Place Video File
Paste `NFD_Junction_annotated_5min.mp4` into:
- `./frontend/public/NFD_Junction_annotated_5min.mp4`

#### Step B: Place Trajectory CSV Files
1. Paste `Smoothed_trajectories_5min.csv` into: `./frontend/public/Smoothed_trajectories_5min.csv`
2. Copy or rename a copy to `trajectories.csv` and place it into both:
   - `./frontend/public/trajectories.csv`
   - `./frontend/public/data/trajectories.csv`

#### Step C: Place Static Conflict Heatmap Image & Icon
*(Note: There is no live tile map service; the dashboard displays this static spatial conflict heatmap image directly.)*
1. Paste `Conflict_Heatmaps.jpg.jpeg` into: `./frontend/public/Conflict_Heatmaps.jpg.jpeg`
2. Paste `icon.png` into: `./frontend/public/icon.png`

---

## 5. Expected Directory Layout

Verify that your project structure matches the layout below before launching:

```text
SVNIT-ProActive-DashBoard/
├── .gitignore
│
└── frontend/                            <-- All Application Code & Assets
    ├── .env
    ├── .env.example
    ├── .gitignore
    ├── index.html
    ├── package.json
    ├── postcss.config.js
    ├── setup_intruction.md              <-- This setup guide
    ├── tailwind.config.js
    ├── tsconfig.json
    ├── tsconfig.node.json
    ├── vite.config.ts
    ├── scripts/
    │   └── transcode_to_h264.py         <-- Offline video optimization utility
    │
    ├── public/
    │   ├── Conflict_Heatmaps.jpg.jpeg   <-- [EXTERNAL] Static conflict heatmap image
    │   ├── icon.png                     <-- [EXTERNAL] Favicon & branding
    │   ├── NFD_Junction_annotated_5min.mp4 <-- [EXTERNAL] Video file
    │   ├── Smoothed_trajectories_5min.csv  <-- [EXTERNAL] Trajectory CSV
    │   ├── trajectories.csv             <-- [EXTERNAL] Public dataset
    │   └── data/
    │       └── trajectories.csv         <-- [EXTERNAL] Primary trajectory path
    │
    └── src/
        ├── components/                  <-- UI components (Video, KPI, Explorer, Heatmap, Analytics)
        ├── hooks/                       <-- Custom React hooks
        ├── services/                    <-- Trajectory parsing & projection services
        ├── stores/                      <-- Zustand stores (timeline, trajectory, filter, analytics)
        ├── styles/                      <-- Global Tailwind CSS styles
        └── types/                       <-- TypeScript schema definitions
```

---

## 6. Launching the Application

### 6.1 Development Mode (Hot Reload)

Navigate into `frontend/` and start the dev server:

```bash
cd frontend
npm run dev
```

Once started, open your browser and navigate to:
```
http://localhost:5173
```
*(If port 5173 is occupied, Vite will automatically select `http://localhost:5174`)*

### 6.2 Production Build & Verification

To compile a production-ready build:

```bash
cd frontend
npm run build
npm run preview
```

---

## 7. How to Maintain & Update

### 7.1 Pulling Latest Code from GitHub
When updates are committed to the repository, pull the latest code:
```bash
git pull origin main
cd frontend
npm install
npm run build
```

### 7.2 Updating Video or Trajectory Data
If a new video or updated trajectory CSV is provided:
1. **For new video**: Replace `NFD_Junction_annotated_5min.mp4` in `./frontend/public/` with the new MP4 file using the exact same filename.
2. **For new trajectory CSV**: Replace `Smoothed_trajectories_5min.csv` in `./frontend/public/` and `./frontend/public/data/trajectories.csv` with the updated CSV using the exact same filename.
3. Refresh your browser; Vite will stream and parse the updated dataset automatically.

### 7.3 Exposing Over Local Network (Presentations)
To expose the dashboard across your local Wi-Fi/LAN (e.g. for presentations or multi-device testing):
```bash
cd frontend
npm run dev -- --host
```
The terminal will display your Network IP address (e.g., `http://192.168.1.X:5173/`) accessible from other devices on the same local network.

---

## 8. Troubleshooting FAQ

| Problem | Cause | Solution |
| :--- | :--- | :--- |
| **"Unable to load video"** | Video file missing or incorrectly named. | Ensure `NFD_Junction_annotated_5min.mp4` exists in `./frontend/public/` directory. Check spelling carefully. |
| **"No matching records / Failed to parse dataset"** | Trajectory CSV missing from `public/data/`. | Ensure `trajectories.csv` is present in `./frontend/public/data/trajectories.csv` and `./frontend/public/trajectories.csv`. |
| **"Heatmap image not configured"** | Heatmap image missing. | Place `Conflict_Heatmaps.jpg.jpeg` inside `./frontend/public/`. |
| **Port 5173 already in use** | Another dev server is running. | Close background Node processes or let Vite bind automatically to `http://localhost:5174`. |
| **Node module errors after `git pull`** | New packages added by team. | Run `cd frontend && npm install` followed by `npm run build`. |
