const firebaseConfig = {
  apiKey: "AIzaSyBV2uvCIYK_h_YVq6FlXSeLhfZYXgKexjM",
  authDomain: "planning-test-4a807.firebaseapp.com",
  projectId: "planning-test-4a807",
  storageBucket: "planning-test-4a807.firebasestorage.app",
  messagingSenderId: "170620092760",
  appId: "1:170620092760:web:0c119105d38d92ade3e52d"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

async function lireEmployes() {
  const snap = await db.collection("employes").get();
  return snap.docs.map(d => d.data()).flat().filter(e => e && e.id);
}

async function sauvegarderEmployes(employes) {
  const snap = await db.collection("employes").get();
  const batch = db.batch();
  snap.docs.forEach(d => batch.delete(d.ref));
  employes.forEach(e => batch.set(db.collection("employes").doc(e.id), e));
  await batch.commit();
}

async function lireHoraires() {
  const snap = await db.collection("horaires").get();
  return snap.docs.map(d => d.data()).flat().filter(h => h && h.id);
}

async function sauvegarderHoraires(horaires) {
  const snap = await db.collection("horaires").get();
  const batch = db.batch();
  snap.docs.forEach(d => batch.delete(d.ref));
  horaires.forEach(h => batch.set(db.collection("horaires").doc(h.id), h));
  await batch.commit();
}

async function lireRecettes() {
  const snap = await db.collection("recettes").get();
  return snap.docs.map(d => d.data()).flat().filter(r => r && r.id);
}

async function sauvegarderRecettes(recettes) {
  const snap = await db.collection("recettes").get();
  const batch = db.batch();
  snap.docs.forEach(d => batch.delete(d.ref));
  recettes.forEach(r => batch.set(db.collection("recettes").doc(r.id), r));
  await batch.commit();
}

async function lireCategories() {
  const snap = await db.collection("categories").get();
  return snap.docs.map(d => d.data()).flat().filter(c => c && c.id);
}

async function sauvegarderCategories(categories) {
  const snap = await db.collection("categories").get();
  const batch = db.batch();
  snap.docs.forEach(d => batch.delete(d.ref));
  categories.forEach(c => batch.set(db.collection("categories").doc(c.id), c));
  await batch.commit();
}

async function lireMdp() {
  try {
    const doc = await db.collection("config").doc("admin").get();
    if (doc.exists) return doc.data().mdp || null;
    return null;
  } catch(e) { return null; }
}

async function sauvegarderMdp(mdp) {
  await db.collection("config").doc("admin").set({ mdp: mdp });
}

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
