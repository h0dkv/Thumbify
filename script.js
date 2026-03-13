import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js';
import { getFirestore, collection, addDoc, onSnapshot, query, serverTimestamp } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js';

// Firebase Configuration & Initialization
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'thumbify-ai';

let currentUser = null;
let activeStyle = 'Gaming';

// 1. AUTHENTICATION SETUP
const initAuth = async () => {
    try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            await signInWithCustomToken(auth, __initial_auth_token);
        } else {
            await signInAnonymously(auth);
        }
    } catch (error) {
        console.error("Auth initialization failed", error);
    }
};

onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (user) {
        console.log("Logged in as:", user.uid);
        // Sync history if we had a dashboard page
    }
});

initAuth();

// PAGE NAVIGATION SYSTEM
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.add('hidden');
        page.classList.remove('active');
    });

    // Show selected page
    const selectedPage = document.getElementById('page-' + pageId);
    if (selectedPage) {
        selectedPage.classList.remove('hidden');
        setTimeout(() => selectedPage.classList.add('active'), 10);
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// AUTH MODAL LOGIC
function toggleAuthModal(show, mode = 'login') {
    const modal = document.getElementById('authModal');
    if (show) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        switchAuthMode(mode);
    } else {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

function switchAuthMode(mode) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (mode === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
    } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
    }
}

async function handleAuth(event, type) {
    event.preventDefault();
    const btn = event.target.querySelector('button');
    const originalText = btn.innerText;

    btn.disabled = true;
    btn.innerText = type === 'login' ? "AUTHENTICATING..." : "INITIALIZING...";

    // In this environment, we use the pre-configured anonymous or token-based auth
    // For a real production app, you would use signInWithEmailAndPassword here
    setTimeout(() => {
        toggleAuthModal(false);
        btn.disabled = false;
        btn.innerText = originalText;
    }, 1000);
}

function scrollToGenerator() {
    document.getElementById('generator').scrollIntoView({ behavior: 'smooth' });
}

function selectStyle(btn, style) {
    document.querySelectorAll('.style-opt').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeStyle = style;
}

// 2. DATABASE INTEGRATION (Firestore)
async function saveGenerationToCloud(title, style, imageUrls) {
    if (!currentUser) return;

    try {
        await addDoc(collection(db, 'artifacts', appId, 'users', currentUser.uid, 'generations'), {
            title: title,
            style: style,
            images: imageUrls,
            createdAt: serverTimestamp()
        });
    } catch (e) {
        console.error("Error saving to database: ", e);
    }
}

function generate() {
    const title = document.getElementById('videoTitle').value;
    if (!title) {
        alert("Please enter a video title first!");
        return;
    }

    const loading = document.getElementById('loading');
    const btn = document.getElementById('genBtn');

    // Show Loading
    loading.classList.remove('hidden');
    btn.disabled = true;
    btn.innerText = "GENERATING...";

    setTimeout(async () => {
        loading.classList.add('hidden');
        btn.disabled = false;
        btn.innerText = "GENERATE THUMBNAILS";

        const results = renderResults(title);

        // Save to Database
        if (currentUser) {
            await saveGenerationToCloud(title, activeStyle, results);
        }
    }, 2500);
}

function renderResults(title) {
    const container = document.getElementById('outputContainer');
    container.innerHTML = '';
    const imageUrls = [];

    for (let i = 0; i < 2; i++) {
        const randomId = Math.floor(Math.random() * 1000);
        const imgUrl = `https://picsum.photos/seed/${randomId}/1280/720`;
        imageUrls.push(imgUrl);

        const card = document.createElement('div');
        card.className = 'thumbnail-result group';
        card.innerHTML = `
            <img src="${imgUrl}" class="w-full h-full object-cover opacity-50 transition duration-500 group-hover:opacity-80">
            <div class="absolute inset-0 flex flex-col items-center justify-center p-8 text-center pointer-events-none">
                <h3 class="text-white font-black italic uppercase drop-shadow-[0_8px_20px_rgba(0,0,0,1)] leading-none" 
                    style="font-size: clamp(1.8rem, 5vw, 3.5rem);">
                    ${title}
                </h3>
            </div>
            <div class="absolute top-4 left-4">
                <span class="badge-style">${activeStyle}</span>
            </div>
            <div class="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition duration-300 translate-y-2 group-hover:translate-y-0">
                <button class="bg-white text-black px-6 py-2 rounded-xl font-black text-xs hover:bg-purple-500 hover:text-white transition" 
                        onclick="window.open('${imgUrl}')">
                    DOWNLOAD 4K PNG
                </button>
            </div>
        `;
        container.appendChild(card);
    }
    return imageUrls;
}