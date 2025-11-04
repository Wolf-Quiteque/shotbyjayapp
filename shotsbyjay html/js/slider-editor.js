/**
 * Slider Editor Functions for CMS
 * Allows adding, removing, and reordering slider images
 */

// Open Slider Editor Modal
window.openSliderEditor = function(element) {
    const elementId = element.getAttribute('data-edit-id');
    const defaultSlides = element.getAttribute('data-default-slides');

    // Get current slides or use defaults
    let currentSlides = [];
    try {
        if (window.contentOverrides && window.contentOverrides[elementId]) {
            currentSlides = JSON.parse(window.contentOverrides[elementId].content);
        } else if (defaultSlides) {
            currentSlides = JSON.parse(defaultSlides);
        }
    } catch (error) {
        console.error('Error parsing slides:', error);
        currentSlides = [];
    }

    const modal = document.getElementById('editModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    modalTitle.textContent = 'Manage Slider Images';

    modalBody.innerHTML = `
        <div style="max-height: 70vh; overflow-y: auto;">
            <p style="color: #666; margin-bottom: 20px;">Add, remove, or reorder images in your slider. Drag to reorder.</p>

            <div id="sliderImagesList" style="margin-bottom: 20px;">
                ${renderSliderImages(currentSlides)}
            </div>

            <div class="cms-form-group">
                <button type="button" class="cms-btn" onclick="window.addSliderImage()">
                    ➕ Add New Image
                </button>
            </div>
        </div>

        <div class="cms-form-actions" style="margin-top: 20px;">
            <button class="cms-btn cms-btn-secondary" onclick="window.cmsCloseModal()">Cancel</button>
            <button class="cms-btn" onclick="window.saveSliderImages('${elementId}')">Save Slider</button>
        </div>
    `;

    // Store current slides in temporary variable
    window.tempSliderImages = JSON.parse(JSON.stringify(currentSlides));

    modal.classList.add('active');
};

// Render slider images list
function renderSliderImages(slides) {
    if (slides.length === 0) {
        return '<p style="text-align: center; color: #999;">No images yet. Click "Add New Image" to get started.</p>';
    }

    return slides.map((slide, index) => `
        <div class="slider-image-item" data-index="${index}" style="
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 15px;
            background: #f9f9f9;
            border-radius: 4px;
            margin-bottom: 10px;
            border: 2px solid transparent;
            transition: border-color 0.2s;
        " draggable="true"
        ondragstart="window.handleDragStart(event)"
        ondragover="window.handleDragOver(event)"
        ondrop="window.handleDrop(event)"
        ondragend="window.handleDragEnd(event)">

            <div style="cursor: move; font-size: 20px;" title="Drag to reorder">
                ⋮⋮
            </div>

            <img src="${slide.url}" alt="${slide.alt || ''}" style="
                width: 100px;
                height: 80px;
                object-fit: cover;
                border-radius: 4px;
                border: 1px solid #ddd;
            ">

            <div style="flex: 1;">
                <input type="text" value="${slide.url}" placeholder="Image URL"
                    onchange="window.updateSlideUrl(${index}, this.value)"
                    style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 5px;">
                <input type="text" value="${slide.alt || ''}" placeholder="Alt text (optional)"
                    onchange="window.updateSlideAlt(${index}, this.value)"
                    style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            </div>

            <div style="display: flex; gap: 10px;">
                <input type="file" id="upload-${index}" accept="image/*" style="display: none;"
                    onchange="window.uploadSlideImage(${index}, this)">
                <button type="button" onclick="document.getElementById('upload-${index}').click()"
                    style="padding: 8px 12px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    📤 Upload
                </button>
                <button type="button" onclick="window.removeSliderImage(${index})"
                    style="padding: 8px 12px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    🗑️ Remove
                </button>
            </div>
        </div>
    `).join('');
}

// Add new slider image
window.addSliderImage = function() {
    window.tempSliderImages.push({
        url: '',
        alt: ''
    });
    refreshSliderList();
};

// Remove slider image
window.removeSliderImage = function(index) {
    if (confirm('Remove this image from the slider?')) {
        window.tempSliderImages.splice(index, 1);
        refreshSliderList();
    }
};

// Update slide URL
window.updateSlideUrl = function(index, url) {
    window.tempSliderImages[index].url = url;
    refreshSliderList();
};

// Update slide alt text
window.updateSlideAlt = function(index, alt) {
    window.tempSliderImages[index].alt = alt;
};

// Upload slide image
window.uploadSlideImage = async function(index, input) {
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            credentials: 'include',
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            window.tempSliderImages[index].url = data.url;
            refreshSliderList();

            // Show compression savings if available
            if (data.compressionRatio && data.compressionRatio > 0) {
                showNotification(`Image uploaded! (${data.compressionRatio}% smaller as WebP)`);
            } else {
                showNotification('Image uploaded successfully!');
            }
        } else {
            showNotification('Failed to upload image', 'error');
        }
    } catch (error) {
        console.error('Upload error:', error);
        showNotification('Failed to upload image', 'error');
    }
};

// Refresh slider images list
function refreshSliderList() {
    const listContainer = document.getElementById('sliderImagesList');
    if (listContainer) {
        listContainer.innerHTML = renderSliderImages(window.tempSliderImages);
    }
}

// Drag and drop handlers for reordering
let draggedIndex = null;

window.handleDragStart = function(e) {
    draggedIndex = parseInt(e.currentTarget.getAttribute('data-index'));
    e.currentTarget.style.opacity = '0.5';
};

window.handleDragOver = function(e) {
    e.preventDefault();
    e.currentTarget.style.borderColor = '#3b82f6';
};

window.handleDrop = function(e) {
    e.preventDefault();
    e.currentTarget.style.borderColor = 'transparent';

    const dropIndex = parseInt(e.currentTarget.getAttribute('data-index'));

    if (draggedIndex !== null && draggedIndex !== dropIndex) {
        // Reorder array
        const draggedItem = window.tempSliderImages[draggedIndex];
        window.tempSliderImages.splice(draggedIndex, 1);
        window.tempSliderImages.splice(dropIndex, 0, draggedItem);
        refreshSliderList();
    }
};

window.handleDragEnd = function(e) {
    e.currentTarget.style.opacity = '1';
    document.querySelectorAll('.slider-image-item').forEach(item => {
        item.style.borderColor = 'transparent';
    });
};

// Save slider images
window.saveSliderImages = async function(elementId) {
    // Filter out empty slides
    const validSlides = window.tempSliderImages.filter(slide => slide.url && slide.url.trim() !== '');

    console.log('💾 Saving slider with', validSlides.length, 'images:', validSlides);

    if (validSlides.length === 0) {
        alert('Please add at least one image to the slider.');
        return;
    }

    showNotification('Saving slider...', 'info');

    try {
        const response = await fetch(`/api/content/${window.WEB_ID}/${window.PAGE_ID}/${elementId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                content: JSON.stringify(validSlides),
                contentType: 'slider'
            })
        });

        console.log('📡 Save response status:', response.status);

        if (response.ok) {
            const responseData = await response.json();
            console.log('✅ Save successful:', responseData);

            // Update the slider on the page
            const sliderElement = document.querySelector(`[data-edit-id="${elementId}"]`);
            if (sliderElement) {
                const wrapper = sliderElement.querySelector('.swiper-wrapper');
                if (wrapper) {
                    console.log('🔄 Updating slider UI with', validSlides.length, 'slides');
                    wrapper.innerHTML = '';
                    validSlides.forEach((slide, index) => {
                        console.log(`Adding slide ${index + 1}:`, slide.url);
                        const slideDiv = document.createElement('div');
                        slideDiv.className = 'swiper-slide';
                        slideDiv.innerHTML = `
                            <div class="about-image">
                                <img src="${slide.url}" alt="${slide.alt || 'Slide image'}"
                                     onerror="console.error('Failed to load image:', this.src)">
                            </div>
                        `;
                        wrapper.appendChild(slideDiv);
                    });

                    // Reinitialize Swiper
                    if (window.Swiper && sliderElement.swiper) {
                        console.log('🔄 Reinitializing Swiper');
                        sliderElement.swiper.update();
                    }

                    // Update the contentOverrides cache
                    if (window.contentOverrides) {
                        window.contentOverrides[elementId] = {
                            content: JSON.stringify(validSlides),
                            contentType: 'slider'
                        };
                        console.log('✅ Updated contentOverrides cache');
                    }
                }
            }

            window.cmsCloseModal();
            showNotification('Slider updated successfully! Refresh the page to see changes persist.');
        } else {
            const errorText = await response.text();
            console.error('❌ Save failed:', response.status, errorText);
            showNotification(`Failed to save slider (${response.status})`, 'error');
        }
    } catch (error) {
        console.error('❌ Save error:', error);
        showNotification('Failed to save slider: ' + error.message, 'error');
    }
};

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');

    // Set background color based on type
    let bgColor = '#10b981'; // success - green
    if (type === 'error') bgColor = '#ef4444'; // error - red
    if (type === 'info') bgColor = '#3b82f6'; // info - blue
    if (type === 'warning') bgColor = '#f59e0b'; // warning - orange

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${bgColor};
        color: white;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10002;
        animation: slideIn 0.3s ease-out;
        font-weight: 500;
        max-width: 400px;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
