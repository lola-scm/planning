// ===================================================
// CONFIGURATION FIREBASE
// ===================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs, setDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCXx3VymDRRFsQVfIu4dqkLc4oIOWR_LaU",
  authDomain: "planning-df4ca.firebaseapp.com",
  projectId: "planning-df4ca",
  storageBucket: "planning-df4ca.firebasestorage.app",
  messagingSenderId: "338758778876",
  appId: "1:338758778876:web:242d98c91edc28850cfc79"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// ===================================================
// EMPLOYÉS
// ===================================================

async function lireEmployes() {
  const snap = await getDocs(collection(db, "employes"));
  return snap.docs.map(d => d.data());
}

async function sauvegarderEmployes(employes) {
  // On récupère les anciens pour supprimer ceux qui n'existent plus
  const snap = await getDocs(collection(db, "employes"));
  for (const d of snap.docs) {
    await deleteDoc(doc(db, "employes", d.id));
  }
  for (const e of employes) {
    await setDoc(doc(db, "employes", e.id), e);
  }
}


// ===================================================
// HORAIRES
// ===================================================

async function lireHoraires() {
  const snap = await getDocs(collection(db, "horaires"));
  return snap.docs.map(d => d.data());
}

async function sauvegarderHoraires(horaires) {
  const snap = await getDocs(collection(db, "horaires"));
  for (const d of snap.docs) {
    await deleteDoc(doc(db, "horaires", d.id));
  }
  for (const h of horaires) {
    await setDoc(doc(db, "horaires", h.id), h);
  }
}


// ===================================================
// RECETTES
// ===================================================

async function lireRecettes() {
  const snap = await getDocs(collection(db, "recettes"));
  return snap.docs.map(d => d.data());
}

async function sauvegarderRecettes(recettes) {
  const snap = await getDocs(collection(db, "recettes"));
  for (const d of snap.docs) {
    await deleteDoc(doc(db, "recettes", d.id));
  }
  for (const r of recettes) {
    await setDoc(doc(db, "recettes", r.id), r);
  }
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