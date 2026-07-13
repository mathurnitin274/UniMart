document.addEventListener('DOMContentLoaded', () => {
  // Authentication check
  if (!API.auth.isAuthenticated()) {
    showToast('Please login to sell products', 'warning');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1000);
    return;
  }

  const sellForm = document.getElementById('sell-form');
  const imageFileInput = document.getElementById('image-files');
  const previewGrid = document.getElementById('image-preview-grid');
  
  const aiGenDescBtn = document.getElementById('ai-generate-desc-btn');
  const aiPriceBtn = document.getElementById('ai-suggest-pricing-btn');
  const aiSuggestionBox = document.getElementById('ai-suggestion-box');

  let selectedFiles = [];

  const SUBCATEGORIES = {
    'Electronics': [
      'Laptops & Computers',
      'Mobile Phones & Tablets',
      'Refrigerators & Appliances',
      'Audio & Headphones',
      'Other Electronics'
    ],
    'Books': [
      'Textbooks & Academic',
      'Exam Prep (GATE, GRE, etc.)',
      'Fiction & Literature',
      'Other Books'
    ],
    'Furniture': [
      'Study Tables & Desks',
      'Chairs & Seating',
      'Beds & Mattresses',
      'Storage (Wardrobes, Racks)',
      'Other Furniture'
    ],
    'Clothing': [
      'Winter Wear & Hoodies',
      'T-Shirts & Shirts',
      'Shoes & Sneakers',
      'Other Clothing'
    ],
    'Sports': [
      'Fitness Equipment',
      'Bicycles',
      'Sports Gear & Rackets',
      'Other Sports'
    ],
    'Accessories': [
      'Bags & Backpacks',
      'Watches & Wearables',
      'Other Accessories'
    ],
    'Other': [
      'Lab Coats & Drafters',
      'Miscellaneous'
    ]
  };

  const categorySelect = document.getElementById('category');
  const subcategoryWrapper = document.getElementById('subcategory-wrapper');
  const subcategorySelect = document.getElementById('subcategory');

  if (categorySelect && subcategoryWrapper && subcategorySelect) {
    categorySelect.addEventListener('change', () => {
      const selectedCat = categorySelect.value;
      const list = SUBCATEGORIES[selectedCat];

      if (list && list.length > 0) {
        let html = '<option value="" disabled selected>Select Subcategory</option>';
        list.forEach(sub => {
          html += `<option value="${sub}">${sub}</option>`;
        });
        subcategorySelect.innerHTML = html;
        subcategorySelect.required = true;
        subcategoryWrapper.style.display = 'block';
      } else {
        subcategorySelect.innerHTML = '<option value="" disabled selected>Select Subcategory</option>';
        subcategorySelect.required = false;
        subcategoryWrapper.style.display = 'none';
      }
    });
  }

  // Manage image selector preview
  if (imageFileInput && previewGrid) {
    imageFileInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      
      // Combine and restrict to max 5
      const totalCount = selectedFiles.length + files.length;
      if (totalCount > 5) {
        showToast('You can upload a maximum of 5 images', 'warning');
      }

      const allowedCount = Math.max(0, 5 - selectedFiles.length);
      const toAdd = files.slice(0, allowedCount);
      selectedFiles = [...selectedFiles, ...toAdd];

      renderPreviews();
    });
  }

  function renderPreviews() {
    previewGrid.innerHTML = '';
    
    // Render current selected images
    for (let i = 0; i < 5; i++) {
      const card = document.createElement('div');
      card.className = 'image-preview-card';
      
      if (selectedFiles[i]) {
        const file = selectedFiles[i];
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        card.appendChild(img);

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-image-btn';
        removeBtn.innerHTML = '×';
        removeBtn.type = 'button';
        removeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          selectedFiles.splice(i, 1);
          renderPreviews();
        });
        card.appendChild(removeBtn);
      } else {
        card.innerHTML = `<span style="color:var(--text-muted); font-size: 0.85rem;">Slot ${i + 1}</span>`;
      }
      
      previewGrid.appendChild(card);
    }

    // Sync live card preview main image & placeholder visibility
    const prevImg = document.getElementById('prev-img');
    const prevPlaceholder = document.getElementById('prev-img-placeholder');
    if (prevImg && prevPlaceholder) {
      if (selectedFiles[0]) {
        prevImg.src = URL.createObjectURL(selectedFiles[0]);
        prevImg.style.display = 'block';
        prevPlaceholder.style.display = 'none';
      } else {
        prevImg.src = '';
        prevImg.style.display = 'none';
        prevPlaceholder.style.display = 'flex';
      }
    }
  }

  // AI Description Generator
  if (aiGenDescBtn) {
    aiGenDescBtn.addEventListener('click', async () => {
      const title = document.getElementById('title').value.trim();
      const condition = document.getElementById('condition').value;
      const specs = document.getElementById('specifications').value.trim();
      const dorm = document.getElementById('dorm').value.trim();

      if (!title || !condition) {
        showToast('Please fill in Title and Condition first for AI description!', 'warning');
        return;
      }

      aiGenDescBtn.disabled = true;
      const originalText = aiGenDescBtn.textContent;
      aiGenDescBtn.textContent = 'Generating description...';

      try {
        const payload = {
          title,
          condition,
          specifications: `Location: ${dorm}. ${specs}`
        };

        const res = await API.ai.generateDescription(payload);
        if (res.success && res.data && res.data.description) {
          const descArea = document.getElementById('description');
          descArea.value = res.data.description;
          showToast('AI Description generated!', 'success');
        }
      } catch (err) {
        console.error(err);
      } finally {
        aiGenDescBtn.disabled = false;
        aiGenDescBtn.textContent = originalText;
      }
    });
  }

  // AI Pricing & Category Suggestions
  if (aiPriceBtn) {
    aiPriceBtn.addEventListener('click', async () => {
      const title = document.getElementById('title').value.trim();
      const condition = document.getElementById('condition').value;
      const specs = document.getElementById('specifications').value.trim();

      if (!title || !condition) {
        showToast('Please fill in Title and Condition first for AI Pricing!', 'warning');
        return;
      }

      aiPriceBtn.disabled = true;
      const originalText = aiPriceBtn.textContent;
      aiPriceBtn.textContent = 'Analyzing...';
      aiSuggestionBox.style.display = 'none';

      try {
        const payload = {
          title,
          condition,
          specifications: specs
        };

        const res = await API.ai.generateDescription(payload);
        if (res.success && res.data) {
          const priceRange = res.data.priceRange || 'N/A';
          const suggestedCategory = res.data.category || 'Other';

          aiSuggestionBox.innerHTML = `
            <div style="font-size: 0.9rem; line-height: 1.6;">
              <p>💰 <strong>Suggested Price Range:</strong> <span style="color:var(--primary); font-weight:700;">${priceRange}</span></p>
              <p>🏷️ <strong>Suggested Category:</strong> <strong>${suggestedCategory}</strong> 
                <button type="button" class="btn-link" style="margin-left: 8px; font-size:0.8rem;" id="apply-ai-category-btn">Apply Category</button>
              </p>
            </div>
          `;
          aiSuggestionBox.style.display = 'block';

          // Bind click to apply category
          const applyBtn = document.getElementById('apply-ai-category-btn');
          if (applyBtn) {
            applyBtn.addEventListener('click', () => {
              const catSelect = document.getElementById('category');
              // Make sure category exists in dropdown option list
              let found = false;
              for (let option of catSelect.options) {
                if (option.value === suggestedCategory) {
                  catSelect.value = suggestedCategory;
                  found = true;
                  break;
                }
              }
              if (found) {
                showToast(`Applied category: ${suggestedCategory}`, 'success');
                catSelect.dispatchEvent(new Event('change'));
              } else {
                catSelect.value = 'Other';
                showToast('Applied category: Other', 'success');
                catSelect.dispatchEvent(new Event('change'));
              }
            });
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        aiPriceBtn.disabled = false;
        aiPriceBtn.textContent = originalText;
      }
    });
  }

  // Handle Publish Form Submit
  if (sellForm) {
    sellForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const title = document.getElementById('title').value.trim();
      const price = document.getElementById('price').value.trim();
      const category = document.getElementById('category').value;
      const subcategory = document.getElementById('subcategory') ? document.getElementById('subcategory').value : '';
      const condition = document.getElementById('condition').value;
      const dorm = document.getElementById('dorm').value.trim();
      const courseCode = document.getElementById('courseCode').value.trim();
      const swap = document.getElementById('swap-checkbox').checked;
      const specsDetail = document.getElementById('specifications').value.trim();
      const description = document.getElementById('description').value.trim();

      if (selectedFiles.length === 0) {
        showToast('Please select at least 1 product image', 'warning');
        return;
      }

      // Format Specifications into a JSON String containing our extended attributes
      const specPayload = {
        dorm,
        courseCode,
        swap,
        details: specsDetail
      };

      const formData = new FormData();
      formData.append('title', title);
      formData.append('price', price);
      formData.append('category', category);
      formData.append('subcategory', subcategory);
      formData.append('condition', condition);
      formData.append('specifications', JSON.stringify(specPayload));
      formData.append('description', description);

      // Append files
      selectedFiles.forEach((file) => {
        formData.append('images', file);
      });

      const submitBtn = document.getElementById('submit-listing-btn');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Publishing listing...';

      try {
        const data = await API.products.create(formData);
        if (data.success) {
          showToast('Product listed successfully!', 'success');
          setTimeout(() => {
            window.location.href = 'marketplace.html';
          }, 1000);
        }
      } catch (err) {
        // Error toast is already triggered inside API.request
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }

  // Live Card Preview Syncing
  const titleInput = document.getElementById('title');
  const priceInput = document.getElementById('price');
  const dormInput = document.getElementById('dorm');
  const categorySel = document.getElementById('category');
  const subcategorySel = document.getElementById('subcategory');

  const prevTitle = document.getElementById('prev-title');
  const prevPrice = document.getElementById('prev-price');
  const prevLocation = document.getElementById('prev-location');
  const prevTag = document.getElementById('prev-tag');

  function updateLivePreview() {
    if (prevTitle && titleInput) {
      prevTitle.textContent = titleInput.value.trim() || 'Your Product Title';
    }
    if (prevPrice && priceInput) {
      const val = priceInput.value.trim();
      prevPrice.textContent = val ? `INR ${Number(val).toLocaleString()}` : 'INR 0';
    }
    if (prevLocation && dormInput) {
      prevLocation.textContent = `📍 ${dormInput.value.trim() || 'Location'}`;
    }
    if (prevTag) {
      const cat = categorySel ? categorySel.value : '';
      const sub = subcategorySel ? subcategorySel.value : '';
      prevTag.textContent = sub || cat || 'Category';
    }
  }

  if (titleInput) titleInput.addEventListener('input', updateLivePreview);
  if (priceInput) priceInput.addEventListener('input', updateLivePreview);
  if (dormInput) dormInput.addEventListener('input', updateLivePreview);
  if (categorySel) categorySel.addEventListener('change', updateLivePreview);
  if (subcategorySel) subcategorySel.addEventListener('change', updateLivePreview);

  // Run once to initialize
  updateLivePreview();
});
