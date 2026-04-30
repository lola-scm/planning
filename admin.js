var idEmployeEnEdition = null;
var idEmployeActuel = null;

// ===================================================
// LOGIN
// ===================================================

async function verifierMdp() {
  var saisi = document.getElementById("login-mdp").value;
  var mdpStocke = await lireMdp();

  if (!mdpStocke) {
    // Première connexion : on définit le mot de passe
    if (!saisi) { alert("Entrez un mot de passe."); return; }
    await sauvegarderMdp(saisi);
    document.getElementById("login-screen").style.display = "none";
    initialiserAdmin();
    return;
  }

  if (saisi === mdpStocke) {
    document.getElementById("login-screen").style.display = "none";
    initialiserAdmin();
  } else {
    document.getElementById("login-erreur").style.display = "block";
    document.getElementById("login-mdp").value = "";
  }
}

async function initialiserAdmin() {
  var mdp = await lireMdp();
  if (!mdp) {
    document.getElementById("login-first").style.display = "block";
  }
  afficherTableauEmployes();
  chargerCategoriesDansSelects();
}

// ===================================================
// MOT DE PASSE
// ===================================================

function ouvrirChangerMdp() {
  document.getElementById("mdp-nouveau").value = "";
  document.getElementById("mdp-confirmer").value = "";
  document.getElementById("mdp-erreur").style.display = "none";
  document.getElementById("mdp-overlay").classList.add("open");
}

function fermerChangerMdp() {
  document.getElementById("mdp-overlay").classList.remove("open");
}

async function sauvegarderMdp() {
  var nouveau = document.getElementById("mdp-nouveau").value;
  var confirmer = document.getElementById("mdp-confirmer").value;
  var erreur = document.getElementById("mdp-erreur");

  if (!nouveau) { erreur.textContent = "Entrez un mot de passe."; erreur.style.display = "block"; return; }
  if (nouveau !== confirmer) { erreur.textContent = "Les mots de passe ne correspondent pas."; erreur.style.display = "block"; return; }

  await db.collection("config").doc("admin").set({ mdp: nouveau });
  fermerChangerMdp();
  afficherToast("Mot de passe mis à jour ✓");
}

// ===================================================
// ONGLETS
// ===================================================

function afficherOnglet(nom) {
  document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  var panelId = nom === "employes" ? "emps" : nom === "recettes" ? "recettes" : "categories";
  document.getElementById("panel-" + panelId).classList.add("active");
  event.target.classList.add("active");
  if (nom === "categories") afficherTableauCategories();
  if (nom === "recettes") afficherTableauRecettes();
}

// ===================================================
// CATÉGORIES
// ===================================================

var idCategorieEnEdition = null;

async function afficherTableauCategories() {
  var categories = await lireCategories();
  var tbody = document.getElementById("cat-tbody");
  if (categories.length === 0) {
    tbody.innerHTML = "<tr><td colspan='2'>Aucune catégorie</td></tr>";
    return;
  }
  var html = "";
  categories.forEach(c => {
    html += "<tr><td>" + c.nom + "</td><td>";
    html += "<button class='btn-sm' onclick=\"ouvrirFormulaireCategorie('" + c.id + "')\">Modifier</button> ";
    html += "<button class='btn-sm' onclick=\"supprimerCategorie('" + c.id + "')\">Supprimer</button>";
    html += "</td></tr>";
  });
  tbody.innerHTML = html;
}

function ouvrirFormulaireCategorie(catID) {
  idCategorieEnEdition = catID || null;
  document.getElementById("fc-nom").value = "";
  if (catID) {
    lireCategories().then(cats => {
      var c = cats.find(c => c.id == catID);
      if (c) document.getElementById("fc-nom").value = c.nom;
    });
  }
  document.getElementById("cat-modal-titre").textContent = catID ? "Modifier la catégorie" : "Nouvelle catégorie";
  document.getElementById("cat-overlay").classList.add("open");
}

function fermerFormulaireCategorie() {
  document.getElementById("cat-overlay").classList.remove("open");
  idCategorieEnEdition = null;
}

async function sauvegarderCategorie() {
  var nom = document.getElementById("fc-nom").value.trim();
  if (!nom) { alert("Le nom est requis."); return; }

  var categories = await lireCategories();
  if (idCategorieEnEdition) {
    categories = categories.map(c => c.id == idCategorieEnEdition ? { ...c, nom } : c);
  } else {
    categories.push({ id: genererID(), nom });
  }
  await sauvegarderCategories(categories);
  fermerFormulaireCategorie();
  afficherTableauCategories();
  chargerCategoriesDansSelects();
}

async function supprimerCategorie(catID) {
  if (!confirm("Supprimer cette catégorie ?")) return;
  var categories = await lireCategories();
  await sauvegarderCategories(categories.filter(c => c.id != catID));
  afficherTableauCategories();
  chargerCategoriesDansSelects();
}

async function chargerCategoriesDansSelects() {
  var categories = await lireCategories();
  var options = "<option value=''>Toutes catégories</option>";
  var optionsFiche = "";
  categories.forEach(c => {
    options += "<option value='" + c.nom + "'>" + c.nom + "</option>";
    optionsFiche += "<option value='" + c.nom + "'>" + c.nom + "</option>";
  });
  var filtreEl = document.getElementById("filtre-categorie");
  var frCatEl = document.getElementById("fr-categorie");
  if (filtreEl) filtreEl.innerHTML = options;
  if (frCatEl) frCatEl.innerHTML = optionsFiche || "<option value=''>— Aucune catégorie —</option>";
}

// ===================================================
// EMPLOYÉS
// ===================================================

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
  if (employes.length === 0) { tbody.innerHTML = "<tr><td colspan='4'>Aucun employé</td></tr>"; return; }
  var html = "";
  employes.forEach(e => {
    html += "<tr><td>" + e.nom + "</td><td>" + e.prenom + "</td><td>" + (e.poste || "-") + "</td><td>";
    html += "<button class='btn-sm' onclick=\"ouvrirFormulaireEmploye('" + e.id + "')\">Modifier</button> ";
    html += "<button class='btn-sm' onclick=\"supprimerEmploye('" + e.id + "')\">Supprimer</button> ";
    html += "<button class='btn-sm' onclick=\"voirEmploye('" + e.id + "')\">Voir</button> ";
    html += "<button class='btn-sm btn-primary' onclick=\"ouvrirExportModal('" + e.id + "')\">⬇ CSV</button>";
    html += "</td></tr>";
  });
  tbody.innerHTML = html;
}

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
    employes = employes.map(e => e.id == idEmployeEnEdition ? { ...e, prenom, nom, poste } : e);
  } else {
    employes.push({ id: genererID(), prenom, nom, poste });
  }
  await sauvegarderEmployes(employes);
  fermerFormulaireEmploye();
  afficherTableauEmployes();
}

async function supprimerEmploye(empID) {
  if (!confirm("Supprimer cet employé ?")) return;
  var employes = await lireEmployes();
  await sauvegarderEmployes(employes.filter(e => e.id != empID));
  afficherTableauEmployes();
}

async function voirEmploye(empID) {
  var employes = await lireEmployes();
  var employe = employes.find(e => e.id == empID);
  if (!employe) return;
  idEmployeActuel = empID;
  var horaires = (await lireHoraires()).filter(h => h.empID == empID);
  var totalMinutes = horaires.reduce((sum, h) => sum + h.dureeMin, 0);
  document.getElementById("details-content").innerHTML =
    "<p><strong>Employé :</strong> " + employe.prenom + " " + employe.nom + "</p>" +
    "<p><strong>Total heures :</strong> " + (totalMinutes / 60).toFixed(1) + " h</p>";
  document.querySelector(".btn-historique").setAttribute("onclick", "ouvrirHistorique('" + empID + "')");
  document.getElementById("details-overlay").classList.add("open");
}

function fermerDetailsEmploye() { document.getElementById("details-overlay").classList.remove("open"); }

async function ouvrirHistorique(empID) {
  if (!empID) return;
  var horaires = (await lireHoraires()).filter(h => h.empID == empID);
  var tbody = document.getElementById("historique-tbody");
  if (horaires.length === 0) {
    tbody.innerHTML = "<tr><td colspan='4'>Aucune entrée</td></tr>";
  } else {
    tbody.innerHTML = horaires.map(h =>
      "<tr><td>" + h.date + "</td><td>" + h.debut + "</td><td>" + h.fin + "</td><td>" + (h.dureeMin/60).toFixed(1) + "</td></tr>"
    ).join("");
  }
  document.getElementById("historique-overlay").style.display = "flex";
}

function fermerHistorique() { document.getElementById("historique-overlay").style.display = "none"; }

// ===================================================
// EXPORT CSV
// ===================================================

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
    "Mois" + sep + mois, "",
    "Date" + sep + "Début" + sep + "Fin" + sep + "Durée (h)",
    ...horaires.map(h => h.date + sep + h.debut + sep + h.fin + sep + (h.dureeMin/60).toFixed(2).replace(".", ",")),
    "", "TOTAL HEURES" + sep + (totalMin/60).toFixed(2).replace(".", ",")
  ];
  var blob = new Blob(["\uFEFF" + lignes.join("\r\n")], { type: "text/csv;charset=utf-8;" });
  var a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "horaires_" + employe.nom + "_" + mois + ".csv";
  a.click();
  fermerExportModal();
}

// ===================================================
// TOAST
// ===================================================

function afficherToast(msg) {
  var t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2500);
}

// ===================================================
// INIT
// ===================================================

window.addEventListener("load", function() {
  // Vérifier si déjà connecté dans la session
  verifierSession();
});

async function verifierSession() {
  var mdp = await lireMdp();
  if (!mdp) {
    // Première utilisation : montrer message
    document.getElementById("login-first").style.display = "block";
  }
  // Afficher l'écran de login dans tous les cas
  document.getElementById("login-screen").style.display = "flex";
}
