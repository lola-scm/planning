var idEmployeEnEdition = null;
var idEmployeActuel = null;

// ONGLETS
function afficherOnglet(nom) {
  document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.getElementById("panel-" + (nom === "employes" ? "emps" : "recettes")).classList.add("active");
  event.target.classList.add("active");
}

// AFFICHER LES EMPLOYÉS
async function afficherTableauEmployes(filtre) {
  var employes = await lireEmployes();
  if (filtre) {
    var f = filtre.toLowerCase();
    employes = employes.filter(e =>
      e.nom.toLowerCase().includes(f) ||
      e.prenom.toLowerCase().includes(f) ||
      (e.poste || "").toLowerCase().includes(f)
    );
  }
  var tbody = document.getElementById("emp-tbody");
  if (employes.length === 0) {
    tbody.innerHTML = "<tr><td colspan='4'>Aucun employé</td></tr>";
    return;
  }
  var html = "";
  for (var i = 0; i < employes.length; i++) {
    var e = employes[i];
    html += "<tr><td>" + e.nom + "</td><td>" + e.prenom + "</td><td>" + (e.poste || "-") + "</td><td>";
    html += "<button class='btn-sm' onclick=\"ouvrirFormulaireEmploye('" + e.id + "')\">Modifier</button> ";
    html += "<button class='btn-sm' onclick=\"supprimerEmploye('" + e.id + "')\">Supprimer</button> ";
    html += "<button class='btn-sm' onclick=\"voirEmploye('" + e.id + "')\">Voir</button> ";
    html += "<button class='btn-sm btn-primary' onclick=\"ouvrirExportModal('" + e.id + "')\">⬇ CSV</button>";
    html += "</td></tr>";
  }
  tbody.innerHTML = html;
}

// FORMULAIRE EMPLOYÉ
async function ouvrirFormulaireEmploye(empID) {
  idEmployeEnEdition = empID || null;
  var prenom = "", nom = "", poste = "";
  if (empID) {
    var employes = await lireEmployes();
    var emp = employes.find(e => e.id == empID);
    if (emp) { prenom = emp.prenom; nom = emp.nom; poste = emp.poste; }
  }
  document.getElementById("fe-prenom").value = prenom;
  document.getElementById("fe-nom").value = nom;
  document.getElementById("fe-poste").value = poste;
  document.getElementById("emp-overlay").classList.add("open");
}

function fermerFormulaireEmploye() {
  document.getElementById("emp-overlay").classList.remove("open");
  idEmployeEnEdition = null;
}

async function sauvegarderEmploye() {
  var prenom = document.getElementById("fe-prenom").value.trim();
  var nom = document.getElementById("fe-nom").value.trim();
  var poste = document.getElementById("fe-poste").value.trim();
  if (!prenom || !nom) { alert("Prénom et nom requis."); return; }

  var employes = await lireEmployes();
  if (idEmployeEnEdition) {
    for (var i = 0; i < employes.length; i++) {
      if (employes[i].id == idEmployeEnEdition) {
        employes[i].prenom = prenom; employes[i].nom = nom; employes[i].poste = poste;
        break;
      }
    }
  } else {
    employes.push({ id: genererID(), prenom, nom, poste });
  }
  await sauvegarderEmployes(employes);
  fermerFormulaireEmploye();
  afficherTableauEmployes();
}

async function supprimerEmploye(empID) {
  var employes = await lireEmployes();
  await sauvegarderEmployes(employes.filter(e => e.id != empID));
  afficherTableauEmployes();
}

async function voirEmploye(empID) {
  var employes = await lireEmployes();
  var employe = employes.find(e => e.id == empID);
  if (!employe) { alert("Employé introuvable"); return; }

  idEmployeActuel = empID;
  var horaires = (await lireHoraires()).filter(h => h.empID == empID);
  var totalMinutes = horaires.reduce((sum, h) => sum + h.dureeMin, 0);

  document.getElementById("details-content").innerHTML =
    "<p><strong>Employé :</strong> " + employe.prenom + " " + employe.nom + "</p>" +
    "<p><strong>Total heures :</strong> " + (totalMinutes / 60).toFixed(1) + " h</p>";

  document.querySelector(".btn-historique").setAttribute("onclick", "ouvrirHistorique('" + empID + "')");
  document.getElementById("details-overlay").classList.add("open");
}

function fermerDetailsEmploye() {
  document.getElementById("details-overlay").classList.remove("open");
}

async function ouvrirHistorique(empID) {
  if (!empID) return;
  var horaires = (await lireHoraires()).filter(h => h.empID == empID);
  var tbody = document.getElementById("historique-tbody");
  if (horaires.length === 0) {
    tbody.innerHTML = "<tr><td colspan='4'>Aucune entrée</td></tr>";
  } else {
    var html = "";
    for (var i = 0; i < horaires.length; i++) {
      var h = horaires[i];
      html += "<tr><td>" + h.date + "</td><td>" + h.debut + "</td><td>" + h.fin + "</td><td>" + (h.dureeMin/60).toFixed(1) + "</td></tr>";
    }
    tbody.innerHTML = html;
  }
  document.getElementById("historique-overlay").style.display = "flex";
}

function fermerHistorique() {
  document.getElementById("historique-overlay").style.display = "none";
}

// EXPORT CSV
function ouvrirExportModal(empID) {
  idEmployeActuel = empID;
  document.getElementById("export-overlay").classList.add("open");
  var now = new Date();
  document.getElementById("export-mois").value = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");
}

function exporterCSV() { ouvrirExportModal(idEmployeActuel); }
function fermerExportModal() { document.getElementById("export-overlay").classList.remove("open"); }

async function genererCSV() {
  var mois = document.getElementById("export-mois").value;
  if (!mois) { alert("Sélectionne un mois."); return; }

  var employes = await lireEmployes();
  var employe = employes.find(e => e.id == idEmployeActuel);
  if (!employe) { alert("Employé introuvable."); return; }

  var horaires = (await lireHoraires())
    .filter(h => h.empID == idEmployeActuel && h.date.startsWith(mois))
    .sort((a, b) => a.date.localeCompare(b.date));

  var totalMin = horaires.reduce((s, h) => s + h.dureeMin, 0);
  var sep = ";";
  var lignes = [
    "Employé" + sep + employe.prenom + " " + employe.nom,
    "Poste" + sep + (employe.poste || "-"),
    "Mois" + sep + mois,
    "",
    "Date" + sep + "Début" + sep + "Fin" + sep + "Durée (h)"
  ];
  for (var i = 0; i < horaires.length; i++) {
    var h = horaires[i];
    lignes.push(h.date + sep + h.debut + sep + h.fin + sep + (h.dureeMin/60).toFixed(2).replace(".", ","));
  }
  lignes.push("");
  lignes.push("TOTAL HEURES" + sep + (totalMin/60).toFixed(2).replace(".", ","));

  var blob = new Blob(["\uFEFF" + lignes.join("\r\n")], { type: "text/csv;charset=utf-8;" });
  var a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "horaires_" + employe.nom + "_" + mois + ".csv";
  a.click();
  fermerExportModal();
}

document.addEventListener("DOMContentLoaded", function () {
  afficherTableauEmployes();
});