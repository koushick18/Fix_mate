# FixMate: Property Maintenance System
## Project Documentation

**Date:** November 2024  
**Developer:** [Your Name]  
**Version:** 1.0.0

---

## 1. Executive Summary

**FixMate** is a web-based property maintenance management system designed to streamline communication between Residents, Technicians, and Administrators. It replaces outdated paper forms and email chains with a centralized, real-time dashboard.

Key capabilities include:
*   **Role-Based Workflows:** Distinct interfaces for submitting requests, managing tasks, and overseeing operations.
*   **Real-Time Data:** Powered by Supabase to ensure all users see the latest status updates immediately.
*   **AI Intelligence:** Integrated Google Gemini API to analyze maintenance backlog and suggest priority actions.

---

## 2. System Architecture

The application is built using a modern **Client-Server-Database** architecture.

### 2.1 Technology Stack
*   **Frontend:** React (v18) with TypeScript.
*   **Build Tool:** Vite (for fast HMR and optimized production builds).
*   **Styling:** Tailwind CSS (utility-first styling).
*   **Backend/Database:** Supabase (PostgreSQL).
*   **Authentication:** Supabase Auth (Email/Password).
*   **AI Service:** Google Gemini (Generative AI for text summaries).
*   **Hosting:** Vercel (Frontend Global CDN).

### 2.2 Data Flow
1.  **User Interaction:** A user (e.g., Resident) submits a form in the React UI.
2.  **API Call:** The `services/db.ts` layer utilizes the Supabase JS Client to send an asynchronous request.
3.  **Database Storage:** Data is stored in the `public.issues` table in PostgreSQL.
4.  **State Update:** The UI fetches the latest data and updates the dashboard view.

---

## 3. Database Schema

The system uses a relational database model with three primary tables.

### Table: `profiles`
Stores user information and roles.
*   `id` (UUID, Primary Key): Links to Supabase Auth User.
*   `email` (Text): User email.
*   `role` (Text): 'RESIDENT', 'TECHNICIAN', or 'ADMIN'.
*   `name` (Text): Display name.

### Table: `issues`
Stores maintenance requests.
*   `id` (UUID, Primary Key).
*   `category` (Text): Plumbing, Electrical, etc.
*   `status` (Text): OPEN, ASSIGNED, IN_PROGRESS, RESOLVED.
*   `priority` (Text): LOW, MEDIUM, HIGH.
*   `resident_id` (UUID, FK): Who reported it.
*   `assigned_to` (UUID, FK): Technician responsible.

### Table: `messages`
Stores chat history.
*   `sender_id` (UUID).
*   `receiver_id` (UUID).
*   `text` (Text).

---

## 4. User Manual

### 4.1 For Residents
1.  **Log in** or Sign up as a "Resident".
2.  **New Request:** Go to the "New Request" tab. Select a category (e.g., Plumbing), urgency, and describe the problem. Click Submit.
3.  **Track:** View the "My Requests" tab to see if a Technician has been assigned.
4.  **Chat:** Use "Contact Admin" to ask questions.

### 4.2 For Technicians
1.  **Log in** or Sign up as a "Technician".
2.  **Dashboard:** View "My Assignments". High priority items appear at the top.
3.  **Action:** Click "Start Work" to change status to In Progress.
4.  **Resolve:** When finished, click "Resolve", enter what you fixed, and save.

### 4.3 For Admins
1.  **Dashboard:** View the colored charts to see the health of the facility.
2.  **AI Report:** Click "Generate Report" to let Google Gemini summarize the workload.
3.  **Assign:** Go to the "Issues" tab. Use the dropdown next to an issue to assign it to a specific Technician.
4.  **Search:** Use the search bar to find specific tickets.

---

## 5. Deployment Guide

### 5.1 Prerequisites
*   Node.js installed locally.
*   Supabase Account (Free tier).
*   Google Cloud Account (for Gemini API Key).

### 5.2 Environment Variables
The application requires the following keys to function:
*   `VITE_SUPABASE_URL`: Your Supabase Project URL.
*   `VITE_SUPABASE_ANON_KEY`: Your Supabase Public Key.
*   `VITE_API_KEY`: Google Gemini API Key.

### 5.3 Hosting
The project is optimized for deployment on **Vercel** or **Netlify**. Ensure the environment variables are configured in the hosting provider's dashboard before deploying.

---

## 6. Future Enhancements

*   **Email Notifications:** Integrate SendGrid/Resend to alert Technicians via email when assigned.
*   **Image Uploads:** Use Supabase Storage to allow Residents to upload real photos of damages instead of using stock images.
*   **Mobile App:** Convert the React codebase to React Native for a dedicated mobile experience.
