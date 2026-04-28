var idRecetteEnEdition = null;
var idRecetteActuelle = null;

// AFFICHER LES RECETTES
async function afficherTableauRecettes(filtre) {
  var recettes = await lireRecettes();
  var categorie = document.getElementById("filtre-categorie") ? document.getElementById("filtre-categorie").value : "";

  if (filtre) {
    var f = filtre.toLowerCase();
    recettes = recettes.filter(r => r.nom.toLowerCase().includes(f) || (r.categorie || "").toLowerCase().includes(f));
  }
  if (categorie) recettes = recettes.filter(r => r.categorie === categorie);

  var tbody = document.getElementById("rec-tbody");
  if (recettes.length === 0) { tbody.innerHTML = "<tr><td colspan='5'>Aucune recette</td></tr>"; return; }

  var html = "";
  for (var i = 0; i < recettes.length; i++) {
    var r = recettes[i];
    var coutTotal = calculerCoutTotal(r);
    var coutPortion = r.portions > 0 ? (coutTotal / r.portions).toFixed(2) : "-";
    html += "<tr><td>" + r.nom + "</td><td>" + (r.categorie || "-") + "</td><td>" + (r.portions || 1) + "</td><td>" + coutPortion + " €</td><td>";
    html += "<button class='btn-sm' onclick=\"voirRecette('" + r.id + "')\">Voir</button> ";
    html += "<button class='btn-sm' onclick=\"ouvrirFormulaireRecette('" + r.id + "')\">Modifier</button> ";
    html += "<button class='btn-sm' onclick=\"supprimerRecette('" + r.id + "')\">Supprimer</button></td></tr>";
  }
  tbody.innerHTML = html;
}

function calculerCoutTotal(recette) {
  if (!recette.ingredients) return 0;
  return recette.ingredients.reduce((sum, ing) => sum + (parseFloat(ing.cout) || 0), 0);
}

async function ouvrirFormulaireRecette(recID) {
  idRecetteEnEdition = recID || null;
  var nom = "", categorie = "", portions = 1, ingredients = [], etapes = [];

  if (recID) {
    var recettes = await lireRecettes();
    var r = recettes.find(r => r.id == recID);
    if (r) { nom = r.nom; categorie = r.categorie; portions = r.portions; ingredients = r.ingredients || []; etapes = r.etapes || []; }
  }

  document.getElementById("fr-nom").value = nom;
  document.getElementById("fr-categorie").value = categorie;
  document.getElementById("fr-portions").value = portions;

  var ingHtml = "";
  if (ingredients.length === 0) ingredients = [{ nom: "", quantite: "", unite: "", cout: "" }];
  for (var i = 0; i < ingredients.length; i++) ingHtml += ligneIngredient(ingredients[i]);
  document.getElementById("ing-liste").innerHTML = ingHtml;

  var etapesHtml = "";
  if (etapes.length === 0) etapes = [""];
  for (var j = 0; j < etapes.length; j++) etapesHtml += ligneEtape(etapes[j]);
  document.getElementById("etapes-liste").innerHTML = etapesHtml;

  document.getElementById("rec-overlay").classList.add("open");
}

function ligneIngredient(ing) {
  return "<div class='ing-row'>" +
    "<input class='form-input' placeholder='Ingrédient' value='" + (ing.nom || "") + "' data-ing='nom'>" +
    "<input class='form-input' placeholder='Qté' value='" + (ing.quantite || "") + "' data-ing='quantite' style='width:70px'>" +
    "<input class='form-input' placeholder='Unité' value='" + (ing.unite || "") + "' data-ing='unite' style='width:70px'>" +
    "<input class='form-input' placeholder='Coût €' value='" + (ing.cout || "") + "' data-ing='cout' type='number' step='0.01' style='width:80px'>" +
    "<button class='btn-sm' onclick='supprimerLigne(this)'>✕</button></div>";
}

function ligneEtape(texte) {
  return "<div class='etape-row'><textarea class='form-input' placeholder='Étape…' rows='2'>" + (texte || "") + "</textarea><button class='btn-sm' onclick='supprimerLigne(this)'>✕</button></div>";
}

function ajouterIngredient() {
  var div = document.createElement("div");
  div.innerHTML = ligneIngredient({ nom: "", quantite: "", unite: "", cout: "" });
  document.getElementById("ing-liste").appendChild(div.firstChild);
}

function ajouterEtape() {
  var div = document.createElement("div");
  div.innerHTML = ligneEtape("");
  document.getElementById("etapes-liste").appendChild(div.firstChild);
}

function supprimerLigne(btn) { btn.parentElement.remove(); }
function fermerFormulaireRecette() { document.getElementById("rec-overlay").classList.remove("open"); idRecetteEnEdition = null; }

async function sauvegarderRecette() {
  var nom = document.getElementById("fr-nom").value.trim();
  var categorie = document.getElementById("fr-categorie").value;
  var portions = parseInt(document.getElementById("fr-portions").value) || 1;
  if (!nom) { alert("Le nom est requis."); return; }

  var ingredients = [];
  document.querySelectorAll("#ing-liste .ing-row").forEach(function(row) {
    ingredients.push({
      nom: row.querySelector("[data-ing='nom']").value.trim(),
      quantite: row.querySelector("[data-ing='quantite']").value.trim(),
      unite: row.querySelector("[data-ing='unite']").value.trim(),
      cout: row.querySelector("[data-ing='cout']").value.trim()
    });
  });

  var etapes = [];
  document.querySelectorAll("#etapes-liste textarea").forEach(function(ta) {
    if (ta.value.trim()) etapes.push(ta.value.trim());
  });

  var recettes = await lireRecettes();
  if (idRecetteEnEdition) {
    for (var i = 0; i < recettes.length; i++) {
      if (recettes[i].id == idRecetteEnEdition) {
        recettes[i].nom = nom; recettes[i].categorie = categorie;
        recettes[i].portions = portions; recettes[i].ingredients = ingredients; recettes[i].etapes = etapes;
        break;
      }
    }
  } else {
    recettes.push({ id: genererID(), nom, categorie, portions, ingredients, etapes });
  }
  await sauvegarderRecettes(recettes);
  fermerFormulaireRecette();
  afficherTableauRecettes();
}

async function supprimerRecette(recID) {
  if (!confirm("Supprimer cette recette ?")) return;
  var recettes = await lireRecettes();
  await sauvegarderRecettes(recettes.filter(r => r.id != recID));
  afficherTableauRecettes();
}

async function voirRecette(recID) {
  var recettes = await lireRecettes();
  var r = recettes.find(r => r.id == recID);
  if (!r) return;
  idRecetteActuelle = recID;

  document.getElementById("rv-nom").textContent = r.nom;
  document.getElementById("rv-categorie").textContent = r.categorie || "";
  document.getElementById("rv-portions-base").value = r.portions || 1;
  document.getElementById("rv-portions-ajust").value = r.portions || 1;

  afficherDetailRecette(r, r.portions);
  document.getElementById("rec-view-overlay").classList.add("open");
}

function afficherDetailRecette(r, portionsAjust) {
  var base = r.portions || 1;
  var ratio = portionsAjust / base;
  var coutTotal = calculerCoutTotal(r) * ratio;
  var coutPortion = portionsAjust > 0 ? (coutTotal / portionsAjust).toFixed(2) : "-";

  var ingHtml = "<table><thead><tr><th>Ingrédient</th><th>Qté</th><th>Unité</th><th>Coût</th></tr></thead><tbody>";
  (r.ingredients || []).forEach(function(ing) {
    var qte = ing.quantite ? (parseFloat(ing.quantite) * ratio).toFixed(2).replace(/\.?0+$/, "") : "-";
    var cout = ing.cout ? (parseFloat(ing.cout) * ratio).toFixed(2) + " €" : "-";
    ingHtml += "<tr><td>" + ing.nom + "</td><td>" + qte + "</td><td>" + (ing.unite || "-") + "</td><td>" + cout + "</td></tr>";
  });
  ingHtml += "</tbody></table>";
  document.getElementById("rv-ingredients").innerHTML = ingHtml;
  document.getElementById("rv-cout-total").textContent = coutTotal.toFixed(2) + " €";
  document.getElementById("rv-cout-portion").textContent = coutPortion + " €";

  // Étapes
  var etapesHtml = "";
  (r.etapes || []).forEach(function(e, i) {
    etapesHtml += "<div class='etape-item'><span class='etape-num'>" + (i+1) + "</span><span>" + e + "</span></div>";
  });
  document.getElementById("rv-etapes").innerHTML = etapesHtml || "<p>Aucune étape.</p>";
}

async function ajusterPortions() {
  var recettes = await lireRecettes();
  var r = recettes.find(r => r.id == idRecetteActuelle);
  if (!r) return;
  var portionsAjust = parseInt(document.getElementById("rv-portions-ajust").value) || 1;
  afficherDetailRecette(r, portionsAjust);
}

function fermerVoirRecette() { document.getElementById("rec-view-overlay").classList.remove("open"); }
function exporterPDFRecette() { window.print(); }

document.addEventListener("DOMContentLoaded", function () { afficherTableauRecettes(); });