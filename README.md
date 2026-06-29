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

- **Web Interface:** A sleek, glassmorphism-styled dashboard for database interaction.
- **Data Fetching:** Fetch existing records from Firestore collections.
- **Data Creation:** Add new documents to your Firestore collections directly from the web interface.
- **Direct Database Access:** Handles CORS and directly communicates with Firestore using the Firebase JS SDK on the server side, while serving a custom UI.

## Technologies Used

- **Node.js**: Backend server (`http.createServer`) to handle API endpoints and serve the HTML.
- **Firebase Firestore**: Cloud NoSQL database for data storage.
- **Vanilla HTML/CSS/JS**: For the frontend user interface, styled with modern CSS features.
