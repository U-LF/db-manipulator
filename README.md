# DB Manipulator (SST Admin Impostor)

This is a Node.js-based web interface designed to interact with a Firebase Firestore database. It provides an "Admin Impostor" dashboard to fetch, create, and manage records directly from your browser.

## Prerequisites

- [Node.js](https://nodejs.org/) installed on your machine.
- A Firebase project configured with Firestore.

## Configuration

The project connects to Firebase using the configuration specified in `firebase-config.js`. 
Ensure your Firebase configuration object matches your project settings. Currently, it is set up to connect to the `ticket-sst` project. If you need to point it to a different Firebase project, update the `firebaseConfig` object in this file.

## Installation

1. Navigate to the project directory:
   ```bash
   cd db-manipulator
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

## Running the Project

1. Start the server using the provided npm script:
   ```bash
   npm start
   ```
   *(Alternatively, you can run `node db-interactor.mjs` directly.)*

2. Open your web browser and navigate to:
   [http://localhost:3000](http://localhost:3000)

## Features

- **Web Interface:** A sleek, glassmorphism-styled dashboard tailored for database interaction.
- **Data Fetching & Viewing:** Fetch and view records from any Firestore collection directly in the browser.
- **Record Management:** Create new documents or edit existing ones on the fly. The UI dynamically infers the schema and builds editable forms, applying default values (e.g., "Full experience" for tickets).
- **Interactive Image Cropping:** Upload or select images for records and use the built-in crop tool to precisely adjust photos before uploading them to the database.
- **Statistical Dashboard:**
  - Real-time summaries of Pending, Approved, and Rejected records.
  - Financial breakdowns computing Confirmed and Unconfirmed payment totals (PKR) and demographic attendee data.
  - A responsive, horizontally scrollable Bar Chart visualizing daily registrations mapped up through July 20th.
  - Dynamic calculation of top departments based purely on approved registrations.
- **PDF Export Engine:** Generate robust, landscape-oriented PDF reports directly in the client. Filter exports by status (All, Approved, Pending, Rejected). The engine smartly intercepts and embeds image data URIs directly into the PDF table and expands complex nested arrays (like multi-attendee data) into readable bulleted lists.
- **Direct Database Access:** Handles CORS and communicates seamlessly with Firestore using the Firebase JS SDK on the server side, acting as a lightweight backend layer to a highly reactive vanilla frontend.

## Technologies Used

- **Node.js**: Backend server (`http.createServer`) to handle API endpoints and serve the frontend monolith.
- **Firebase Firestore**: Cloud NoSQL database for data storage.
- **Vanilla HTML/CSS/JS**: For the frontend user interface, styled with modern CSS features like Grid auto-fit layouts and glassmorphism.
- **Cropper.js**: For client-side image cropping within the data creation/edit modal.
- **Chart.js**: For interactive data visualization and time-series charting.
- **jsPDF & jspdf-autotable**: For client-side compilation and formatting of PDF documents from database records.
