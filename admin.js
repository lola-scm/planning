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
function afficherTableauEmployes(filtre) {
  var employes = lireEmployes();
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
    html += "<tr>";
    html += "<td>" + e.nom + "</td>";
    html += "<td>" + e.prenom + "</td>";
    html += "<td>" + (e.poste || "-") + "</td>";
    html += "<td>";
    html += "<button class='btn-sm' onclick=\"ouvrirFormulaireEmploye('" + e.id + "')\">Modifier</button> ";
    html += "<button class='btn-sm' onclick=\"supprimerEmploye('" + e.id + "')\">Supprimer</button> ";
    html += "<button class='btn-sm' onclick=\"voirEmploye('" + e.id + "')\">Voir</button> ";
    html += "<button class='btn-sm btn-primary' onclick=\"ouvrirExportModal('" + e.id + "')\">⬇ CSV</button>";
    html += "</td>";
    html += "</tr>";
  }
  tbody.innerHTML = html;
}

// OUVRIR LE FORMULAIRE EMPLOYÉ
function ouvrirFormulaireEmploye(empID) {
  idEmployeEnEdition = empID || null;
  var prenom = "", nom = "", poste = "";
  if (empID) {
    var employes = lireEmployes();
    for (var i = 0; i < employes.length; i++) {
      if (employes[i].id == empID) {
        prenom = employes[i].prenom;
        nom = employes[i].nom;
        poste = employes[i].poste;
        break;
      }
    }
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

// SAUVEGARDER EMPLOYÉ
function sauvegarderEmploye() {
  var prenom = document.getElementById("fe-prenom").value.trim();
  var nom = document.getElementById("fe-nom").value.trim();
  var poste = document.getElementById("fe-poste").value.trim();
  if (!prenom || !nom) { alert("Prénom et nom requis."); return; }

  var employes = lireEmployes();
  if (idEmployeEnEdition) {
    for (var i = 0; i < employes.length; i++) {
      if (employes[i].id == idEmployeEnEdition) {
        employes[i].prenom = prenom;
        employes[i].nom = nom;
        employes[i].poste = poste;
        break;
      }
    }
  } else {
    employes.push({ id: genererID(), prenom: prenom, nom: nom, poste: poste });
  }
  sauvegarderEmployes(employes);
  fermerFormulaireEmploye();
  afficherTableauEmployes();
}

// SUPPRIMER EMPLOYÉ
function supprimerEmploye(empID) {
  var employes = lireEmployes();
  sauvegarderEmployes(employes.filter(e => e.id != empID));
  afficherTableauEmployes();
}

// VOIR EMPLOYÉ
function voirEmploye(empID) {
  var employes = lireEmployes();
  var employe = employes.find(e => e.id == empID);
  if (!employe) { alert("Employé introuvable"); return; }

  idEmployeActuel = empID;

  var horaires = lireHoraires().filter(h => h.empID == empID);
  var totalMinutes = horaires.reduce((sum, h) => sum + h.dureeMin, 0);
  var repasCount = horaires.filter(h => h.repas).length;

  var html = "";
  html += "<p><strong>Employé :</strong> " + employe.prenom + " " + employe.nom + "</p>";
  html += "<p><strong>Total heures :</strong> " + (totalMinutes / 60).toFixed(1) + " h</p>";
  html += "<p><strong>Repas attribués :</strong> " + repasCount + "</p>";
  document.getElementById("details-content").innerHTML = html;

  var btnHistorique = document.querySelector(".btn-historique");
  btnHistorique.setAttribute("onclick", "ouvrirHistorique('" + empID + "')");

  document.getElementById("details-overlay").classList.add("open");
}

function fermerDetailsEmploye() {
  document.getElementById("details-overlay").classList.remove("open");
}

// HISTORIQUE
function ouvrirHistorique(empID) {
  if (!empID) return;
  var horaires = lireHoraires().filter(h => h.empID == empID);
  var tbody = document.getElementById("historique-tbody");
  if (horaires.length === 0) {
    tbody.innerHTML = "<tr><td colspan='5'>Aucune entrée</td></tr>";
  } else {
    var html = "";
    for (var i = 0; i < horaires.length; i++) {
      var h = horaires[i];
      html += "<tr><td>" + h.date + "</td><td>" + h.debut + "</td><td>" + h.fin + "</td>";
      html += "<td>" + (h.dureeMin/60).toFixed(1) + "</td><td>" + (h.repas ? "Oui" : "Non") + "</td></tr>";
    }
    tbody.innerHTML = html;
  }
  document.getElementById("historique-overlay").style.display = "flex";
}

function fermerHistorique() {
  document.getElementById("historique-overlay").style.display = "none";
}


// ===================================================
// EXPORT CSV
// ===================================================

function ouvrirExportModal(empID) {
  idEmployeActuel = empID;
  document.getElementById("export-overlay").classList.add("open");
  var now = new Date();
  var mois = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");
  document.getElementById("export-mois").value = mois;
}

function exporterCSV() {
  ouvrirExportModal(idEmployeActuel);
}

function fermerExportModal() {
  document.getElementById("export-overlay").classList.remove("open");
}

function genererCSV() {
  var mois = document.getElementById("export-mois").value;
  if (!mois) { alert("Sélectionne un mois."); return; }

  var employes = lireEmployes();
  var employe = employes.find(e => e.id == idEmployeActuel);
  if (!employe) { alert("Employé introuvable."); return; }

  var horaires = lireHoraires()
    .filter(h => h.empID == idEmployeActuel && h.date.startsWith(mois))
    .sort((a, b) => a.date.localeCompare(b.date));

  var totalMin = horaires.reduce((s, h) => s + h.dureeMin, 0);
  var totalRepas = horaires.filter(h => h.repas).length;

  var sep = ";";
  var lignes = [];

  lignes.push("Employé" + sep + employe.prenom + " " + employe.nom);
  lignes.push("Poste" + sep + (employe.poste || "-"));
  lignes.push("Mois" + sep + mois);
  lignes.push("");
  lignes.push("Date" + sep + "Début" + sep + "Fin" + sep + "Durée (h)" + sep + "Repas");

  for (var i = 0; i < horaires.length; i++) {
    var h = horaires[i];
    lignes.push(
      h.date + sep +
      h.debut + sep +
      h.fin + sep +
      (h.dureeMin / 60).toFixed(2).replace(".", ",") + sep +
      (h.repas ? "Oui" : "Non")
    );
  }

  lignes.push("");
  lignes.push("TOTAL HEURES" + sep + (totalMin / 60).toFixed(2).replace(".", ","));
  lignes.push("TOTAL REPAS" + sep + totalRepas);

  var contenu = "\uFEFF" + lignes.join("\r\n");
  var blob = new Blob([contenu], { type: "text/csv;charset=utf-8;" });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = "horaires_" + employe.nom + "_" + mois + ".csv";
  a.click();
  URL.revokeObjectURL(url);

  fermerExportModal();
}


// AU CHARGEMENT
document.addEventListener("DOMContentLoaded", function () {
  afficherTableauEmployes();
});
