
const express = require("express");
const path = require("path");
const db = require("./db");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Get all patients
app.get("/api/patients", async (req, res) => {
  try {
    const [patients] = await db.query(
      "SELECT * FROM patients ORDER BY patient_id DESC"
    );
    res.json(patients);
  } catch (error) {
    console.error("Failed to load patients:", error);
    res.status(500).json({ error: "Failed to load patients" });
  }
});

// Get one patient
app.get("/api/patients/:id", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM patients WHERE patient_id = ?",
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Patient not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Failed to find patient:", error);
    res.status(500).json({ error: "Failed to find patient" });
  }
});

// Add patient
app.post("/api/patients", async (req, res) => {
  try {
    const {
      patient_id,
      patient_name,
      patient_email,
      patient_phoneno,
      patient_gender,
      patient_age,
      patient_problem
    } = req.body;

    if (!patient_id || !patient_name || !patient_email ||
        !patient_phoneno || !patient_gender ||
        patient_age === "" || patient_age == null ||
        !patient_problem) {
      return res.status(400).json({
        error: "Please fill in all patient details"
      });
    }

    const normalizedId = Number(patient_id);

    if (!Number.isInteger(normalizedId) || normalizedId <= 0) {
      return res.status(400).json({
        error: "Patient ID must be a valid positive number"
      });
    }

    const [existingPatients] = await db.query(
      "SELECT patient_id FROM patients WHERE patient_id = ?",
      [normalizedId]
    );

    if (existingPatients.length > 0) {
      return res.status(409).json({ error: "Patient ID already exists" });
    }

    const [result] = await db.query(
      `INSERT INTO patients
      (patient_id, patient_name, patient_email, patient_phoneno,
       patient_gender, patient_age, patient_problem)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        normalizedId,
        patient_name,
        patient_email,
        patient_phoneno,
        patient_gender,
        patient_age,
        patient_problem
      ]
    );

    res.status(201).json({
      message: "Patient registered successfully",
      patient_id: result.insertId || normalizedId
    });
  } catch (error) {
    console.error("Failed to register patient:", error);
    if (error && error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Patient ID already exists" });
    }
    res.status(500).json({ error: "Failed to register patient" });
  }
});

// Update patient
app.put("/api/patients/:id", async (req, res) => {
  try {
    const {
      patient_name,
      patient_email,
      patient_phoneno,
      patient_gender,
      patient_age,
      patient_problem
    } = req.body;

    if (!patient_name || !patient_email ||
        !patient_phoneno || !patient_gender ||
        patient_age === "" || patient_age == null ||
        !patient_problem) {
      return res.status(400).json({
        error: "Please fill in all patient details"
      });
    }

    const [result] = await db.query(
      `UPDATE patients SET
       patient_name = ?,
       patient_email = ?,
       patient_phoneno = ?,
       patient_gender = ?,
       patient_age = ?,
       patient_problem = ?
       WHERE patient_id = ?`,
      [
        patient_name,
        patient_email,
        patient_phoneno,
        patient_gender,
        patient_age,
        patient_problem,
        req.params.id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Patient not found" });
    }

    res.json({ message: "Patient updated successfully" });
  } catch (error) {
    console.error("Failed to update patient:", error);
    res.status(500).json({ error: "Failed to update patient" });
  }
});

// Delete patient
app.delete("/api/patients/:id", async (req, res) => {
  try {
    const [result] = await db.query(
      "DELETE FROM patients WHERE patient_id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Patient not found" });
    }

    res.json({ message: "Patient deleted successfully" });
  } catch (error) {
    console.error("Failed to delete patient:", error);
    res.status(500).json({ error: "Failed to delete patient" });
  }
});

app.listen(3000, () => {
  console.log("SHAHIN HOSPITAL: http://localhost:3000");
});
