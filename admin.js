import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";
import { getStorage, ref as sRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";

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
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

const loginSection = document.getElementById("loginSection");
const adminSection = document.getElementById("adminSection");
const loginForm = document.getElementById("loginForm");
const storyForm = document.getElementById("storyForm");
const storyList = document.getElementById("storyList");

// تسجيل الدخول
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      loginSection.style.display = "none";
      adminSection.style.display = "block";
    })
    .catch((error) => {
      alert("خطأ في تسجيل الدخول: " + error.message);
    });
});

// متابعة حالة الدخول
onAuthStateChanged(auth, (user) => {
  if (user) {
    loginSection.style.display = "none";
    adminSection.style.display = "block";
  } else {
    adminSection.style.display = "none";
    loginSection.style.display = "block";
  }
});

// إضافة رواية جديدة مع رفع صورة
storyForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = storyTitle.value;
  const content = storyContent.value;
  const file = storyImage.files[0];
  if (!file) {
    alert("يرجى اختيار صورة 📸");
    return;
  }

  const storageRef = sRef(storage, 'stories/' + file.name);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);

  push(ref(db, "stories"), {
    title,
    content,
    imageURL: downloadURL,
  });

  alert("تمت إضافة الرواية بنجاح 💖");
  storyForm.reset();
});

// عرض الروايات
onValue(ref(db, "stories"), (snapshot) => {
  storyList.innerHTML = "";
  snapshot.forEach((child) => {
    const key = child.key;
    const story = child.val();
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${story.title}</strong>
      <button data-id="${key}">🗑 حذف</button>`;
    li.querySelector("button").addEventListener("click", () => {
      remove(ref(db, "stories/" + key));
    });
    storyList.appendChild(li);
  });
});
