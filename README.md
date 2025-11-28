# Lost Haven Association Platform 🎮🎨💻

**Coders • Artists • Gamers**

This is the frontend client for the **Lost Haven Association (LHA)**. It is a gamified community platform designed with a cyberpunk/manga-inspired aesthetic, featuring a guild system, project management, and event tracking.

## 🚀 Quick Start

1.  **Clone the Repository.**
2.  **Verify Structure:** Ensure your file tree matches the `src/` paths defined in the HTML files (see `DEVELOPER_GUIDE.md`).
3.  **Run Locally:**
    *   This project uses absolute paths (e.g., `/src/...`).
    *   **You cannot simply double-click the HTML files.**
    *   You must use a local server.
    *   **VS Code:** Right-click `index.html` -> "Open with Live Server".
    *   **Python:** Run `python -m http.server` in the root folder.

## 🛠 Tech Stack

*   **Core:** HTML5, Vanilla JavaScript.
*   **Styling:** Tailwind CSS (Loaded via CDN).
*   **Icons:** FontAwesome v6.5.1.
*   **Backend:** Connects to `https://backendkostudy.onrender.com`.
*   **Fonts:** Space Grotesk (Headers), Outfit (Body), JetBrains Mono (Data).

## 🔑 Key Features

*   **RPG Profile:** Users have Levels, XP, and Stats (INT/DEX/CHA) fetched from the backend.
*   **Quest Log:** Project management interface.
*   **The Guild:** Specialized roster pages for Developers, Gamers, and Artists.
*   **Secret Tools:** Includes a hidden pixel-art canvas and admin gatekeeper.

# 👨‍💻 LHA Developer Guide

## 🛑 Current Status & "What to Fix"

The project is currently a **High-Fidelity Prototype** connected to a live backend. Below are the specific areas that need attention.

### 1. File Path Consistency
*   **Issue:** The JavaScript files use absolute paths (e.g., `window.location.href = '/src/screens/auth/signin.html'`).
*   **Fix:** Ensure the folder structure in your local environment matches the `src/` hierarchy exactly. If you move a file, you **must** update the `href` links in the HTML and the `window.location` redirects in the JS files.

### 2. Tailwind CSS Performance
*   **Current:** We are using the Tailwind CDN `<script src="https://cdn.tailwindcss.com"></script>`.
*   **Issue:** This causes a slight "blink" on load (FOUC) and is not optimized for production.
*   **To-Do:** 
    1. Install Tailwind via npm (`npm install -D tailwindcss`).
    2. Set up a `tailwind.config.js` file.
    3. Process the CSS into a static `output.css` file.

### 3. Authentication & Security
*   **Current:** The app uses JWT tokens stored in `localStorage` (`accessToken`).
*   **Security.html:** The "Gatekeeper" page currently uses hardcoded passwords (`OTAKU`, `ADMIN_01`) inside the HTML script.
*   **Action:** 
    *   **Immediate:** Remove hardcoded passwords from `security.html`. Connect the manual override input to a backend endpoint.
    *   **Session:** The `loader.js` handles session boot-up animations. Ensure it doesn't run on every single page refresh (logic is currently in `sessionStorage`).

### 4. Missing Pages
*   **Artists Page:** The code for `src/screens/guild/artists.html` is missing from the current codebase.
    *   *Task:* Duplicate `gamers.html` or `devs.html` and adapt it for the Artists guild (change colors to `#ff2a6d` / Pink).

---

## 📂 Logic Guide (How the JS works)

### `src/js/main/loader.js`
*   **What it does:** Injects a "System Boot" animation overlay into the DOM.
*   **Behavior:** Checks `sessionStorage`. If the user hasn't seen the boot sequence this session, it runs.

### `src/js/main/auth.js`
*   **What it does:** Handles Login and Register forms.
*   **Key Logic:** 
    *   Sends POST requests to `backendkostudy.onrender.com`.
    *   On success, saves `accessToken` and `userId` to LocalStorage.
    *   Redirects user to `/index.html`.

### `src/js/connections/account.js`
*   **What it does:** Powers the `account.html` (Character Sheet).
*   **Key Logic:** 
    *   Fetches profile data using the `userId`.
    *   Updates the XP bars and Attribute bars (INT, DEX, CHA) based on JSON data.
    *   Handles Avatar uploading (Multipart/form-data).

### `src/js/main/alert.js`
*   **What it does:** A custom replacement for the browser's `alert()` and `confirm()`.
*   **Usage:** `openAlertModal({ title: '...', message: '...', onConfirm: () => { ... } })`
*   **Note:** Requires `src/components/alert.html` to be loaded into the DOM.

---

## 🤝 Collaborator Tasks

1.  **Frontend (UI/UX):**
    *   Create `src/screens/guild/artists.html`.
    *   Fix mobile responsiveness on the "My Projects" table (it gets squished on small screens).
    *   Ensure the `loader.js` animation z-index is higher than everything else.

2.  **Backend Integration:**
    *   The `fetch-projects.js` file expects the backend to return an array of projects. Verify the JSON structure matches: `{ title: "", description: "", status: "", category: "" }`.
    *   The `summit.js` (Events) expects `/api/events/latest`. Ensure this endpoint exists and returns a valid date string for the countdown.

3.  **Refactoring:**
    *   Extract the Navbar and Footer HTML into a reusable component (using a simple JS loader or a framework) so we don't have to copy-paste it into every HTML file.

---
*Created for Lost Haven Association.*