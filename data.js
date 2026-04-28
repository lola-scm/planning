const firebaseConfig = {
  apiKey: "AIzaSyCXx3VymDRRFsQVfIu4dqkLc4oIOWR_LaU",
  authDomain: "planning-df4ca.firebaseapp.com",
  projectId: "planning-df4ca",
  storageBucket: "planning-df4ca.firebasestorage.app",
  messagingSenderId: "338758778876",
  appId: "1:338758778876:web:242d98c91edc28850cfc79"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

async function lireEmployes() {
  const snap = await db.collection("employes").get();
  return snap.docs.map(d => d.data()).flat();
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
  return snap.docs.map(d => d.data()).flat();
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
  return snap.docs.map(d => d.data()).flat();
}

async function sauvegarderRecettes(recettes) {
  const snap = await db.collection("recettes").get();
  const batch = db.batch();
  snap.docs.forEach(d => batch.delete(d.ref));
  recettes.forEach(r => batch.set(db.collection("recettes").doc(r.id), r));
  await batch.commit();
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