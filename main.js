const CONFIG = {
    imageBase: "assets/images/",
    optimizedImageBase: "assets/images/optimized/",
    petalIcon: "assets/icon.png",
    youtubeVideoId: "Jj5fYymqgUk",
    images: [
        "01.webp",
        "02.webp",
        "03.webp",
        "04.webp",
        "05.webp",
        "06.webp",
        "07.webp",
        "08.webp",
        "09.webp",
        "10.webp",
        "11.webp",
        "12.webp",
        "13.webp"
    ],
    captions: [
        "Some moments only need one glance to become a whole season of love.",
        "Today becomes a memory, and tomorrow becomes the story we keep telling.",
        "A single look can turn an ordinary day into something radiant.",
        "The most beautiful thing is having someone beside you through every season.",
        "Love is choosing to keep the quiet, simple things together."
    ]
};

const state = {
    currentIndex: 0,
    albumIndex: 0,
    videoStarted: false,
    albumPointerStartX: 0,
    albumPointerStartY: 0,
    albumPointerId: null,
    albumTouchStartX: 0,
    albumTouchStartY: 0,
    lightboxPointerStartX: 0,
    lightboxPointerStartY: 0,
    lightboxPointerId: null,
    lightboxTouchStartX: 0,
    lightboxTouchStartY: 0,
    lightboxSwipeLockedUntil: 0,
    albumTurning: false,
    albumSwipeLockedUntil: 0,
    albumRequestedFullscreen: false,
    albumOrientationLocked: false,
    albumOrientationFallback: false,
    imagePreloadCache: new Map()
};

const BOOK_TURN_MS = 760;

const ALBUM_LAYOUT_TEMPLATES = [
    {
        left: { title: "", label: "", layout: "psd-first-left", caption: "" },
        right: { title: "SERENOIR", label: "The Softness Within", layout: "psd-first-right", caption: "Love unfolds quietly in the smallest moments, in shared glances, soft laughter, and the comfort of simply being beside one another.", footer: "NEW COLLECTION" }
    },
    {
        left: { title: "", label: "", layout: "psd-layout-two-left", caption: "" },
        right: { title: "ROSELUINE", label: "#Mood\n#Roselune", layout: "psd-layout-two-right", caption: "Love becomes beautiful when we grow gently together.", showCopy: true, ornament: "" }
    },
    {
        left: { title: "MEADOW", label: "Nu e.", layout: "psd-layout-three-left", caption: "With you, even the simplest days become extraordinary. A walk in the park, a shared meal, or a quiet evening together. These moments become treasures that I hold close to my heart. Love is the patience to listen, the kindness to understand.", showCopy: true, ornament: "" },
        right: { title: "", label: "", layout: "psd-layout-three-right", caption: "" }
    },
    {
        left: { title: "Notre lien d'amour", label: "Love is the key that opens every season.", layout: "psd-layout-four-left", imageCount: 2, caption: "The heart remembers the quiet vows, the warm light, and the gentle promise of walking beside one another.", showCopy: true, ornament: "" },
        right: { title: "", label: "", layout: "psd-layout-four-right", caption: "" }
    },
    {
        left: { title: "", label: "", layout: "psd-layout-five-left", caption: "" },
        right: { title: "GENTLE ROMANCE", label: "NEW SEASON", layout: "psd-layout-five-right", caption: "Every glance becomes endless. A touchless tune waits alone under soft rhythm, creating a love story written softly through time, light, and endless devotion. Love quietly changes everything, softening even difficult days through the warmth of choosing someone over and over again.", showCopy: true, ornament: "" }
    },
    {
        left: { title: "", label: "", layout: "psd-layout-six-left", caption: "" },
        right: { title: "COME MY WAY", label: "", layout: "psd-layout-six-right", caption: "Some people enter our lives briefly, while others slowly become a permanent part of our hearts, bringing warmth, peace, and a feeling of home we never wish to lose.", showCopy: true, ornament: "--", footer: "Newseason....." }
    },
    {
        left: { title: "Always Go", label: "IN THIS STORY", layout: "psd-layout-seven-left", imageCount: 2, caption: "I see my future in your eyes. And I see hope in the skies. I'll be with you forever. We will always be together.", showCopy: true, ornament: "" },
        right: { title: "", label: "", layout: "psd-layout-seven-right", caption: "" }
    },
    {
        left: { title: "", label: "", layout: "psd-layout-eight-left", caption: "" },
        right: { title: "ONLY\nYOU", label: "", layout: "psd-layout-eight-right", imageCount: 2, caption: "I was made and meant to look for you and wait for you and become yours forever.", showCopy: true, ornament: "" }
    },
    {
        left: { title: "", label: "", layout: "psd-layout-nine-left", caption: "" },
        right: { title: "EVERY\nTIME", label: "I see you", layout: "psd-layout-nine-right", imageCount: 2, caption: "I come here with no expectations, only to profess, now that I am at liberty to do so, that my heart is and always will be yours.", showCopy: true, ornament: "" }
    },
    {
        left: { title: "LOVE YOUR", label: "EVERYTHING", layout: "psd-layout-ten-left", imageCount: 3, caption: "You are my soul mate, my sweetheart, you are my dream come true, from now until the end of time I give my heart and soul to you.", showCopy: true, ornament: "It was\nalways\nyou." },
        right: { title: "", label: "", layout: "psd-layout-ten-right", caption: "" }
    }
];

function albumMark(index) {
    return String(index + 1).padStart(2, "0");
}

function createAlbumPhotoPage(template, imageIndexes) {
    const images = Array.isArray(imageIndexes) ? imageIndexes : [imageIndexes];

    return {
        ...template,
        images,
        mark: albumMark(images[0] || 0)
    };
}

function createAlbumEndPage(markIndex) {
    return {
        title: "End",
        label: "The story continues",
        layout: "psd-album-end",
        images: [],
        caption: "Thank you for keeping these memories close.",
        showCopy: true,
        ornament: "",
        footer: "CINO MEMORY ALBUM",
        mark: albumMark(markIndex)
    };
}

function buildAlbumSpreads() {
    const spreads = [];
    const totalImages = CONFIG.images.length;
    let imageIndex = 0;

    while (imageIndex < totalImages) {
        const template = ALBUM_LAYOUT_TEMPLATES[spreads.length % ALBUM_LAYOUT_TEMPLATES.length];
        const leftCount = template.left.imageCount || 1;
        const rightCount = template.right.imageCount || 1;
        const leftImages = [];
        const rightImages = [];

        while (leftImages.length < leftCount && imageIndex < totalImages) {
            leftImages.push(imageIndex);
            imageIndex += 1;
        }

        while (rightImages.length < rightCount && imageIndex < totalImages) {
            rightImages.push(imageIndex);
            imageIndex += 1;
        }

        spreads.push({
            left: createAlbumPhotoPage(template.left, leftImages),
            right: rightImages.length
                ? createAlbumPhotoPage(template.right, rightImages)
                : createAlbumEndPage(imageIndex)
        });
    }

    return spreads.length
        ? spreads
        : [{ left: createAlbumEndPage(0), right: createAlbumEndPage(1) }];
}

const ALBUM_SPREADS = buildAlbumSpreads();

const els = {
    music: document.getElementById("bgMusic"),
    musicToggle: document.getElementById("musicToggle"),
    musicIcon: document.getElementById("musicIcon"),
    heroPlay: document.getElementById("heroPlay"),
    galleryGrid: document.getElementById("galleryGrid"),
    photoTemplate: document.getElementById("photoCardTemplate"),
    lightbox: document.getElementById("lightbox"),
    lightboxImage: document.getElementById("lightboxImage"),
    imageCaption: document.getElementById("imageCaption"),
    closeLightbox: document.getElementById("closeLightbox"),
    prevImage: document.getElementById("prevImage"),
    nextImage: document.getElementById("nextImage"),
    downloadCurrent: document.getElementById("downloadCurrent"),
    albumCover: document.getElementById("albumCover"),
    albumViewer: document.getElementById("albumViewer"),
    closeAlbum: document.getElementById("closeAlbum"),
    albumStage: document.getElementById("albumStage"),
    albumSpread: document.getElementById("albumSpread"),
    albumPrev: document.getElementById("albumPrev"),
    albumNext: document.getElementById("albumNext"),
    albumCounter: document.getElementById("albumCounter"),
    videoFrame: document.getElementById("videoFrame"),
    videoPlaceholder: document.getElementById("videoPlaceholder"),
    nativeShare: document.getElementById("nativeShare"),
    zaloShare: document.getElementById("zaloShare"),
    facebookShare: document.getElementById("facebookShare"),
    telegramShare: document.getElementById("telegramShare"),
    copyLink: document.getElementById("copyLink"),
    petalLayer: document.getElementById("petalLayer")
};

function imageUrl(file) {
    const optimizedName = file.replace(/\.(jpe?g|png)$/i, ".webp");
    return `${CONFIG.optimizedImageBase}${optimizedName}`;
}

function originalImageUrl(file) {
    return `${CONFIG.imageBase}${file}`;
}

function captionFor(index) {
    return CONFIG.captions[index % CONFIG.captions.length];
}

function preloadImage(index) {
    const total = CONFIG.images.length;
    const normalizedIndex = (index + total) % total;
    const file = CONFIG.images[normalizedIndex];
    const src = imageUrl(file);

    if (state.imagePreloadCache.has(src)) {
        return state.imagePreloadCache.get(src).ready;
    }

    const image = new Image();
    image.decoding = "async";
    image.loading = "eager";
    image.fetchPriority = "high";
    image.src = src;

    const ready = (image.decode ? image.decode() : Promise.resolve())
        .catch(() => undefined);

    state.imagePreloadCache.set(src, { image, ready });
    return ready;
}

function cachedImageForIndex(index) {
    const total = CONFIG.images.length;
    const normalizedIndex = (index + total) % total;
    const file = CONFIG.images[normalizedIndex];
    const src = imageUrl(file);

    return state.imagePreloadCache.get(src)?.image || null;
}

function applyPhotoMetrics(figure, image) {
    if (!image?.naturalWidth || !image?.naturalHeight) return false;

    figure.style.setProperty("--photo-ratio", `${image.naturalWidth} / ${image.naturalHeight}`);
    figure.classList.toggle("photo-landscape", image.naturalWidth > image.naturalHeight);
    figure.classList.toggle("photo-portrait", image.naturalHeight >= image.naturalWidth);
    return true;
}

function spreadImageIndexes(spreadIndex) {
    const spread = ALBUM_SPREADS[spreadIndex];
    if (!spread) return [];
    return [...spread.left.images, ...spread.right.images];
}

function preloadAlbumSpreadImages(spreadIndex) {
    return Promise.all(spreadImageIndexes(spreadIndex).map((index) => preloadImage(index)));
}

function allAlbumImageIndexes() {
    const albumImageIndexes = new Set();
    ALBUM_SPREADS.forEach((spread) => {
        [...spread.left.images, ...spread.right.images].forEach((index) => albumImageIndexes.add(index));
    });

    return [...albumImageIndexes];
}

function preloadAllAlbumImages() {
    return Promise.all(allAlbumImageIndexes().map((index) => preloadImage(index)));
}

function warmAlbumImages(spreadIndex = state.albumIndex) {
    const preloadSet = new Set();
    [0, 1, 2, -1].forEach((offset) => {
        const spread = ALBUM_SPREADS[spreadIndex + offset];
        if (!spread) return;
        [...spread.left.images, ...spread.right.images].forEach((index) => preloadSet.add(index));
    });

    preloadSet.forEach((index) => preloadImage(index));
}

function warmAlbumImagesSoon(spreadIndex = state.albumIndex) {
    warmAlbumImages(spreadIndex);
    window.requestIdleCallback?.(() => warmAlbumImages(spreadIndex), { timeout: 900 });
}

function warmAllAlbumImagesSoon() {
    const preloadAll = () => {
        allAlbumImageIndexes().forEach((index, order) => {
            window.setTimeout(() => preloadImage(index), order * 45);
        });
    };

    if (window.requestIdleCallback) {
        window.requestIdleCallback(preloadAll, { timeout: 1200 });
        return;
    }

    window.setTimeout(preloadAll, 600);
}

function preloadNextAlbumSpread(spreadIndex = state.albumIndex) {
    warmAlbumImages(spreadIndex);
    warmAlbumImages(spreadIndex + 1);
}

function createCaptionCard(index) {
    const card = document.createElement("article");
    card.className = "caption-card";
    const quote = document.createElement("blockquote");
    quote.textContent = captionFor(index);
    card.append(quote);
    return card;
}

function renderGallery() {
    CONFIG.images.forEach((file, index) => {
        if (index > 0 && index % 6 === 0) {
            els.galleryGrid.append(createCaptionCard(index / 6));
        }

        const fragment = els.photoTemplate.content.cloneNode(true);
        const card = fragment.querySelector(".photo-card");
        const image = fragment.querySelector("img");
        const openButton = fragment.querySelector(".photo-open");

        image.src = imageUrl(file);
        image.alt = `Ảnh kỷ niệm ${index + 1}`;
        image.decoding = "async";
        image.onerror = () => card.remove();
        openButton.addEventListener("click", () => openLightbox(index));
        fragment.querySelector(".photo-index").textContent = String(index + 1).padStart(2, "0");

        els.galleryGrid.append(fragment);
    });
}

function setupScrollReveal() {
    const targets = [
        ...document.querySelectorAll(".photo-card, .caption-card, .album-cover, .video-frame, .share-card")
    ];

    if (!targets.length) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    targets.forEach((target, index) => {
        target.classList.add("reveal-slide");
        target.style.setProperty("--reveal-delay", `${Math.min((index % 8) * 45, 240)}ms`);
    });

    if (reducedMotion || !("IntersectionObserver" in window)) {
        targets.forEach((target) => target.classList.add("is-visible"));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
        });
    }, {
        rootMargin: "0px 0px -8% 0px",
        threshold: .12
    });

    targets.forEach((target) => observer.observe(target));
}

function openLightbox(index) {
    state.currentIndex = index;
    renderLightbox();
    if (!els.lightbox.open) els.lightbox.showModal();
}

function closeLightbox() {
    els.lightbox.close();
}

function showOffsetImage(offset) {
    state.currentIndex = (state.currentIndex + offset + CONFIG.images.length) % CONFIG.images.length;
    renderLightbox();
}

function handleLightboxSwipe(deltaX, deltaY) {
    const now = performance.now();
    if (now < state.lightboxSwipeLockedUntil) return;
    if (Math.abs(deltaX) < 36 || Math.abs(deltaX) < Math.abs(deltaY) * 1.1) return;

    state.lightboxSwipeLockedUntil = now + 260;
    showOffsetImage(deltaX < 0 ? 1 : -1);
}

function renderLightbox() {
    const file = CONFIG.images[state.currentIndex];
    els.lightboxImage.src = imageUrl(file);
    els.lightboxImage.alt = `Ảnh kỷ niệm ${state.currentIndex + 1}`;
    els.imageCaption.textContent = captionFor(state.currentIndex);
    els.downloadCurrent.dataset.file = file;
    els.downloadCurrent.dataset.url = originalImageUrl(file);
}

function downloadFileName(file) {
    return `memory-${String(state.currentIndex + 1).padStart(2, "0")}-${file}`;
}

function triggerDownload(url, fileName) {
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.rel = "noopener";
    document.body.append(link);
    link.click();
    link.remove();
}

async function downloadCurrentImage() {
    const file = CONFIG.images[state.currentIndex];
    const url = originalImageUrl(file);
    const fileName = downloadFileName(file);

    els.downloadCurrent.disabled = true;
    els.downloadCurrent.classList.add("is-downloading");

    try {
        const response = await fetch(url, { cache: "force-cache" });
        if (!response.ok) throw new Error(`Download failed: ${response.status}`);

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        triggerDownload(objectUrl, fileName);
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1200);
    } catch {
        triggerDownload(url, fileName);
    } finally {
        els.downloadCurrent.disabled = false;
        els.downloadCurrent.classList.remove("is-downloading");
    }
}

function createAlbumPage(pageData, side) {
    const page = document.createElement("article");
    page.className = `album-page album-page-${side} album-layout-${pageData.layout}`;

    const header = document.createElement("div");
    header.className = "album-page-header";
    const title = document.createElement("h3");
    const subtitle = document.createElement("span");

    title.textContent = pageData.title;
    subtitle.textContent = pageData.label;
    header.append(title, subtitle);

    const grid = document.createElement("div");
    grid.className = `album-photo-grid album-photo-grid-${pageData.images.length}`;

    pageData.images.forEach((imageIndex, itemIndex) => {
        const figure = document.createElement("figure");
        figure.className = `album-photo album-photo-${itemIndex + 1}`;
        const image = document.createElement("img");

        image.src = imageUrl(CONFIG.images[imageIndex % CONFIG.images.length]);
        image.alt = `Ảnh album ${imageIndex + 1}`;
        image.decoding = "async";
        image.loading = "eager";
        if (!applyPhotoMetrics(figure, cachedImageForIndex(imageIndex))) {
            image.addEventListener("load", () => {
                applyPhotoMetrics(figure, image);
            }, { once: true });
        }

        figure.append(image);
        grid.append(figure);
    });

    page.append(header, grid);

    if (pageData.showCopy || pageData.footer) {
        const quote = document.createElement("p");
        quote.className = "album-page-copy";
        quote.textContent = `“${pageData.caption}”`;

        page.append(quote);

        if (pageData.ornament !== "") {
            const divider = document.createElement("span");
            divider.className = "album-page-ornament";
            divider.textContent = pageData.ornament || "***";
            page.append(divider);
        }

        if (pageData.footer) {
            const footer = document.createElement("small");
            footer.className = "album-page-footer";
            footer.textContent = pageData.footer;
            page.append(footer);
        }
    }

    return page;
}

function renderAlbumSpread() {
    const spread = ALBUM_SPREADS[state.albumIndex];
    els.albumSpread.innerHTML = "";
    els.albumSpread.classList.remove("turn-next", "turn-prev", "is-turning");
    els.albumSpread.append(
        createAlbumPage(spread.left, "left"),
        createAlbumPage(spread.right, "right")
    );

    els.albumPrev.disabled = state.albumIndex === 0;
    els.albumNext.disabled = state.albumIndex === ALBUM_SPREADS.length - 1;
    els.albumCounter.textContent = `Tờ ${state.albumIndex + 1} / ${ALBUM_SPREADS.length}`;
    preloadNextAlbumSpread();
    warmAlbumImagesSoon(state.albumIndex + 1);
}

function createTurnFace(pageData, side, faceClass) {
    const face = document.createElement("div");
    face.className = `album-turn-face ${faceClass}`;
    face.append(createAlbumPage(pageData, side));
    return face;
}

function createUnderPage(pageData, side) {
    const wrapper = document.createElement("div");
    wrapper.className = `album-under-page album-under-${side}`;
    wrapper.append(createAlbumPage(pageData, side));
    return wrapper;
}

function createTransitionPage(pageData, side, className) {
    const wrapper = document.createElement("div");
    wrapper.className = `${className} album-layer-${side}`;
    wrapper.append(createAlbumPage(pageData, side));
    return wrapper;
}

function prepareBookTurn(offset, nextIndex) {
    const currentSpread = ALBUM_SPREADS[state.albumIndex];
    const nextSpread = ALBUM_SPREADS[nextIndex];

    if (offset > 0) {
        els.albumSpread.append(createUnderPage(nextSpread.right, "right"));
        els.albumSpread.append(
            createTransitionPage(currentSpread.right, "right", "album-fold-page album-fold-next"),
            createTransitionPage(nextSpread.left, "left", "album-reveal-page album-reveal-next")
        );
    } else {
        els.albumSpread.append(createUnderPage(nextSpread.left, "left"));
        els.albumSpread.append(
            createTransitionPage(currentSpread.left, "left", "album-fold-page album-fold-prev"),
            createTransitionPage(nextSpread.right, "right", "album-reveal-page album-reveal-prev")
        );
    }
}

function isMobileAlbumDevice() {
    return window.matchMedia("(max-width: 820px), (pointer: coarse)").matches;
}

function isPortraitViewport() {
    return window.innerHeight > window.innerWidth;
}

function setAlbumLandscapeFallback(active) {
    state.albumOrientationFallback = active;
    document.body.classList.toggle("album-rotation-active", active);
    els.albumViewer.classList.toggle("album-viewer-rotated", active);
}

function syncAlbumLandscapeFallback() {
    const shouldRotate = els.albumViewer.open
        && isMobileAlbumDevice()
        && isPortraitViewport()
        && !state.albumOrientationLocked;

    setAlbumLandscapeFallback(shouldRotate);
}

async function lockScreenLandscape() {
    if (!screen.orientation?.lock) return false;

    try {
        await screen.orientation.lock("landscape-primary");
        return true;
    } catch {
        try {
            await screen.orientation.lock("landscape");
            return true;
        } catch {
            return false;
        }
    }
}

async function requestAlbumFullscreen() {
    if (document.fullscreenElement) return true;

    const targets = [els.albumViewer, document.documentElement]
        .filter((target, index, list) => target?.requestFullscreen && list.indexOf(target) === index);

    if (!targets.length) return false;

    for (const target of targets) {
        try {
            await target.requestFullscreen({ navigationUI: "hide" });
            state.albumRequestedFullscreen = true;
            return true;
        } catch {
            state.albumRequestedFullscreen = false;
        }
    }

    return false;
}

async function requestAlbumLandscape() {
    if (!isMobileAlbumDevice()) return;

    setAlbumLandscapeFallback(false);

    await requestAlbumFullscreen();
    state.albumOrientationLocked = await lockScreenLandscape();

    if (!state.albumOrientationLocked) syncAlbumLandscapeFallback();
}

function releaseAlbumLandscape() {
    setAlbumLandscapeFallback(false);

    if (state.albumOrientationLocked && screen.orientation?.unlock) {
        screen.orientation.unlock();
    }

    state.albumOrientationLocked = false;

    if (state.albumRequestedFullscreen && document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => undefined);
    }

    state.albumRequestedFullscreen = false;
}

function openAlbum() {
    state.albumIndex = 0;
    if (!els.albumViewer.open) els.albumViewer.showModal();
    void requestAlbumLandscape();
    preloadNextAlbumSpread(0);
    void preloadAllAlbumImages();
    void preloadAlbumSpreadImages(0);
    void preloadAlbumSpreadImages(1);
    void preloadAlbumSpreadImages(2);
    renderAlbumSpread();
    warmAllAlbumImagesSoon();
    warmAlbumImagesSoon(1);
}

function closeAlbum() {
    if (els.albumViewer.open) els.albumViewer.close();
    releaseAlbumLandscape();
}

async function turnAlbum(offset) {
    if (state.albumTurning) return;

    const nextIndex = state.albumIndex + offset;
    if (nextIndex < 0 || nextIndex >= ALBUM_SPREADS.length) return;

    state.albumTurning = true;
    try {
        els.albumSpread.classList.add("is-preparing");
        preloadNextAlbumSpread(nextIndex);
        void preloadAlbumSpreadImages(state.albumIndex);
        await preloadAlbumSpreadImages(nextIndex);
        els.albumSpread.classList.remove("is-preparing");
        els.albumSpread.classList.remove("turn-next", "turn-prev", "is-turning");
        els.albumSpread.querySelectorAll(".album-turn-sheet, .album-under-page, .album-fold-page, .album-reveal-page").forEach((node) => node.remove());
        prepareBookTurn(offset, nextIndex);
        void els.albumSpread.offsetWidth;
        els.albumSpread.classList.add("is-turning", offset > 0 ? "turn-next" : "turn-prev");

        window.setTimeout(() => {
            state.albumIndex = nextIndex;
            renderAlbumSpread();
            preloadNextAlbumSpread(nextIndex + offset);
            warmAlbumImagesSoon(nextIndex + offset);
            void preloadAlbumSpreadImages(nextIndex + offset);
            state.albumTurning = false;
        }, BOOK_TURN_MS);
    } catch {
        els.albumSpread.classList.remove("is-preparing");
        state.albumTurning = false;
    }
}

function handleAlbumSwipe(deltaX, deltaY) {
    const now = performance.now();
    if (now < state.albumSwipeLockedUntil) return;

    const axisDelta = state.albumOrientationFallback ? deltaY : deltaX;
    const crossDelta = state.albumOrientationFallback ? deltaX : deltaY;
    if (Math.abs(axisDelta) < 42 || Math.abs(axisDelta) < Math.abs(crossDelta) * 1.15) return;

    state.albumSwipeLockedUntil = now + BOOK_TURN_MS + 80;
    turnAlbum(axisDelta < 0 ? 1 : -1);
}

async function startMusic() {
    try {
        els.music.muted = false;
        await els.music.play();
        els.musicIcon.textContent = "♫";
        els.heroPlay.textContent = "Tạm dừng nhạc";
    } catch {
        els.musicIcon.textContent = "♪";
    }
}

function toggleMusic() {
    if (els.music.paused) {
        startMusic();
    } else {
        els.music.pause();
        els.musicIcon.textContent = "♪";
        els.heroPlay.textContent = "Phát nhạc";
    }
}

function startPetals() {
    const createPetal = () => {
        const petal = document.createElement("img");
        const size = Math.round(Math.random() * 18 + 18);

        petal.className = "petal";
        petal.src = CONFIG.petalIcon;
        petal.alt = "";
        petal.style.left = `${Math.random() * 100}vw`;
        petal.style.setProperty("--size", `${size}px`);
        petal.style.setProperty("--drift", `${Math.random() * 170 - 85}px`);
        petal.style.setProperty("--duration", `${Math.random() * 8 + 9}s`);

        els.petalLayer.append(petal);
        setTimeout(() => petal.remove(), 18000);
    };

    for (let i = 0; i < 10; i += 1) setTimeout(createPetal, i * 260);
    setInterval(createPetal, 900);
}

function setupVideoAutoplay() {
    const observer = new IntersectionObserver((entries) => {
        const visible = entries.some((entry) => entry.isIntersecting);
        if (!visible || state.videoStarted) return;

        state.videoStarted = true;
        const iframe = document.createElement("iframe");
        iframe.title = "Video kỷ niệm";
        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
        iframe.allowFullscreen = true;
        iframe.referrerPolicy = "strict-origin-when-cross-origin";
        iframe.src = `https://www.youtube.com/embed/${CONFIG.youtubeVideoId}?feature=oembed&autoplay=1&mute=1&playsinline=1&rel=0`;
        els.videoFrame.append(iframe);
        els.videoPlaceholder.remove();
        observer.disconnect();
    }, { threshold: .45 });

    observer.observe(els.videoFrame);
}

function setupShareLinks() {
    const url = window.location.href.split("#")[0];
    const title = document.title;

    els.zaloShare.href = `https://zalo.me/share?url=${encodeURIComponent(url)}`;
    els.facebookShare.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    els.telegramShare.href = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;

    els.nativeShare.addEventListener("click", async () => {
        if (navigator.share) {
            await navigator.share({ title, url });
            return;
        }
        await navigator.clipboard.writeText(url);
        els.nativeShare.textContent = "Đã sao chép";
        setTimeout(() => { els.nativeShare.textContent = "Chia sẻ nhanh"; }, 1600);
    });

    els.copyLink.addEventListener("click", async () => {
        await navigator.clipboard.writeText(url);
        els.copyLink.textContent = "Đã sao chép";
        setTimeout(() => { els.copyLink.textContent = "Sao chép link"; }, 1600);
    });
}

function setupEvents() {
    els.musicToggle.addEventListener("click", toggleMusic);
    els.heroPlay.addEventListener("click", toggleMusic);
    document.addEventListener("pointerdown", startMusic, { once: true });
    document.addEventListener("keydown", startMusic, { once: true });

    els.closeLightbox.addEventListener("click", closeLightbox);
    els.prevImage.addEventListener("click", () => showOffsetImage(-1));
    els.nextImage.addEventListener("click", () => showOffsetImage(1));
    els.downloadCurrent.addEventListener("click", downloadCurrentImage);
    els.lightboxImage.addEventListener("dragstart", (event) => event.preventDefault());
    els.lightbox.addEventListener("click", (event) => {
        if (event.target === els.lightbox) closeLightbox();
    });

    if ("PointerEvent" in window) {
        els.lightboxImage.addEventListener("pointerdown", (event) => {
            if (event.pointerType === "mouse" && event.button !== 0) return;
            state.lightboxPointerId = event.pointerId;
            state.lightboxPointerStartX = event.clientX;
            state.lightboxPointerStartY = event.clientY;
            els.lightboxImage.setPointerCapture?.(event.pointerId);
        });
        els.lightboxImage.addEventListener("pointerup", (event) => {
            if (state.lightboxPointerId !== event.pointerId) return;

            const deltaX = event.clientX - state.lightboxPointerStartX;
            const deltaY = event.clientY - state.lightboxPointerStartY;
            state.lightboxPointerId = null;

            handleLightboxSwipe(deltaX, deltaY);
        });
        els.lightboxImage.addEventListener("pointercancel", () => {
            state.lightboxPointerId = null;
        });
    } else {
        els.lightboxImage.addEventListener("touchstart", (event) => {
            const touch = event.changedTouches[0];
            state.lightboxTouchStartX = touch.clientX;
            state.lightboxTouchStartY = touch.clientY;
        }, { passive: true });
        els.lightboxImage.addEventListener("touchend", (event) => {
            const touch = event.changedTouches[0];
            const deltaX = touch.clientX - state.lightboxTouchStartX;
            const deltaY = touch.clientY - state.lightboxTouchStartY;

            handleLightboxSwipe(deltaX, deltaY);
        }, { passive: true });
    }

    document.addEventListener("keydown", (event) => {
        if (!els.lightbox.open) return;
        if (event.key === "ArrowLeft") showOffsetImage(-1);
        if (event.key === "ArrowRight") showOffsetImage(1);
    });

    els.albumCover.addEventListener("click", openAlbum);
    els.closeAlbum.addEventListener("click", closeAlbum);
    els.albumPrev.addEventListener("click", () => turnAlbum(-1));
    els.albumNext.addEventListener("click", () => turnAlbum(1));
    els.albumViewer.addEventListener("click", (event) => {
        if (event.target === els.albumViewer) closeAlbum();
    });
    els.albumViewer.addEventListener("close", releaseAlbumLandscape);
    document.addEventListener("fullscreenchange", () => {
        if (!document.fullscreenElement) {
            state.albumRequestedFullscreen = false;
            state.albumOrientationLocked = false;
            syncAlbumLandscapeFallback();
        }
    });
    window.addEventListener("resize", syncAlbumLandscapeFallback);
    window.addEventListener("orientationchange", () => {
        setTimeout(syncAlbumLandscapeFallback, 260);
    });
    els.albumStage.addEventListener("dragstart", (event) => event.preventDefault());

    if ("PointerEvent" in window) {
        els.albumStage.addEventListener("pointerdown", (event) => {
            if (event.pointerType === "mouse" && event.button !== 0) return;
            state.albumPointerId = event.pointerId;
            state.albumPointerStartX = event.clientX;
            state.albumPointerStartY = event.clientY;
            els.albumStage.setPointerCapture?.(event.pointerId);
        });
        els.albumStage.addEventListener("pointerup", (event) => {
            if (state.albumPointerId !== event.pointerId) return;

            const deltaX = event.clientX - state.albumPointerStartX;
            const deltaY = event.clientY - state.albumPointerStartY;
            state.albumPointerId = null;

            handleAlbumSwipe(deltaX, deltaY);
        });
        els.albumStage.addEventListener("pointercancel", () => {
            state.albumPointerId = null;
        });
    } else {
        els.albumStage.addEventListener("touchstart", (event) => {
            const touch = event.changedTouches[0];
            state.albumTouchStartX = touch.clientX;
            state.albumTouchStartY = touch.clientY;
        }, { passive: true });
        els.albumStage.addEventListener("touchend", (event) => {
            const touch = event.changedTouches[0];
            const deltaX = touch.clientX - state.albumTouchStartX;
            const deltaY = touch.clientY - state.albumTouchStartY;

            handleAlbumSwipe(deltaX, deltaY);
        }, { passive: true });
    }

    document.addEventListener("keydown", (event) => {
        if (!els.albumViewer.open || event.repeat) return;
        if (event.key === "ArrowLeft") turnAlbum(-1);
        if (event.key === "ArrowRight") turnAlbum(1);
    });
}

function init() {
    renderGallery();
    setupScrollReveal();
    preloadNextAlbumSpread(0);
    void preloadAlbumSpreadImages(0);
    void preloadAlbumSpreadImages(1);
    void preloadAlbumSpreadImages(2);
    void preloadAlbumSpreadImages(3);
    warmAlbumImagesSoon(0);
    warmAllAlbumImagesSoon();
    setupEvents();
    setupVideoAutoplay();
    setupShareLinks();
    startPetals();
    startMusic();

    if (window.location.hash) {
        setTimeout(() => {
            document.querySelector(window.location.hash)?.scrollIntoView({ block: "start" });
        }, 700);
    }
}

init();
