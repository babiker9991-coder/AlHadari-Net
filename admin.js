// admin.js (module)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";
import { getStorage, ref as sRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";
import { firebaseConfig } from "./firebaseConfig.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

// DOM
const loginSection = document.getElementById('loginSection');
const adminSection = document.getElementById('adminSection');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const storyForm = document.getElementById('storyForm');
const storyList = document.getElementById('storyList');
const signOutBtn = document.getElementById('signOutBtn');

// Login submit
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.style.display = 'none';
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  try {
    await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged will handle UI
  } catch (err) {
    loginError.style.display = 'block';
    loginError.textContent = 'خطأ في تسجيل الدخول: ' + (err.message || err);
  }
});

// Sign out
signOutBtn.addEventListener('click', async () => {
  await signOut(auth);
});

// Auth state observer
onAuthStateChanged(auth, user => {
  if (user) {
    loginSection.style.display = 'none';
    adminSection.style.display = 'block';
    loadStoriesList();
  } else {
    loginSection.style.display = 'block';
    adminSection.style.display = 'none';
    storyList.innerHTML = '';
  }
});

// Add story (with image upload)
storyForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('storyTitle').value.trim();
  const content = document.getElementById('storyContent').value.trim();
  const fileInp = document.getElementById('storyImage');
  if (!title || !content) { alert('الرجاء ملء العنوان والنص'); return; }

  let imageURL = '';
  if (fileInp.files && fileInp.files[0]) {
    const file = fileInp.files[0];
    // unique filename to avoid overwriting
    const name = Date.now() + '_' + file.name.replace(/\s+/g,'_');
    const storageReference = sRef(storage, 'stories/' + name);
    try {
      await uploadBytes(storageReference, file);
      imageURL = await getDownloadURL(storageReference);
    } catch (err) {
      alert('فشل رفع الصورة: ' + (err.message || err));
      return;
    }
  }

  const newStory = {
    title,
    content,
    imageURL,
    created: Date.now()
  };

  try {
    await push(ref(db, 'stories'), newStory);
    alert('تم نشر الرواية بنجاح 💖');
    storyForm.reset();
  } catch (err) {
    alert('خطأ عند حفظ الرواية: ' + (err.message || err));
  }
});

// Load list and allow delete
function loadStoriesList(){
  onValue(ref(db, 'stories'), snapshot => {
    storyList.innerHTML = '';
    const data = snapshot.val();
    if (!data) { storyList.innerHTML = '<p>لا توجد روايات</p>'; return; }
    const keys = Object.keys(data).sort((a,b)=> data[b].created - data[a].created);
    keys.forEach(key => {
      const s = data[key];
      const row = document.createElement('div');
      row.className = 'story-row';
      row.innerHTML = `
        <div class="story-thumb" style="background-image:url('${s.imageURL || ''}')"></div>
        <div style="flex:1">
          <div><strong>${escapeHtml(s.title)}</strong></div>
          <div style="font-size:12px;color:#666">${new Date(s.created).toLocaleString()}</div>
        </div>
        <div>
          <button data-id="${key}" class="btn-del">حذف</button>
        </div>
      `;
      const btn = row.querySelector('.btn-del');
      btn.addEventListener('click', async ()=> {
        if (!confirm('هل تريد حذف هذه الرواية؟')) return;
        try {
          await remove(ref(db, 'stories/' + key));
          // Note: image file remains in Storage; you may implement deletion if needed.
        } catch(err) {
          alert('خطأ عند الحذف: ' + (err.message || err));
        }
      });
      storyList.appendChild(row);
    });
  });
}

function escapeHtml(str){ return String(str||'').replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])); }
