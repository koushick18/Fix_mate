# FixMate - Property Maintenance System

FixMate is a comprehensive React-based web application designed to streamline property maintenance requests. It facilitates communication between Residents, Technicians, and Administrators.

## 🚀 Features

- **Role-Based Access Control**: Resident, Technician, Admin.
- **Real-Time Status Tracking**: Visual status workflow.
- **Messaging System**: Built-in chat functionality.
- **Gemini AI Integration**: Generates executive summaries of maintenance workloads.
- **Responsive Design**: Mobile-friendly UI.

## 💾 Architecture & Database

**Current Status: Serverless / LocalStorage**

This demo uses a **Mock Database** (`services/mockDb.ts`) that persists data to your browser's `LocalStorage`.
*   **Public Demo Limitation**: Since data is stored in the browser, users on different devices **cannot** see each other's data.

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS (Vite)
- **AI**: Google Gemini API (@google/genai)
- **Visuals**: Lucide React, Recharts

## 🏃‍♂️ How to Run Locally

1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Start Dev Server**:
    ```bash
    npm run dev
    ```
3.  **Open App**: Visit `http://localhost:5173`

## ☁️ How to Deploy (Netlify/Vercel)

You can host this for free in minutes.

### **Option 1: Netlify (Recommended)**

1.  **Push to GitHub**: Upload this project to a GitHub repository.
2.  **Log in to Netlify**: Go to [netlify.com](https://netlify.com) and log in.
3.  **New Site**: Click **"Add new site"** > **"Import an existing project"**.
4.  **Connect GitHub**: Select your FixMate repository.
5.  **Build Settings** (Netlify usually detects these automatically):
    *   **Build command**: `npm run build`
    *   **Publish directory**: `dist`
6.  **Environment Variables**:
    *   Click **"Add environment variable"**.
    *   Key: `VITE_API_KEY`
    *   Value: `YOUR_GOOGLE_GEMINI_API_KEY` (Get one at [aistudio.google.com](https://aistudiocdn.com))
7.  **Deploy**: Click **"Deploy site"**.

### **Option 2: Vercel**

1.  **Push to GitHub**.
2.  **Log in to Vercel**: Go to [vercel.com](https://vercel.com).
3.  **Add New**: Click **"Add New..."** > **"Project"**.
4.  **Import**: Select your repository.
5.  **Environment Variables**:
    *   Add `VITE_API_KEY` with your Gemini API key value.
6.  **Deploy**: Click **"Deploy"**.

Your app is now live! 🚀
