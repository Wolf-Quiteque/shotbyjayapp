/**
 * CMS Client - Handles content loading and editing
 */
(function() {
    const WEB_ID = 'shotbyjar';
    const PAGE_ID = 'home'; // Can be dynamic based on URL
    const isEditMode = new URLSearchParams(window.location.search).get('edit') === 'true';

    let contentOverrides = {};
    let userId = null;

    // Initialize CMS
    async function init() {
        userId = getUserId();
        await loadContentOverrides();
        applyContentOverrides();
        trackPageView();

        if (isEditMode) {
            await verifyAuth();
        }
    }

    // Get or create user ID for analytics
    function getUserId() {
        let id = localStorage.getItem('cms_user_id');
        if (!id) {
            id = generateUUID();
            localStorage.setItem('cms_user_id', id);
        }
        return id;
    }

    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // Load content overrides from API
    async function loadContentOverrides() {
        try {
            const response = await fetch(`/api/content/${WEB_ID}/${PAGE_ID}`);
            contentOverrides = await response.json();
        } catch (error) {
            console.error('Failed to load content overrides:', error);
        }
    }

    // Apply content overrides to the page
    function applyContentOverrides() {
        Object.keys(contentOverrides).forEach(elementId => {
            const element = document.querySelector(`[data-edit-id="${elementId}"]`);
            if (element) {
                const override = contentOverrides[elementId];

                if (override.contentType === 'text') {
                    element.textContent = override.content;
                } else if (override.contentType === 'image') {
                    element.src = override.content;
                } else if (override.contentType === 'video') {
                    element.src = override.content;
                } else if (override.contentType === 'background-image') {
                    element.style.backgroundImage = `url('${override.content}')`;
                }
            }
        });
    }

    // Track page view
    async function trackPageView() {
        try {
            const isNewUser = !localStorage.getItem('cms_has_visited');

            await fetch('/api/analytics/track', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    webId: WEB_ID,
                    pageId: PAGE_ID,
                    userId: userId,
                    isNewUser: isNewUser
                })
            });

            if (isNewUser) {
                localStorage.setItem('cms_has_visited', 'true');
            }
        } catch (error) {
            console.error('Failed to track page view:', error);
        }
    }

    // Verify authentication for edit mode
    async function verifyAuth() {
        try {
            const response = await fetch('/api/auth/verify', {
                credentials: 'include'
            });
            const data = await response.json();

            if (data.authenticated) {
                enableEditMode();
            } else {
                window.location.href = '/admin';
            }
        } catch (error) {
            console.error('Auth verification failed:', error);
            window.location.href = '/admin';
        }
    }

    // Enable edit mode
    function enableEditMode() {
        document.body.classList.add('cms-edit-mode');
        injectEditStyles();
        addEditControls();
        initializeEditor();
    }

    // Inject CSS for edit mode
    function injectEditStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .cms-edit-mode [data-edit-id] {
                position: relative !important;
                outline: 2px dashed transparent;
                transition: outline 0.2s;
                cursor: pointer !important;
            }

            .cms-edit-mode [data-edit-id]:hover {
                outline-color: #3b82f6 !important;
            }

            .cms-edit-icon {
                position: absolute !important;
                top: 10px !important;
                right: 10px !important;
                width: 45px !important;
                height: 45px !important;
                background: rgba(59, 130, 246, 0.95) !important;
                color: white !important;
                border-radius: 50% !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                font-size: 22px !important;
                cursor: pointer !important;
                z-index: 10000 !important;
                opacity: 1 !important;
                transition: all 0.2s;
                box-shadow: 0 4px 12px rgba(0,0,0,0.5) !important;
                pointer-events: auto !important;
                border: 2px solid white !important;
            }

            .cms-edit-mode [data-edit-id]:hover .cms-edit-icon {
                transform: scale(1.15);
                background: rgba(59, 130, 246, 1) !important;
            }

            /* Make sure images and videos can show edit icons */
            .cms-edit-mode img[data-edit-id],
            .cms-edit-mode video[data-edit-id] {
                display: inline-block !important;
            }

            /* Special handling for background images */
            .cms-edit-mode [data-edit-type="background-image"] {
                min-height: 100px;
            }

            .cms-edit-toolbar {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: #1f2937;
                color: white;
                padding: 12px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                z-index: 10000;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            }

            .cms-edit-toolbar h3 {
                margin: 0;
                font-size: 16px;
            }

            .cms-toolbar-actions {
                display: flex;
                gap: 10px;
            }

            .cms-btn {
                padding: 8px 16px;
                background: #3b82f6;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                transition: background 0.2s;
            }

            .cms-btn:hover {
                background: #2563eb;
            }

            .cms-btn-secondary {
                background: #6b7280;
            }

            .cms-btn-secondary:hover {
                background: #4b5563;
            }

            .cms-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.7);
                display: none;
                align-items: center;
                justify-content: center;
                z-index: 10001;
            }

            .cms-modal.active {
                display: flex;
            }

            .cms-modal-content {
                background: white;
                padding: 30px;
                border-radius: 8px;
                max-width: 600px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
            }

            .cms-modal-content h2 {
                margin-top: 0;
                margin-bottom: 20px;
            }

            .cms-form-group {
                margin-bottom: 20px;
            }

            .cms-form-group label {
                display: block;
                margin-bottom: 8px;
                font-weight: 500;
            }

            .cms-form-group input,
            .cms-form-group textarea {
                width: 100%;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 14px;
                font-family: inherit;
            }

            .cms-form-group textarea {
                min-height: 100px;
                resize: vertical;
            }

            .cms-form-actions {
                display: flex;
                gap: 10px;
                justify-content: flex-end;
                margin-top: 20px;
            }

            .cms-upload-preview {
                margin-top: 10px;
                max-width: 100%;
                max-height: 300px;
                border-radius: 4px;
            }

            body.cms-edit-mode {
                padding-top: 50px;
            }
        `;
        document.head.appendChild(style);
    }

    // Add edit controls toolbar
    function addEditControls() {
        const toolbar = document.createElement('div');
        toolbar.className = 'cms-edit-toolbar';
        toolbar.innerHTML = `
            <h3>📝 Edit Mode Active</h3>
            <div class="cms-toolbar-actions">
                <button class="cms-btn cms-btn-secondary" onclick="location.href='/admin'">Dashboard</button>
                <button class="cms-btn cms-btn-secondary" onclick="location.href='/'">Exit Edit Mode</button>
            </div>
        `;
        document.body.insertBefore(toolbar, document.body.firstChild);

        // Add edit modal
        const modal = document.createElement('div');
        modal.className = 'cms-modal';
        modal.id = 'editModal';
        modal.innerHTML = `
            <div class="cms-modal-content">
                <h2 id="modalTitle">Edit Content</h2>
                <div id="modalBody"></div>
            </div>
        `;
        document.body.appendChild(modal);

        // Close modal on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // Initialize editor - add edit icons
    function initializeEditor() {
        document.querySelectorAll('[data-edit-id]').forEach(element => {
            const contentType = element.getAttribute('data-edit-type') || 'text';

            const editIcon = document.createElement('div');
            editIcon.className = 'cms-edit-icon';

            // Different icons for different content types
            if (contentType === 'hero-section') {
                editIcon.innerHTML = '🎬';
                editIcon.title = 'Edit Hero Section (Background + Videos)';
            } else if (contentType === 'image' || contentType === 'background-image') {
                editIcon.innerHTML = '📷';
                editIcon.title = 'Edit Image';
            } else if (contentType === 'video') {
                editIcon.innerHTML = '🎥';
                editIcon.title = 'Edit Video';
            } else {
                editIcon.innerHTML = '✏️';
                editIcon.title = 'Edit Text';
            }

            editIcon.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Edit icon clicked for:', element.getAttribute('data-edit-id'));
                openEditModal(element);
            });

            // Make sure element can contain the icon
            const currentPosition = window.getComputedStyle(element).position;
            if (currentPosition === 'static') {
                element.style.position = 'relative';
            }

            // For images and videos, ensure they can display the icon properly
            if (contentType === 'image' || contentType === 'video') {
                element.style.display = 'inline-block';
            }

            element.appendChild(editIcon);

            // Also make the element itself clickable for easier editing
            element.addEventListener('click', (e) => {
                if (e.target === element || e.target.hasAttribute('data-edit-id')) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Element clicked for edit:', element.getAttribute('data-edit-id'));
                    openEditModal(element);
                }
            });
        });

        console.log(`✅ CMS: Initialized ${document.querySelectorAll('[data-edit-id]').length} editable elements`);
    }

    // Open edit modal
    function openEditModal(element) {
        const elementId = element.getAttribute('data-edit-id');
        const contentType = element.getAttribute('data-edit-type') || 'text';

        const modal = document.getElementById('editModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');

        modalTitle.textContent = `Edit ${contentType.replace('-', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`;

        if (contentType === 'hero-section') {
            openHeroSectionEditor();
            return;
        } else if (contentType === 'text') {
            modalBody.innerHTML = `
                <div class="cms-form-group">
                    <label>Content:</label>
                    <textarea id="editContent">${element.textContent}</textarea>
                </div>
                <div class="cms-form-actions">
                    <button class="cms-btn cms-btn-secondary" onclick="window.cmsCloseModal()">Cancel</button>
                    <button class="cms-btn" onclick="window.cmsSaveText('${elementId}')">Save</button>
                </div>
            `;
        } else if (contentType === 'background-image') {
            // Extract URL from background-image style
            const bgStyle = element.style.backgroundImage;
            const currentBg = bgStyle.match(/url\(['"]?(.+?)['"]?\)/)?.[1] || element.getAttribute('data-default-bg') || '';

            modalBody.innerHTML = `
                <div class="cms-form-group">
                    <label>Current Background:</label>
                    <div style="width: 100%; height: 200px; background-image: url('${currentBg}'); background-size: cover; background-position: center; border-radius: 4px;" id="currentMedia"></div>
                </div>
                <div class="cms-form-group">
                    <label>Upload New Image:</label>
                    <input type="file" id="mediaFile" accept="image/*">
                </div>
                <div class="cms-form-group">
                    <label>Or enter URL:</label>
                    <input type="url" id="mediaUrl" value="${currentBg}" placeholder="https://...">
                </div>
                <div class="cms-form-actions">
                    <button class="cms-btn cms-btn-secondary" onclick="window.cmsCloseModal()">Cancel</button>
                    <button class="cms-btn" onclick="window.cmsSaveMedia('${elementId}', '${contentType}')">Save</button>
                </div>
            `;

            // Preview file upload
            document.getElementById('mediaFile').addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        document.getElementById('currentMedia').style.backgroundImage = `url('${e.target.result}')`;
                    };
                    reader.readAsDataURL(file);
                }
            });
        } else if (contentType === 'image' || contentType === 'video') {
            const currentSrc = element.src || '';
            modalBody.innerHTML = `
                <div class="cms-form-group">
                    <label>Current ${contentType}:</label>
                    ${contentType === 'image' ?
                        `<img src="${currentSrc}" class="cms-upload-preview" id="currentMedia">` :
                        `<video src="${currentSrc}" class="cms-upload-preview" controls id="currentMedia"></video>`
                    }
                </div>
                <div class="cms-form-group">
                    <label>Upload New ${contentType}:</label>
                    <input type="file" id="mediaFile" accept="${contentType}/*">
                </div>
                <div class="cms-form-group">
                    <label>Or enter URL:</label>
                    <input type="url" id="mediaUrl" value="${currentSrc}" placeholder="https://...">
                </div>
                <div class="cms-form-actions">
                    <button class="cms-btn cms-btn-secondary" onclick="window.cmsCloseModal()">Cancel</button>
                    <button class="cms-btn" onclick="window.cmsSaveMedia('${elementId}', '${contentType}')">Save</button>
                </div>
            `;

            // Preview file upload
            document.getElementById('mediaFile').addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        document.getElementById('currentMedia').src = e.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        modal.classList.add('active');
    }

    // Open Hero Section Editor with all media
    function openHeroSectionEditor() {
        const modal = document.getElementById('editModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');

        // Get current values
        const bgElement = document.querySelector('[data-edit-id="hero-bg-image"]');
        const mainVideo = document.querySelector('[data-edit-id="main-video"]');
        const reel1 = document.querySelector('[data-edit-id="reel-1"]');
        const reel2 = document.querySelector('[data-edit-id="reel-2"]');
        const reel3 = document.querySelector('[data-edit-id="reel-3"]');

        const currentBg = bgElement?.style.backgroundImage.match(/url\(['"]?(.+?)['"]?\)/)?.[1] || bgElement?.getAttribute('data-default-bg') || '';
        const currentMainVideo = mainVideo?.src || '';
        const currentReel1 = reel1?.src || '';
        const currentReel2 = reel2?.src || '';
        const currentReel3 = reel3?.src || '';

        modalTitle.textContent = 'Edit Hero Section';
        modalBody.innerHTML = `
            <div style="max-height: 70vh; overflow-y: auto;">
                <!-- Background Image -->
                <div class="cms-form-group">
                    <label><strong>📷 Hero Background Image</strong></label>
                    <div style="width: 100%; height: 150px; background-image: url('${currentBg}'); background-size: cover; background-position: center; border-radius: 4px; margin-bottom: 10px;" id="bgPreview"></div>
                    <input type="file" id="bgFile" accept="image/*" style="margin-bottom: 5px;">
                    <input type="url" id="bgUrl" value="${currentBg}" placeholder="Or enter image URL">
                </div>

                <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">

                <!-- Main Video -->
                <div class="cms-form-group">
                    <label><strong>🎥 Main Showcase Video</strong></label>
                    <video src="${currentMainVideo}" controls style="width: 100%; max-height: 200px; margin-bottom: 10px; border-radius: 4px;" id="mainVideoPreview"></video>
                    <input type="file" id="mainVideoFile" accept="video/*" style="margin-bottom: 5px;">
                    <input type="url" id="mainVideoUrl" value="${currentMainVideo}" placeholder="Or enter video URL">
                </div>

                <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">

                <!-- Reel 1 -->
                <div class="cms-form-group">
                    <label><strong>🎬 Reel Video 1</strong></label>
                    <video src="${currentReel1}" controls style="width: 100%; max-height: 150px; margin-bottom: 10px; border-radius: 4px;" id="reel1Preview"></video>
                    <input type="file" id="reel1File" accept="video/*" style="margin-bottom: 5px;">
                    <input type="url" id="reel1Url" value="${currentReel1}" placeholder="Or enter video URL">
                </div>

                <!-- Reel 2 -->
                <div class="cms-form-group">
                    <label><strong>🎬 Reel Video 2</strong></label>
                    <video src="${currentReel2}" controls style="width: 100%; max-height: 150px; margin-bottom: 10px; border-radius: 4px;" id="reel2Preview"></video>
                    <input type="file" id="reel2File" accept="video/*" style="margin-bottom: 5px;">
                    <input type="url" id="reel2Url" value="${currentReel2}" placeholder="Or enter video URL">
                </div>

                <!-- Reel 3 -->
                <div class="cms-form-group">
                    <label><strong>🎬 Reel Video 3</strong></label>
                    <video src="${currentReel3}" controls style="width: 100%; max-height: 150px; margin-bottom: 10px; border-radius: 4px;" id="reel3Preview"></video>
                    <input type="file" id="reel3File" accept="video/*" style="margin-bottom: 5px;">
                    <input type="url" id="reel3Url" value="${currentReel3}" placeholder="Or enter video URL">
                </div>
            </div>

            <div class="cms-form-actions" style="margin-top: 20px;">
                <button class="cms-btn cms-btn-secondary" onclick="window.cmsCloseModal()">Cancel</button>
                <button class="cms-btn" onclick="window.cmsSaveHeroSection()">Save All Changes</button>
            </div>
        `;

        // Add file preview handlers
        setupFilePreview('bgFile', 'bgPreview', true);
        setupFilePreview('mainVideoFile', 'mainVideoPreview', false);
        setupFilePreview('reel1File', 'reel1Preview', false);
        setupFilePreview('reel2File', 'reel2Preview', false);
        setupFilePreview('reel3File', 'reel3Preview', false);

        modal.classList.add('active');
    }

    function setupFilePreview(fileInputId, previewId, isBackground) {
        const fileInput = document.getElementById(fileInputId);
        const preview = document.getElementById(previewId);

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    if (isBackground) {
                        preview.style.backgroundImage = `url('${e.target.result}')`;
                    } else {
                        preview.src = e.target.result;
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Save Hero Section Changes
    async function saveHeroSection() {
        showNotification('Saving hero section changes...');

        const updates = [
            { id: 'hero-bg-image', type: 'background-image', fileId: 'bgFile', urlId: 'bgUrl' },
            { id: 'main-video', type: 'video', fileId: 'mainVideoFile', urlId: 'mainVideoUrl' },
            { id: 'reel-1', type: 'video', fileId: 'reel1File', urlId: 'reel1Url' },
            { id: 'reel-2', type: 'video', fileId: 'reel2File', urlId: 'reel2Url' },
            { id: 'reel-3', type: 'video', fileId: 'reel3File', urlId: 'reel3Url' }
        ];

        for (const update of updates) {
            const fileInput = document.getElementById(update.fileId);
            const urlInput = document.getElementById(update.urlId);
            let mediaUrl = urlInput.value;

            // Upload file if selected
            if (fileInput.files.length > 0) {
                const formData = new FormData();
                formData.append('file', fileInput.files[0]);

                try {
                    const uploadResponse = await fetch('/api/upload', {
                        method: 'POST',
                        credentials: 'include',
                        body: formData
                    });

                    if (uploadResponse.ok) {
                        const uploadData = await uploadResponse.json();
                        mediaUrl = uploadData.url;
                    } else {
                        showNotification(`Failed to upload ${update.id}`, 'error');
                        continue;
                    }
                } catch (error) {
                    console.error(`Upload error for ${update.id}:`, error);
                    showNotification(`Failed to upload ${update.id}`, 'error');
                    continue;
                }
            }

            // Save to database
            try {
                const response = await fetch(`/api/content/${WEB_ID}/${PAGE_ID}/${update.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        content: mediaUrl,
                        contentType: update.type
                    })
                });

                if (response.ok) {
                    const element = document.querySelector(`[data-edit-id="${update.id}"]`);
                    if (element) {
                        if (update.type === 'background-image') {
                            element.style.backgroundImage = `url('${mediaUrl}')`;
                        } else {
                            element.src = mediaUrl;
                        }
                    }
                }
            } catch (error) {
                console.error(`Save error for ${update.id}:`, error);
            }
        }

        closeModal();
        showNotification('Hero section updated successfully!');
    }

    // Close modal
    function closeModal() {
        const modal = document.getElementById('editModal');
        modal.classList.remove('active');
    }

    // Save text content
    async function saveText(elementId) {
        const content = document.getElementById('editContent').value;
        const element = document.querySelector(`[data-edit-id="${elementId}"]`);

        try {
            const response = await fetch(`/api/content/${WEB_ID}/${PAGE_ID}/${elementId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    content: content,
                    contentType: 'text'
                })
            });

            if (response.ok) {
                element.textContent = content;
                closeModal();
                showNotification('Content saved successfully!');
            } else {
                showNotification('Failed to save content', 'error');
            }
        } catch (error) {
            console.error('Save error:', error);
            showNotification('Failed to save content', 'error');
        }
    }

    // Save media content
    async function saveMedia(elementId, contentType) {
        const fileInput = document.getElementById('mediaFile');
        const urlInput = document.getElementById('mediaUrl');
        const element = document.querySelector(`[data-edit-id="${elementId}"]`);

        let mediaUrl = urlInput.value;

        // If file is selected, upload it first
        if (fileInput.files.length > 0) {
            const formData = new FormData();
            formData.append('file', fileInput.files[0]);

            try {
                showNotification('Uploading file...');
                const uploadResponse = await fetch('/api/upload', {
                    method: 'POST',
                    credentials: 'include',
                    body: formData
                });

                if (uploadResponse.ok) {
                    const uploadData = await uploadResponse.json();
                    mediaUrl = uploadData.url;
                } else {
                    showNotification('Failed to upload file', 'error');
                    return;
                }
            } catch (error) {
                console.error('Upload error:', error);
                showNotification('Failed to upload file', 'error');
                return;
            }
        }

        // Save the media URL
        try {
            const response = await fetch(`/api/content/${WEB_ID}/${PAGE_ID}/${elementId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    content: mediaUrl,
                    contentType: contentType
                })
            });

            if (response.ok) {
                if (contentType === 'background-image') {
                    element.style.backgroundImage = `url('${mediaUrl}')`;
                } else {
                    element.src = mediaUrl;
                }
                closeModal();
                showNotification('Media saved successfully!');
            } else {
                showNotification('Failed to save media', 'error');
            }
        } catch (error) {
            console.error('Save error:', error);
            showNotification('Failed to save media', 'error');
        }
    }

    // Show notification
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 70px;
            right: 20px;
            padding: 16px 24px;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            border-radius: 4px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10002;
            animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Add animation styles
    const animationStyle = document.createElement('style');
    animationStyle.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(animationStyle);

    // Expose functions to window for onclick handlers
    window.cmsCloseModal = closeModal;
    window.cmsSaveText = saveText;
    window.cmsSaveMedia = saveMedia;
    window.cmsSaveHeroSection = saveHeroSection;

    // Initialize on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
