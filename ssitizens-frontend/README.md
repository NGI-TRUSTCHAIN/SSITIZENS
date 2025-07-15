# SSITIZENS

## Description

**SSITIZENS** is a platform for the management of social aid, citizens, and businesses, allowing for the administration of funds, transactions, and privacy policies in a simple and secure way. The system is designed for municipalities, citizens, and businesses, facilitating traceability and transparency in resource management.

## Technologies Used

- **Vite**
- **React**
- **TypeScript**
- **Zustand** (state management)
- **React Query** (remote data management)
- **Tailwind CSS**
- **Axios**
- **i18next** (internationalization)

## Project Structure

```
src/
  components/         # Reusable components (modals, sidebars, tables, etc.)
  config/             # Axios and other service configurations
  constants/          # Global constants
  features/           # Domain-specific hooks and business logic
  hooks/              # Custom hooks
  i18n/               # Translation files
  interfaces/         # TypeScript types and contracts
  pages/              # Main application views
  services/           # API calls and data logic
  store/              # Global state (Zustand)
  utils/              # Utilities and helpers
```

## Installation and Running

1. **Clone the repository:**
   ```sh
   git clone <YOUR_GIT_URL>
   cd ssitizens-frontend
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Set up environment variables:**
   - Create a `.env` file and define the `VITE_API_URL` variable with your backend URL.

4. **Start the development server:**
   ```sh
   npm run dev
   ```

5. **Access the application:**
   - Open [http://localhost:5173](http://localhost:5173) in your browser.

## Main Features

- **Citizen and business management:** Register, deactivate, block, and edit.
- **Admin panel:** View and manage funds, transactions, and users.
- **Transaction history:** Query and filter movements.
- **Funds/gas recharge and request:** For citizens and businesses.
- **Privacy policy:** Mandatory acceptance to operate.
- **Internationalization:** Spanish and English.
- **Notifications and toasts:** Visual feedback for user actions.

## Useful Scripts

- `npm run dev` — Starts the development server.
- `npm run build` — Builds the production bundle.
- `npm run preview` — Previews the production build.

---

---

## 📢 Credits

This project has received funding from the European Union's Horizon 2020 research and innovation programme within the framework of the LEDGER Project funded under grant agreement No825268.

<p align="center">
  <a href="https://www.ngi.eu" target="_blank">
    <img src="./assets/ngi-logo.png" alt="NGI Logo" style="height:80px; margin-right: 40px;"/>
  </a>
  <img src="./assets/eu-flag.png" alt="EU Flag" style="height:80px;"/>
</p>

Please, remember to link the NGI project logo to [www.ngi.eu](https://www.ngi.eu).