let activeStyle = 'Gaming';

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

    // Update Nav Links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('text-purple-500');
    });

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function scrollToGenerator() {
    const generator = document.getElementById('generator');
    generator.scrollIntoView({ behavior: 'smooth' });
}

function selectStyle(btn, style) {
    document.querySelectorAll('.style-opt').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeStyle = style;
}

function generate() {
    const title = document.getElementById('videoTitle').value;
    if (!title) {
        // Custom message box instead of alert for tech feel
        const container = document.getElementById('outputContainer');
        container.innerHTML = `
            <div class="bg-red-500/10 border border-red-500/50 p-4 rounded-xl text-red-500 text-xs font-bold uppercase tracking-widest text-center">
                System Error: Input Title String Required.
            </div>
        `;
        return;
    }

    const loading = document.getElementById('loading');
    const btn = document.getElementById('genBtn');

    // Show Loading
    loading.classList.remove('hidden');
    btn.disabled = true;
    btn.innerText = "PROCESSING...";

    setTimeout(() => {
        loading.classList.add('hidden');
        btn.disabled = false;
        btn.innerText = "GENERATE THUMBNAILS";
        renderResults(title);
    }, 2500);
}

function renderResults(title) {
    const container = document.getElementById('outputContainer');
    container.innerHTML = ''; // Clear empty state

    for (let i = 0; i < 2; i++) {
        const randomId = Math.floor(Math.random() * 1000);
        const imgUrl = `https://picsum.photos/seed/${randomId}/1280/720`;

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
}