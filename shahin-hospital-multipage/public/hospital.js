
const $ = selector => document.querySelector(selector);

const fields = [
  "patient_id",
  "patient_name",
  "patient_email",
  "patient_phoneno",
  "patient_gender",
  "patient_age",
  "patient_problem"
];

function notify(message) {
  const box = $("#message");
  if (box) {
    box.textContent = message;
    box.style.display = "block";
  }
}

async function api(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.error || "Something went wrong");
    error.status = response.status;
    throw error;
  }

  return data;
}

function send(method, url, data) {
  return api(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
}

function getFormData(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function showError(error) {
  notify(error.message);
}

async function checkDuplicatePatientId(patientId) {
  try {
    const patient = await api("/api/patients/" + patientId);
    return !!patient && !!patient.patient_id;
  } catch (error) {
    if (error.status === 404) {
      return false;
    }
    throw error;
  }
}

// Dashboard statistics
if ($("#total")) {
  api("/api/patients")
    .then(patients => {
      $("#total").textContent = patients.length;

      $("#male").textContent = patients.filter(
        p => p.patient_gender === "Male"
      ).length;

      $("#female").textContent = patients.filter(
        p => p.patient_gender === "Female"
      ).length;
    })
    .catch(showError);
}

// Patient registration and update
const patientForm = $("#patientForm");
let editId = null;

if (patientForm) {
  const mode = patientForm.dataset.mode;

  patientForm.addEventListener("submit", async event => {
    event.preventDefault();

    try {
      if (mode === "insert") {
        const formData = getFormData(patientForm);
        const patientId = String(formData.patient_id).trim();

        if (!patientId) {
          notify("Please enter a patient ID");
          return;
        }

        const exists = await checkDuplicatePatientId(patientId);
        if (exists) {
          notify("Patient ID already exists. Please use a different ID.");
          return;
        }

        const result = await send(
          "POST",
          "/api/patients",
          formData
        );

        notify(
          "Patient registered successfully! Patient ID: " +
          result.patient_id
        );

        patientForm.reset();
      } else {
        if (!editId) {
          notify("Please load a patient first");
          return;
        }

        await send(
          "PUT",
          "/api/patients/" + editId,
          getFormData(patientForm)
        );

        notify("Patient updated successfully!");
      }
    } catch (error) {
      showError(error);
    }
  });
}

// Load patient for editing
const loadForm = $("#loadForm");

if (loadForm) {
  loadForm.addEventListener("submit", async event => {
    event.preventDefault();

    try {
      const id = loadForm.elements.id.value;
      const patient = await api("/api/patients/" + id);

      editId = patient.patient_id;

      fields.forEach(field => {
        patientForm.elements[field].value = patient[field];
      });

      $("#editArea").hidden = false;
      notify("Patient details loaded successfully");
    } catch (error) {
      $("#editArea").hidden = true;
      editId = null;
      showError(error);
    }
  });

  const id = new URLSearchParams(location.search).get("id");

  if (id && /^\d+$/.test(id)) {
    loadForm.elements.id.value = id;
    loadForm.requestSubmit();
  }
}

// Search patient by ID
const findForm = $("#findForm");

if (findForm) {
  findForm.addEventListener("submit", async event => {
    event.preventDefault();

    const result = $("#result");
    result.replaceChildren();

    try {
      const id = findForm.elements.patient_id.value;
      const patient = await api("/api/patients/" + id);

      const table = document.createElement("table");

      fields.forEach(field => {
        const row = document.createElement("tr");
        const label = document.createElement("th");
        const value = document.createElement("td");

        label.textContent = field.replaceAll("_", " ");
        value.textContent = patient[field];

        row.append(label, value);
        table.append(row);
      });

      result.append(table);
    } catch (error) {
      showError(error);
    }
  });
}

// Delete patient by ID
const deleteForm = $("#deleteForm");

if (deleteForm) {
  deleteForm.addEventListener("submit", async event => {
    event.preventDefault();

    const id = deleteForm.elements.id.value;

    if (!confirm("Are you sure you want to delete patient " + id + "?")) {
      return;
    }

    try {
      await api("/api/patients/" + id, {
        method: "DELETE"
      });

      notify("Patient deleted successfully!");
      deleteForm.reset();
    } catch (error) {
      showError(error);
    }
  });
}

// Display all patient records
const rows = $("#rows");

if (rows) {
  let patients = [];

  function renderPatients() {
    const search = $("#search").value.toLowerCase().trim();

    const filtered = patients.filter(patient =>
      String(patient.patient_id).includes(search) ||
      patient.patient_name.toLowerCase().includes(search)
    );

    rows.replaceChildren();

    $("#count").textContent = filtered.length;

    $("#empty").style.display =
      filtered.length ? "none" : "block";

    filtered.forEach(patient => {
      const row = document.createElement("tr");

      fields.forEach(field => {
        const cell = document.createElement("td");
        cell.textContent = patient[field];
        row.append(cell);
      });

      const actions = document.createElement("td");

      const edit = document.createElement("a");
      edit.textContent = "Edit";
      edit.className = "action";
      edit.href = "update.html?id=" + patient.patient_id;

      const remove = document.createElement("button");
      remove.textContent = "Delete";
      remove.className = "action remove";

      remove.addEventListener("click", async () => {
        if (!confirm("Delete patient " + patient.patient_id + "?")) {
          return;
        }

        try {
          await api("/api/patients/" + patient.patient_id, {
            method: "DELETE"
          });

          patients = patients.filter(
            p => p.patient_id !== patient.patient_id
          );

          renderPatients();
          notify("Patient deleted successfully");
        } catch (error) {
          showError(error);
        }
      });

      actions.append(edit, remove);
      row.append(actions);
      rows.append(row);
    });
  }

  $("#search").addEventListener("input", renderPatients);

  api("/api/patients")
    .then(data => {
      patients = data;
      renderPatients();
    })
    .catch(showError);
}
