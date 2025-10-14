import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDxoEJLaGcEy7s1P2nE2_bDniS71ldI31Q",
  authDomain: "alhadari-net.firebaseapp.com",
  databaseURL: "https://alhadari-net-default-rtdb.firebaseio.com",
  projectId: "alhadari-net",
  storageBucket: "alhadari-net.firebasestorage.app",
  messagingSenderId: "465757130283",
  appId: "1:465757130283:web:10128c19bef6171e5e246e",
  measurementId: "G-XLQB1M9FHQ"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const storiesContainer = document.getElementById("storiesContainer");

onValue(ref(db, "stories"), (snapshot) => {
  storiesContainer.innerHTML = "";
  snapshot.forEach((child) => {
    const story = child.val();
    storiesContainer.innerHTML += `
      <div class="card">
        <img src="${story.imageURL || 'https://via.placeholder.com/300'}">
        <h3>${story.title}</h3>
        <p>${story.content.substring(0, 150)}...</p>
      </div>`;
  });
});
