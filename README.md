# Scholarly Insight

## Project Overview
A platform to discover, save, and discuss the latest research from arXiv across multiple scientific disciplines. Users can:
- Search by **title**, **author**, **category**, and **publication date**
- View detailed **paper abstracts** and **download links**
- Manage **favorite** papers and track **reading history**
- Participate in **discussion forums** and receive **notifications**

---

## Getting Started

1. **Clone the repository**  
   ```bash
   git clone https://github.com/dl5214/scholarly-insight.git
   cd scholarly-insight
   ```

2. **Install dependencies**  
   ```bash
   npm install
   ```

3. **Configure environment**  
   - Copy `.env.example` to `.env.local`  
   - Fill in **Firebase** credentials and `NEXT_PUBLIC_BASE_URL`

4. **Run locally**  
   ```bash
   npm run dev
   ```  
   The app will be available at `http://localhost:3000`

---

## Key Features

- **Search & Browse**: Filter papers by title, author, category, and date  
- **Paper Details**: View abstracts, PDF, and HTML links  
- **User Accounts**: Sign up, log in, and manage sessions via Firebase  
- **Favorites & History**: Save favorite papers and track reading history  
- **Discussion Forum**: Comment on papers in dedicated threads  
- **Notifications**: Receive in-app alerts for new papers in subscribed categories  

---

## Tech Stack

- **Frontend**: Next.js (App Router) with React & TypeScript, Tailwind CSS  
- **Backend**: Next.js API routes, Firebase Authentication & Firestore, Cloud Functions (Express)  
- **Data Fetching**: SWR, fast-xml-parser  

---

## Deployment

1. **Build**  
   ```bash
   npm run build
   ```

2. **Deploy**  
   - **Staging**: `npm run deploy:staging`  
   - **Production**: `npm run deploy`

---

## Ports & Emulators

- **App**: `3000`  
- **Firebase Emulators** (optional):  
  - Auth: `9099`  
  - Firestore: `8080`  
  - Functions: `5001`  
  - Hosting: `5002`

