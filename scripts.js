// scripts.js (module)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";
import { firebaseConfig } from "./firebaseConfig.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

document.getElementById('year').textContent = new Date().getFullYear();

const storiesContainer = document.getElementById('storiesContainer');
const galleryContainer = document.getElementById('galleryContainer');

onValue(ref(db, 'stories'), snapshot => {
  storiesContainer.innerHTML = '';
  galleryContainer.innerHTML = '';
  const data = snapshot.val();
  if (!data) {
    storiesContainer.innerHTML = '<p>لا توجد روايات بعد.</p>';
    return;
  }
  // عرض بالعكس (الأحدث أول)
  const keys = Object.keys(data).sort((a,b)=> data[b].created - data[a].created);
  keys.forEach(key => {
    const s = data[key];
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div style="height:180px;background-image:url('${s.imageURL || 'https://via.placeholder.com/400x300'}');background-size:cover;background-position:center;border-radius:8px"></div>
      <div class="meta">
        <h4>${escapeHtml(s.title)}</h4>
        <p>${escapeHtml((s.content||'').slice(0,150))}...</p>
      </div>
    `;
    storiesContainer.appendChild(card);

    if (s.imageURL) {
      const img = document.createElement('img');
      img.src = s.imageURL;
      img.alt = s.title;
      galleryContainer.appendChild(img);
    }
  });
});

function escapeHtml(str){ return String(str||'').replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])); }
