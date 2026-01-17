import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAXvwmQQLvbKgKk2-m2nVb_ADoFlm9BmXs",
  authDomain: "asistencia-ninos-orquestando.firebaseapp.com",
  projectId: "asistencia-ninos-orquestando",
  storageBucket: "asistencia-ninos-orquestando.firebasestorage.app",
  messagingSenderId: "193901360592",
  appId: "1:193901360592:web:9e345008bdbeb46820f5d5"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
