// Employé sélectionné
var employeActuelID = null;


// AFFICHER LES EMPLOYÉS
// ===============================

function afficherGrille() {

  var employes = lireEmployes();
  var grille = document.getElementById("emp-grid");

  // Si aucun employé
  if (employes.length === 0) {
    grille.innerHTML = "Aucun employé.";
    return;
  }

  var html = "";

  for (var i = 0; i < employes.length; i++) {

    var e = employes[i];

    html += "<div class='emp-card' onclick=\"ouvrirModal('" + e.id + "')\">";
    html += e.prenom + " " + e.nom;
    html += "<br>";
    html += e.poste ? e.poste : "-";
    html += "</div>";
  }

  grille.innerHTML = html;
}


// OUVRIR LA FENÊTRE
// ===============================

function ouvrirModal(empID) {
  employeActuelID = empID;
  var employes = lireEmployes();
  var employe = employes.find(e => e.id == empID);

  if (!employe) return;

  document.getElementById("s-nom").textContent = employe.prenom + " " + employe.nom;
  document.getElementById("s-poste").textContent = employe.poste || "";

  // Réinitialisation
  document.getElementById("s-date").value = dateAujourdhui();
  document.getElementById("s-debut").value = "";
  document.getElementById("s-fin").value = "";
  document.getElementById("duree-preview").textContent = "";
  document.getElementById("repas-banner").classList.remove("show");

  document.getElementById("saisie-overlay").classList.add("open");
}

function mettreAJourPreview() {
  var debut = document.getElementById("s-debut").value;
  var fin = document.getElementById("s-fin").value;
  var preview = document.getElementById("duree-preview");
  var banner = document.getElementById("repas-banner");

  if (!debut || !fin) {
    preview.textContent = "";
    banner.classList.remove("show"); // Toujours enlever si pas complet
    return;
  }

  var duree = calculerDuree(debut, fin);
  preview.textContent = "Durée : " + minutesEnHeure(duree);

  // Afficher le bandeau repas uniquement pour la saisie en cours
  if (duree >= 300) {
    banner.classList.add("show");
  } else {
    banner.classList.remove("show");
  }
}



// FERMER LA FENÊTRE
// ===============================

function fermerModal() {

  document.getElementById("saisie-overlay").classList.remove("open");
  employeActuelID = null;
}


// CALCULER LA DURÉE
// ===============================

function calculerDuree(debut, fin) {

  var debutMin = heureEnMinutes(debut);
  var finMin = heureEnMinutes(fin);

  if (finMin <= debutMin) {
    finMin = finMin + 1440; // +24h
  }

  return finMin - debutMin;
}


// ENREGISTRER LES HORAIRES
// ===============================

function enregistrerHoraires() {

  var date = document.getElementById("s-date").value;
  var debut = document.getElementById("s-debut").value;
  var fin = document.getElementById("s-fin").value;

  if (!date || !debut || !fin) {
    alert("Veuillez remplir tous les champs.");
    return;
  }

  var duree = calculerDuree(debut, fin);
  var repas = duree >= 300; // 5h

  var employes = lireEmployes();
  var employe = null;

  for (var i = 0; i < employes.length; i++) {
    if (employes[i].id == employeActuelID) {
      employe = employes[i];
      break;
    }
  }

  var nouvelleHoraire = {
    id: genererID(),
    empID: employeActuelID,
    nomEmploye: employe.prenom + " " + employe.nom,
    poste: employe.poste,
    date: date,
    debut: debut,
    fin: fin,
    dureeMin: duree,
    repas: repas
  };

  var horaires = lireHoraires();
  horaires.push(nouvelleHoraire);
  sauvegarderHoraires(horaires);

  fermerModal();
}

// Affiche le tableau d'historique dans le modal
// Ouvrir l'historique pour l'employé sélectionné
function ouvrirHistorique() {
  if (!employeActuelID) return;

  var horaires = lireHoraires().filter(h => h.empID == employeActuelID);
  var tbody = document.getElementById("historique-tbody");

  if (horaires.length === 0) {
    tbody.innerHTML = "<tr><td colspan='5'>Aucune entrée</td></tr>";
  } else {
    var html = "";
    for (var i = 0; i < horaires.length; i++) {
      var h = horaires[i];
      html += "<tr>";
      html += "<td>" + h.date + "</td>";
      html += "<td>" + h.debut + "</td>";
      html += "<td>" + h.fin + "</td>";
      html += "<td>" + (h.dureeMin/60).toFixed(1) + "</td>";
      html += "<td>" + (h.repas ? "Oui" : "Non") + "</td>";
      html += "</tr>";
    }
    tbody.innerHTML = html;
  }

  // Afficher l'overlay de l'historique
  document.getElementById("historique-overlay").style.display = "flex";
}

// Fermer l'historique
function fermerHistorique() {
  document.getElementById("historique-overlay").style.display = "none";
}


// AU CHARGEMENT
// ===============================

document.addEventListener("DOMContentLoaded", function () {
  afficherGrille();
});