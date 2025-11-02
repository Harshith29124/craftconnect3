# Project Summary: CraftConnect

## 1. Project Purpose

CraftConnect is a web application designed to help traditional artisans and small craft business owners grow their businesses using AI-powered tools. The primary goal is to provide simple, accessible digital solutions to users who may not have technical expertise. The application analyzes a user's verbal description of their business and provides personalized, actionable recommendations.

---

## 2. Application Architecture

The application is built on a modern JavaScript stack with a clear separation between the frontend and backend.

*   **Frontend**: A dynamic, single-page application (SPA) built with **React** and bundled with **Vite**. It is responsible for the entire user interface and user experience.
*   **Backend**: A robust API server built with **Node.js** and the **Express** framework. It handles all business logic, securely communicates with external Google Cloud APIs, and interacts with a MongoDB database.
*   **Database**: **MongoDB** is used to store the results of the business analyses, creating a record of user interactions and AI-generated insights.

---

## 3. Core User Flow & Functionality

The application guides the user through a four-step process, as detailed in the architecture diagram.

1.  **Step 1: Record (Home Page)**
    *   The user is prompted to record an audio clip of at least 10 seconds, describing their craft business, challenges, and goals.
    *   The frontend captures the audio as a `.webm` file.

2.  **Step 2: Process (API Interaction)**
    *   The audio file is sent from the React frontend to the Node.js backend endpoint `/api/analyze-business`.
    *   The backend uses the **Google Cloud Speech-to-Text API** to convert the audio into a written transcript.
    *   This transcript is then sent to the **Google Cloud Vertex AI API (Gemini 1.5 Flash)** with a specific prompt asking for a structured JSON analysis.
    *   The AI returns a JSON object containing the `businessType`, `detectedFocus`, `topProblems`, and `recommendedSolutions`.

3.  **Step 3: Insights (Results Page)**
    *   The backend sends the structured JSON analysis back to the frontend.
    *   The React frontend dynamically displays the **Insights Page**, showing the user what the AI understood about their business and presenting the primary and secondary solutions (e.g., WhatsApp, Instagram, Website).

4.  **Step 4: Setup (Action Page)**
    *   When the user selects a solution (e.g., WhatsApp), they are navigated to a dedicated page.
    *   On the **WhatsApp Page**, the user can click a button to trigger another API call to `/api/generate-whatsapp-message`.
    *   The backend again calls **Vertex AI**, providing the full business context, and asks it to generate a professional marketing message.
    *   This message is displayed to the user, who can then use it for their business.

---

## 4. What the Code is Supposed to Do

The application should function as a seamless, end-to-end tool for business analysis and content generation.

*   **It should correctly capture audio** from the user's microphone.
*   **It must successfully communicate with the backend**, sending the audio and receiving the analysis without errors.
*   **The backend must properly authenticate and interact with Google Cloud APIs** to perform speech-to-text and generative AI tasks.
*   **The frontend should dynamically render the results** from the API, presenting the business insights and recommended solutions clearly.
*   **The final "Setup" stage should generate a context-aware, high-quality WhatsApp message** based on the initial analysis.
*   The entire user flow should be intuitive, guiding the user from one step to the next, with clear feedback and error handling if something goes wrong (e.g., microphone access denied, server error).

### Deployment Environment
*   **Platform:** Google Cloud Run (for Backend)
*   **Frontend Platform:** Vercel
*   **Backend Language/Framework:** Node.js/Express

### Debugging Steps Taken
*   **Aggressive Logging:** Added detailed `console.log` statements to `backend/server.js` to trace the application's startup sequence, including MongoDB connection status, the `PORT` environment variable, and the `app.listen` call.
*   **Forced Deployment:** Made minor, non-functional code changes (adding comments) to `backend/server.js` to force new Cloud Run builds and deployments, ensuring the latest code and `node_modules` were installed.

### Tools Used
*   `edit_file_fast_apply`: For making quick and targeted code changes.
*   `view_files`: For inspecting file contents and understanding the codebase.
*   `run_command`: For executing shell commands, such as `npm install`.
*   Cloud Run Logs: For monitoring application startup and identifying errors in the deployed environment.

### Current Status
*   The `project_summary.md` file has been updated to provide a detailed overview for judges.
*   The Cloud Run container startup issue is still under investigation. The next step is to deploy the latest `server.js` with aggressive logging and analyze the new Cloud Run logs to pinpoint the exact cause of the startup failure.