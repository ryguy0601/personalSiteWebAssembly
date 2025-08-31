// imgConverter2.js

const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');

const previewWrapper = document.querySelector('.preview-wrapper');

const previewImageOriginal = document.getElementById('preview-image-original');
const previewImageConverted = document.getElementById('preview-image-converted');

const controls = document.querySelector('.controls');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const zoomRange = document.getElementById('zoom-range');
const imageCounter = document.getElementById('image-counter');

const formatSelect = document.getElementById('format-select');
const compressSlider = document.getElementById('compress-slider');
const revealSliderVertical = document.getElementById('reveal-slider-vertical');

const originalFileSizeLabel = document.getElementById('original-file-size');
const convertedFileSizeLabel = document.getElementById('converted-file-size');

const dropdown = document.querySelector('.dropdown');
const dropdownBtn = document.getElementById('download-btn');
const dropdownArrow = dropdownBtn.querySelector('.dropdown-arrow');
const dropdownMenu = dropdown.querySelector('.dropdown-menu');
const downloadAllBtn = document.getElementById('download-all-btn');

let images = [];
let convertedBlobs = [];  // Store blobs of converted images to enable download all
let currentIndex = 0;
let lastRevealClipLeft = null;
let lastRevealClipRight = null;

// Single pan & zoom state shared by both images
let state = {
    scale: 1,
    pos: { x: 0, y: 0 },
    drag: { active: false, startX: 0, startY: 0, originX: 0, originY: 0 }
};

// -- Drag & Drop and File Input --

dropZone.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', () => {
    const files = Array.from(fileInput.files);
    if (files.length) handleNewFiles(files);
});

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#66b2ff';
});
dropZone.addEventListener('dragleave', () => {
    dropZone.style.borderColor = '#0d6efd';
});
dropZone.addEventListener("drop", e => {
    e.preventDefault();
    dropZone.style.borderColor = '#0d6efd';
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    if (files.length > 0) handleNewFiles(files);
});

async function handleNewFiles(files) {
    const processedFiles = await Promise.all(files.map(async file => {
        const isHEIC = file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic');

        if (isHEIC) {
            try {
                const convertedBlob = await heic2any({
                    blob: file,
                    toType: 'image/jpeg',
                    quality: 0.9
                });

                const convertedFile = new File([convertedBlob], file.name.replace(/\.heic$/i, '.jpg'), {
                    type: 'image/jpeg'
                });

                return {
                    file: convertedFile,
                    url: URL.createObjectURL(convertedFile)
                };
            } catch (err) {
                alert(`Failed to convert HEIC file: ${file.name}`);
                return null;
            }
        }

        return {
            file,
            url: URL.createObjectURL(file)
        };
    }));

    images = processedFiles.filter(Boolean);
    currentIndex = 0;
    convertedBlobs = new Array(images.length).fill(null);

    resetState();

    dropZone.classList.add('hidden');
    previewWrapper.classList.remove('hidden');
    controls.classList.remove('hidden');
    prevBtn.classList.remove('hidden');
    nextBtn.classList.remove('hidden');

    updateImage();
    updateButtons();
    updateCounter();
}


function resetState() {
    state = {
        scale: 1,
        pos: { x: 0, y: 0 },
        drag: { active: false, startX: 0, startY: 0, originX: 0, originY: 0 }
    };
    zoomRange.value = 100;
}

function updateImage() {
    const { url, file } = images[currentIndex];
    previewImageConverted.src = ''; // Clear converted preview on image change
    resetState();

    previewImageOriginal.onload = () => {
        updateTransform();
        updateReveal();
        updateCounter();
        originalFileSizeLabel.textContent = `Original | ${formatFileSize(file.size)}`;
        convertedFileSizeLabel.textContent = 'Converted';
        setRevealPercent(50);
        convertImage();
    };

    previewImageOriginal.onerror = () => {
        alert("Failed to load original image.");
    };

    previewImageOriginal.src = url;
}

function updateButtons() {
    prevBtn.disabled = images.length <= 1;
    nextBtn.disabled = images.length <= 1;
}

function updateCounter() {
    if (images.length === 0) {
        imageCounter.textContent = '';
    } else {
        imageCounter.textContent = `${currentIndex + 1} / ${images.length}`;
    }
}

function formatFileSize(bytes) {
    let size = bytes;
    let unit = 'B';
    if (size >= 1024) {
        size /= 1024;
        unit = 'KB';
    }
    if (size >= 1024) {
        size /= 1024;
        unit = 'MB';
    }
    return `${size.toFixed(2)} ${unit}`;
}

// Clamp position so image does not drag beyond boundaries
function clampPosition() {
    const imgW = previewImageOriginal.naturalWidth * state.scale;
    const imgH = previewImageOriginal.naturalHeight * state.scale;
    const wrapW = window.innerWidth - imgW;
    const wrapH = window.innerHeight - imgH;

    const halfImgW = imgW / 1.25;
    const halfImgH = imgH / 1.25;
    const halfWrapW = wrapW / 1.25;
    const halfWrapH = wrapH / 1.25;

    let minX, maxX, minY, maxY;

    if (imgW <= wrapW) {
        minX = maxX = 0;
    } else {
        minX = halfWrapW - halfImgW;
        maxX = halfImgW - halfWrapW;
    }

    if (imgH <= wrapH) {
        minY = maxY = 0;
    } else {
        minY = halfWrapH - halfImgH;
        maxY = halfImgH - halfWrapH;
    }

    state.pos.x = Math.min(maxX, Math.max(minX, state.pos.x));
    state.pos.y = Math.min(maxY, Math.max(minY, state.pos.y));
}

function updateTransform() {
    if (!previewImageOriginal.naturalWidth || !previewImageOriginal.naturalHeight) return;

    clampPosition();

    const transformValue = `translate(calc(-50% + ${state.pos.x}px), calc(-50% + ${state.pos.y}px)) scale(${state.scale})`;

    previewImageOriginal.style.transform = transformValue;
    previewImageConverted.style.transform = transformValue;

    /*    updateReveal();*/
}

// Prev / Next buttons
prevBtn.addEventListener('click', () => {
    if (images.length === 0) return;
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateImage();
    updateButtons();
    updateCounter();
});

nextBtn.addEventListener('click', () => {
    if (images.length === 0) return;
    currentIndex = (currentIndex + 1) % images.length;
    updateImage();
    updateButtons();
    updateCounter();
});

// Drag & Pan handling
function startDrag(e) {
    if (e.target.classList.contains('bottom-right-controls') || e.target.closest('.bottom-right-controls') || e.target.closest('.top-right-controls')) return;
    if (e.target === revealSliderVertical) return;

    e.preventDefault();

    state.drag.active = true;
    state.drag.startX = e.clientX;
    state.drag.startY = e.clientY;
    state.drag.originX = state.pos.x;
    state.drag.originY = state.pos.y;

    previewWrapper.style.cursor = 'grabbing';
}

function stopDrag() {
    if (state.drag.active) {
        state.drag.active = false;
        previewWrapper.style.cursor = 'grab';
    }
}

function doDrag(e) {
    if (!state.drag.active) return;

    const dx = e.clientX - state.drag.startX;
    const dy = e.clientY - state.drag.startY;
    state.pos.x = state.drag.originX + dx;
    state.pos.y = state.drag.originY + dy;
    updateTransform();
    updateReveal();
}

previewWrapper.addEventListener('mousedown', startDrag);
window.addEventListener('mouseup', stopDrag);
window.addEventListener('mousemove', doDrag);

// Zoom slider input
zoomRange.addEventListener('input', (e) => {
    state.scale = e.target.value / 100;
    updateTransform();
    updateReveal();
});

// Wheel zoom
function wheelZoom(e) {
    e.preventDefault();
    if (!previewImageOriginal.src) return;

    const zoomFactor = 1.1;
    const newScale = e.deltaY < 0 ? state.scale * zoomFactor : state.scale / zoomFactor;

    if (newScale < 0.1 || newScale > 5) return;

    const rect = previewImageOriginal.getBoundingClientRect();
    const centerX = e.clientX - rect.left;
    const centerY = e.clientY - rect.top;

    const offsetX = (centerX - rect.width / 2);
    const offsetY = (centerY - rect.height / 2);

    const scaleChange = newScale / state.scale;

    state.pos.x -= offsetX * (scaleChange - 1);
    state.pos.y -= offsetY * (scaleChange - 1);

    state.scale = newScale;
    zoomRange.value = newScale * 100;

    updateTransform();
    updateReveal();
}

previewWrapper.addEventListener('wheel', wheelZoom, { passive: false });

// Reveal slider vertical logic
let revealPercent = 50;

function updateReveal() {
    const scale = state.scale;
    const posX = state.pos.x;

    const imgWidth = previewImageOriginal.naturalWidth * scale;

    const wrapperRect = previewWrapper.getBoundingClientRect();
    const sliderRect = revealSliderVertical.getBoundingClientRect();

    const sliderX = sliderRect.left - wrapperRect.left;

    const imageStartX = (wrapperRect.width / 2) - (imgWidth / 2) + posX;
    const revealPixelX = sliderX - imageStartX;
    const clipLeftPercent = Math.max(0, Math.min(100, (revealPixelX / imgWidth) * 100));
    const clipRightPercent = 100 - clipLeftPercent;

    // Only update if values actually change
    if (clipLeftPercent.toFixed(2) !== lastRevealClipLeft || clipRightPercent.toFixed(2) !== lastRevealClipRight) {
        previewImageOriginal.style.clipPath = `inset(0 ${clipRightPercent}% 0 0)`;
        previewImageConverted.style.clipPath = `inset(0 0 0 ${clipLeftPercent}%)`;

        lastRevealClipLeft = clipLeftPercent.toFixed(2);
        lastRevealClipRight = clipRightPercent.toFixed(2);
    }
}


let draggingReveal = false;

revealSliderVertical.addEventListener('mousedown', e => {
    draggingReveal = true;
    e.preventDefault();
});

window.addEventListener('mouseup', () => {
    draggingReveal = false;
});

let revealPending = false;

window.addEventListener('mousemove', (e) => {
    if (!draggingReveal) return;
    if (revealPending) return;

    revealPending = true;
    requestAnimationFrame(() => {
        const wrapperRect = previewWrapper.getBoundingClientRect();
        let x = e.clientX;
        x = Math.max(20, Math.min(x, window.innerWidth - 20));

        revealPercent = ((x - wrapperRect.left) / wrapperRect.width) * 100;
        revealSliderVertical.style.left = `${x}px`;
        updateReveal();

        revealPending = false;
    });
});


// Touch support for reveal slider
revealSliderVertical.addEventListener('touchstart', e => {
    draggingReveal = true;
    e.preventDefault();
});
window.addEventListener('touchend', () => {
    draggingReveal = false;
});
window.addEventListener('touchmove', e => {
    if (!draggingReveal) return;

    const touch = e.touches[0];
    const wrapperRect = previewWrapper.getBoundingClientRect();
    let x = touch.clientX;
    x = Math.min(Math.max(x, wrapperRect.left), wrapperRect.right);
    revealPercent = ((x - wrapperRect.left) / wrapperRect.width) * 100;

    updateReveal();
});

function setRevealPercent(percent) {
    revealPercent = Math.min(Math.max(percent, 0), 100);
    updateReveal();
}

previewImageConverted.style.clipPath = `inset(0 50% 0 0)`;
setRevealPercent(50);

// Convert image to selected format and quality
function convertImage() {
    if (images.length === 0) return;

    const { url: imageUrl, file } = images[currentIndex];
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        const format = formatSelect.value;
        const quality = parseInt(compressSlider.value, 10) / 100;
        let mimeType = 'image/jpeg';

        switch (format) {
            case 'png': mimeType = 'image/png'; break;
            case 'webp': mimeType = 'image/webp'; break;
            case 'jpeg': mimeType = 'image/jpeg'; break;
            case 'bmp': mimeType = 'image/bmp'; break;
            case 'tiff': mimeType = 'image/tiff'; break;
            default: mimeType = 'image/jpeg'; break;
        }
        file['format'] = format;

        canvas.toBlob(blob => {
            if (!blob) {
                alert("Conversion failed.");
                return;
            }

            const convertedUrl = URL.createObjectURL(blob);
            previewImageConverted.src = convertedUrl;
            let percentDif = (100 - (blob.size / file.size) * 100).toFixed(2);
            convertedFileSizeLabel.textContent = `Converted | ${formatFileSize(blob.size)} | ${percentDif}%`;

            // Save converted blob for download all
            convertedBlobs[currentIndex] = blob;

            previewImageConverted.onload = () => {
                URL.revokeObjectURL(convertedUrl);
                updateTransform();
            };
        }, mimeType, quality);
    };

    img.onerror = () => {
        alert("Failed to load image for conversion.");
    };
}

formatSelect.addEventListener('change', convertImage);
compressSlider.addEventListener('input', convertImage);

// Dropdown toggle logic
dropdownArrow.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = dropdown.classList.toggle('open');
    dropdownBtn.setAttribute('aria-expanded', isOpen);
});

// Close dropdown if clicking outside
window.addEventListener('click', () => {
    dropdown.classList.remove('open');
    dropdownBtn.setAttribute('aria-expanded', 'false');
});

// Prevent closing dropdown if clicking inside the menu
dropdownMenu.addEventListener('click', (e) => {
    e.stopPropagation();
});

// Download single current image
dropdownBtn.addEventListener('click', () => {
    if (images.length === 0) return;

    // Get blob for current image if available, else fallback to original file
    const blob = convertedBlobs[currentIndex];
    if (blob) {
        downloadBlob(blob, generateFileName(images[currentIndex].file.name, images[currentIndex].file.format));
    } else {
        // fallback to original file URL download (may not reflect converted)
        downloadURL(images[currentIndex].url, images[currentIndex].file.name);
    }
    dropdown.classList.remove('open');
    dropdownBtn.setAttribute('aria-expanded', 'false');
});

// Download all converted images as ZIP
downloadAllBtn.addEventListener('click', async () => {
    if (images.length === 0) return;

    if (typeof JSZip === 'undefined') {
        alert("JSZip library is required for Download All feature.");
        return;
    }

    const zip = new JSZip();

    // Wait for all converted blobs, if any not converted yet, convert on the fly
    for (let i = 0; i < images.length; i++) {
        let blob = convertedBlobs[i];

        if (!blob) {
            // Convert synchronously (blocking), await a Promise that resolves on toBlob
            blob = await convertImageToBlob(images[i].url, formatSelect.value, compressSlider.value);
            convertedBlobs[i] = blob; // cache it
        }
        const filename = generateFileName(images[i].file.name, images[i].file.format);
        zip.file(filename, blob);
    }

    zip.generateAsync({ type: 'blob' }).then(content => {
        downloadBlob(content, 'converted-images.zip');
    });

    dropdown.classList.remove('open');
    dropdownBtn.setAttribute('aria-expanded', 'false');
});

// Helper: Convert image url to blob (promise)
function convertImageToBlob(imageUrl, format, qualityPercent) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = imageUrl;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth || img.width;
            canvas.height = img.naturalHeight || img.height;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);

            const quality = parseInt(qualityPercent, 10) / 100;
            let mimeType = 'image/jpeg';

            switch (format) {
                case 'png': mimeType = 'image/png'; break;
                case 'webp': mimeType = 'image/webp'; break;
                case 'jpeg': mimeType = 'image/jpeg'; break;
                case 'bmp': mimeType = 'image/bmp'; break;
                case 'tiff': mimeType = 'image/tiff'; break;
                default: mimeType = 'image/jpeg'; break;
            }

            canvas.toBlob(blob => {
                if (!blob) {
                    reject(new Error("Conversion failed."));
                } else {
                    resolve(blob);
                }
            }, mimeType, quality);
        };

        img.onerror = () => reject(new Error("Failed to load image for conversion."));
    });
}

// Helper: Download a blob as file
function downloadBlob(blob, filename) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
    }, 100);
}

// Helper: Download a URL as file
function downloadURL(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
    }, 100);
}

// Helper: Generate output file name with new extension
function generateFileName(originalName, newFormat) {
    const base = originalName.replace(/\.[^/.]+$/, "");
    let ext = newFormat.toLowerCase();
    if (ext === 'jpeg') ext = 'jpg';
    return `${base}.${ext}`;
}

// Initialize UI state
zoomRange.value = 100;
setRevealPercent(50);
