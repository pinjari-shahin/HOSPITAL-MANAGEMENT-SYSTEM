# Shahin Hospital — Patient Management System

This project follows your uploaded myschool project structure: **separate HTML pages** for Home, Insert, List, Find One, Update and Delete, plus a Node.js/Express server and MySQL database.

## Setup
1. Open `database.sql` in MySQL Workbench and run the script (lightning icon). It creates database `patient_management` and table `patients`; it also migrates the older `patient-id` column name to `patient_id` and aligns field lengths. Run the script again on an existing installation to apply the migration.
2. Open this project folder in VS Code.
3. In the VS Code terminal run `npm install`.
4. Copy `.env.example` to `.env` and set `DB_PASSWORD` to your own MySQL password.
5. Run `npm start`.
6. Visit `http://localhost:3000` (do not open HTML files directly from File Explorer).

## Pages
- `public/index.html` — Home/dashboard
- `public/insert.html` — Add patient
- `public/list.html` — All patients, search, edit/delete
- `public/listOne.html` — Find one patient by ID
- `public/update.html` — Update patient
- `public/delete.html` — Delete patient
- `public/hospital.css` — Custom responsive hospital design
- `public/hospital.js` — Frontend logic
- `server.js` — Express + MySQL API
- `database.sql` — Database schema

This is a learning/demo project, not a production system for real patient medical information. Real deployments need login, access controls, HTTPS, audit logs and data privacy safeguards.
