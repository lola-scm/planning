var employeActuelID = null;

async function afficherGrille() {
  var employes = await lireEmployes();
  var grille = document.getElementById("emp-grid");
  if (employes.length === 0) { grille.innerHTML = "Aucun employé."; return; }
  var html = "";
  for (var i = 0; i < employes.length; i++) {
    var e = employes[i];
    html += "<div class='emp-card' onclick=\"ouvrirModal('" + e.id + "')\">";
    html += e.prenom + " " + e.nom + "<br>" + (e.poste ? e.poste : "-");
    html += "</div>";
  }
  grille.innerHTML = html;
}

async function ouvrirModal(empID) {
  employeActuelID = empID;
  var employes = await lireEmployes();
  var employe = employes.find(e => e.id == empID);
  if (!employe) return;

  document.getElementById("s-nom").textContent = employe.prenom + " " + employe.nom;
  document.getElementById("s-poste").textContent = employe.poste || "";
  document.getElementById("s-date").value = dateAujourdhui();
  document.getElementById("s-debut").value = "";
  document.getElementById("s-fin").value = "";
  document.getElementById("duree-preview").textContent = "";
  document.getElementById("saisie-overlay").classList.add("open");
}

function mettreAJourPreview() {
  var debut = document.getElementById("s-debut").value;
  var fin = document.getElementById("s-fin").value;
  var preview = document.getElementById("duree-preview");
  if (!debut || !fin) { preview.textContent = ""; return; }
  preview.textContent = "Durée : " + minutesEnHeure(calculerDuree(debut, fin));
}

function fermerModal() {
  document.getElementById("saisie-overlay").classList.remove("open");
  employeActuelID = null;
}

function calculerDuree(debut, fin) {
  var debutMin = heureEnMinutes(debut);
  var finMin = heureEnMinutes(fin);
  if (finMin <= debutMin) finMin += 1440;
  return finMin - debutMin;
}

async function enregistrerHoraires() {
  var date = document.getElementById("s-date").value;
  var debut = document.getElementById("s-debut").value;
  var fin = document.getElementById("s-fin").value;
  if (!date || !debut || !fin) { alert("Veuillez remplir tous les champs."); return; }

  var duree = calculerDuree(debut, fin);
  var employes = await lireEmployes();
  var employe = employes.find(e => e.id == employeActuelID);

  var nouvelleHoraire = {
    id: genererID(),
    empID: employeActuelID,
    nomEmploye: employe.prenom + " " + employe.nom,
    poste: employe.poste,
    date: date,
    debut: debut,
    fin: fin,
    dureeMin: duree
  };

  var horaires = await lireHoraires();
  horaires.push(nouvelleHoraire);
  await sauvegarderHoraires(horaires);
  fermerModal();
}

async function ouvrirHistorique() {
  if (!employeActuelID) return;
  var horaires = (await lireHoraires()).filter(h => h.empID == employeActuelID);
  var tbody = document.getElementById("historique-tbody");

  if (horaires.length === 0) {
    tbody.innerHTML = "<tr><td colspan='5'>Aucune entrée</td></tr>";
  } else {
    var html = "";
    for (var i = 0; i < horaires.length; i++) {
      var h = horaires[i];
      html += "<tr><td>" + h.date + "</td><td>" + h.debut + "</td><td>" + h.fin + "</td>";
      html += "<td>" + (h.dureeMin / 60).toFixed(1) + "</td>";
      html += "<td><button class='btn-sm' onclick=\"supprimerLigne('" + h.id + "')\">Supprimer</button></td></tr>";
    }
    tbody.innerHTML = html;
  }
  document.getElementById("historique-overlay").style.display = "flex";
}

var horaireASupprimer = null;

function supprimerLigne(horaireID) {
  horaireASupprimer = horaireID;
  document.getElementById("confirm-overlay").style.display = "flex";
}

function fermerConfirm() {
  horaireASupprimer = null;
  document.getElementById("confirm-overlay").style.display = "none";
}

async function confirmerSuppression() {
  if (!horaireASupprimer) return;
  var horaires = await lireHoraires();
  await sauvegarderHoraires(horaires.filter(h => h.id != horaireASupprimer));
  fermerConfirm();
  ouvrirHistorique();
}

function fermerHistorique() {
  document.getElementById("historique-overlay").style.display = "none";
}

window.addEventListener("load", async function () {
  await afficherGrille();
});
