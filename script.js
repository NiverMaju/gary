// ============================================================
// COMENTÁRIOS PÚBLICOS (FIREBASE)
// 1. Crie um projeto no Firebase e ative o Firestore Database.
// 2. Cole abaixo os dados de configuração do seu aplicativo web.
// 3. Troque USE_FIREBASE para true.
// ============================================================
const USE_FIREBASE = false;
const firebaseConfig = {
  apiKey: "COLE_AQUI",
  authDomain: "COLE_AQUI",
  projectId: "COLE_AQUI",
  storageBucket: "COLE_AQUI",
  messagingSenderId: "COLE_AQUI",
  appId: "COLE_AQUI"
};

const form = document.querySelector('#commentForm');
const commentsEl = document.querySelector('#comments');
const textEl = document.querySelector('#commentText');
const countEl = document.querySelector('#charCount');
const toast = document.querySelector('#toast');
const storageKey = 'gary-comments-v1';

function showToast(message){
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2600);
}

function escapeHtml(value=''){
  return value.replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[char]));
}

function formatDate(timestamp){
  return new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short'}).format(new Date(timestamp));
}

function getLocalComments(){
  try { return JSON.parse(localStorage.getItem(storageKey)) || []; }
  catch { return []; }
}
function saveLocalComments(comments){ localStorage.setItem(storageKey, JSON.stringify(comments)); }

function renderComments(comments){
  if(!comments.length){
    commentsEl.innerHTML = '<div class="empty-comments">🐌 Seja a primeira pessoa a deixar um recado para o Gary!</div>';
    return;
  }
  commentsEl.innerHTML = comments.map(comment => `
    <article class="comment">
      <div class="comment-avatar">${escapeHtml(comment.avatar)}</div>
      <div><h4>${escapeHtml(comment.name)}</h4><time>${formatDate(comment.createdAt)}</time><p>${escapeHtml(comment.text)}</p></div>
      <button class="delete-comment" data-id="${comment.id}" title="Apagar comentário" aria-label="Apagar comentário">🗑️</button>
    </article>`).join('');
}

async function startLocalMode(){
  renderComments(getLocalComments());
  form.addEventListener('submit', event => {
    event.preventDefault();
    const name = document.querySelector('#commentName').value.trim();
    const text = textEl.value.trim();
    const avatar = new FormData(form).get('avatar') || '🐌';
    if(!name || !text) return;
    const comments = getLocalComments();
    comments.unshift({id: crypto.randomUUID(), name, text, avatar, createdAt: Date.now()});
    saveLocalComments(comments);
    renderComments(comments);
    form.reset();
    textEl.value = '';
    countEl.textContent = '0/280';
    showToast('Recado publicado para o Gary! 💛');
  });
  commentsEl.addEventListener('click', event => {
    const button = event.target.closest('.delete-comment');
    if(!button) return;
    const comments = getLocalComments().filter(c => c.id !== button.dataset.id);
    saveLocalComments(comments);
    renderComments(comments);
    showToast('Recado apagado.');
  });
}

async function startFirebaseMode(){
  const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js');
  const { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js');
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const ref = collection(db, 'comentarios-gary');
  const q = query(ref, orderBy('createdAt','desc'));
  onSnapshot(q, snapshot => renderComments(snapshot.docs.map(d => ({id:d.id,...d.data(),createdAt:d.data().createdAt?.toMillis?.() || Date.now()}))));
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const name = document.querySelector('#commentName').value.trim();
    const text = textEl.value.trim();
    const avatar = new FormData(form).get('avatar') || '🐌';
    if(!name || !text) return;
    await addDoc(ref,{name,text,avatar,createdAt:serverTimestamp()});
    form.reset(); textEl.value=''; countEl.textContent='0/280'; showToast('Recado publicado para todo mundo! 💛');
  });
  commentsEl.addEventListener('click', async event => {
    const button = event.target.closest('.delete-comment');
    if(!button) return;
    await deleteDoc(doc(db,'comentarios-gary',button.dataset.id));
    showToast('Recado apagado.');
  });
}

textEl.addEventListener('input',()=> countEl.textContent = `${textEl.value.length}/280`);

// Botão alimentar
const feedBtn = document.querySelector('#feedGary');
const feedMsg = document.querySelector('#feedMessage');
const foods = ['Gary ganhou uma folhinha! 🍃','Gary ficou muito feliz! 💛','Nhac, nhac… obrigado! 🐌','Energia para mais uma escalada! 🧗'];
feedBtn.addEventListener('click',()=>{feedMsg.textContent=foods[Math.floor(Math.random()*foods.length)]; showToast('Você alimentou o Gary!');});

// Galeria
const lightbox = document.querySelector('#lightbox');
const lightboxImage = document.querySelector('#lightboxImage');
document.querySelectorAll('.gallery-item').forEach(item=>item.addEventListener('click',()=>{lightboxImage.src=item.dataset.src;lightbox.showModal();}));
document.querySelector('#closeLightbox').addEventListener('click',()=>lightbox.close());
lightbox.addEventListener('click',e=>{if(e.target===lightbox)lightbox.close();});

// Bolhas decorativas
const bubbleArea = document.querySelector('.bubbles');
for(let i=0;i<22;i++){
  const b=document.createElement('span'); b.className='bubble';
  const size=8+Math.random()*34;
  Object.assign(b.style,{width:`${size}px`,height:`${size}px`,left:`${Math.random()*100}%`,animationDuration:`${8+Math.random()*12}s`,animationDelay:`${Math.random()*-14}s`,opacity:.15+Math.random()*.35});
  bubbleArea.appendChild(b);
}

(USE_FIREBASE ? startFirebaseMode() : startLocalMode()).catch(error=>{console.error(error);startLocalMode();});
