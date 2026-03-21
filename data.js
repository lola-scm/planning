// ===================================================
// EMPLOYÉS
// ===================================================

function lireEmployes() {
  return JSON.parse(localStorage.getItem("employes") || "[]");
}

function sauvegarderEmployes(employes) {
  localStorage.setItem("employes", JSON.stringify(employes));
}


// ===================================================
// HORAIRES
// ===================================================

function lireHoraires() {
  return JSON.parse(localStorage.getItem("horaires") || "[]");
}

function sauvegarderHoraires(horaires) {
  localStorage.setItem("horaires", JSON.stringify(horaires));
}


// ===================================================
// RECETTES
// ===================================================

function lireRecettes() {
  return JSON.parse(localStorage.getItem("recettes") || "[]");
}

function sauvegarderRecettes(recettes) {
  localStorage.setItem("recettes", JSON.stringify(recettes));
}


// ===================================================
// UTILITAIRES
// ===================================================

function genererID() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function heureEnMinutes(heure) {
  var parts = heure.split(":");
  return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

function minutesEnHeure(minutes) {
  var h = Math.floor(minutes / 60);
  var m = minutes % 60;
  return h + "h" + (m < 10 ? "0" : "") + m;
}

function dateAujourdhui() {
  var d = new Date();
  var mois = String(d.getMonth() + 1).padStart(2, "0");
  var jour = String(d.getDate()).padStart(2, "0");
  return d.getFullYear() + "-" + mois + "-" + jour;
}
