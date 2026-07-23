document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const body = document.body;
  const themePicker = document.getElementById('theme-select-top');
  const profileForm = document.getElementById('profile-form');
  const btnGenerate = document.getElementById('btn-generate');
  const btnText = btnGenerate.querySelector('.btn-text');
  const btnLoader = btnGenerate.querySelector('.btn-loader');
  
  // Input Fields
  const inputName = document.getElementById('input-name');
  const inputTitle = document.getElementById('input-title');
  const inputBio = document.getElementById('input-bio');
  const inputEmail = document.getElementById('input-email');
  const inputAccent = document.getElementById('input-accent');
  const colorHexLabel = document.getElementById('color-hex');
  const inputAvatarUrl = document.getElementById('input-avatar-url');
  const inputGithub = document.getElementById('input-github');
  const inputLinkedin = document.getElementById('input-linkedin');
  const inputTwitter = document.getElementById('input-twitter');
  
  // Validation Elements
  const msgName = document.getElementById('msg-name');
  const msgTitle = document.getElementById('msg-title');

  // Preview Elements
  const cardScene = document.getElementById('card-scene');
  const previewPlaceholder = document.getElementById('preview-placeholder');
  const interactiveCard = document.getElementById('interactive-card');
  const cardBadgeVal = document.getElementById('card-badge-val');
  const cardVerifyVal = document.getElementById('card-verify-val');
  const cardAvatar = document.getElementById('card-avatar');
  const cardNameVal = document.getElementById('card-name-val');
  const cardTitleVal = document.getElementById('card-title-val');
  const cardBioVal = document.getElementById('card-bio-val');
  const cardEmailVal = document.getElementById('card-email-val');
  const cardContactVal = document.getElementById('card-contact-val');
  const cardSocialsContainer = document.getElementById('card-socials-container');

  // Meta Panel Elements
  const metaPanel = document.getElementById('meta-panel');
  const metaCompleteness = document.getElementById('meta-completeness');
  const metaProgressBar = document.getElementById('meta-progress-bar');
  const metaReadTime = document.getElementById('meta-read-time');
  const metaId = document.getElementById('meta-id');
  const metaCreated = document.getElementById('meta-created');
  const btnCopyHtml = document.getElementById('btn-copy-html');
  const btnCopyData = document.getElementById('btn-copy-data');

  // History Elements
  const historySection = document.getElementById('history-section');
  const historyList = document.getElementById('history-list');
  const btnClearHistory = document.getElementById('btn-clear-history');

  // State
  let currentCardData = null;
  let activeAvatarUrl = '';

  // Theme Syncing
  themePicker.addEventListener('change', (e) => {
    const selectedTheme = e.target.value;
    setTheme(selectedTheme);
  });

  function setTheme(themeName) {
    // Remove old themes
    body.className = body.className.replace(/\btheme-\S+/g, '');
    body.classList.add(`theme-${themeName}`);
    themePicker.value = themeName;
    
    // Adjust accent color based on theme standard defaults if not overridden by custom picker
    const themeDefaults = {
      cyberpunk: '#ff007f',
      sunset: '#ff7b54',
      emerald: '#10b981',
      royal: '#a855f7',
      minimalist: '#1f2937'
    };
    
    // If user has not custom tweaked the color yet, load default
    if (inputAccent.value === '#ff007f' || Object.values(themeDefaults).includes(inputAccent.value)) {
      const targetColor = themeDefaults[themeName] || '#ff007f';
      inputAccent.value = targetColor;
      colorHexLabel.textContent = targetColor.toUpperCase();
      body.style.setProperty('--theme-accent', targetColor);
    }
  }

  // Accent Color Live Sync
  inputAccent.addEventListener('input', (e) => {
    const targetColor = e.target.value;
    colorHexLabel.textContent = targetColor.toUpperCase();
    body.style.setProperty('--theme-accent', targetColor);
  });

  // Preset Avatar Pickers
  const presetBtns = document.querySelectorAll('.preset-avatar-btn');
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      presetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const presetUrl = btn.getAttribute('data-url');
      activeAvatarUrl = presetUrl;
      
      // Update custom input field visually
      if (presetUrl) {
        inputAvatarUrl.value = presetUrl;
      } else {
        inputAvatarUrl.value = '';
      }
    });
  });

  inputAvatarUrl.addEventListener('input', (e) => {
    // If user types custom URL, clear presets selection unless it matches
    let matched = false;
    presetBtns.forEach(btn => {
      const presetUrl = btn.getAttribute('data-url');
      if (presetUrl && presetUrl === e.target.value) {
        btn.classList.add('active');
        matched = true;
      } else {
        btn.classList.remove('active');
      }
    });

    if (!matched && e.target.value !== '') {
      presetBtns.forEach(btn => {
        if (btn.getAttribute('data-url') === '') btn.classList.remove('active');
      });
    } else if (e.target.value === '') {
      // Re-enable auto preset
      document.querySelector('.preset-avatar-btn[data-url=""]').classList.add('active');
    }

    activeAvatarUrl = e.target.value;
  });

  // 3D Parallax Tilt Effect
  cardScene.addEventListener('mousemove', (e) => {
    if (interactiveCard.classList.contains('hidden')) return;
    
    const rect = cardScene.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position inside scene
    const y = e.clientY - rect.top;  // y position inside scene
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Degrees rotation bounds (-15deg to 15deg)
    const rotateY = ((x - centerX) / centerX) * 15;
    const rotateX = -((y - centerY) / centerY) * 15;
    
    interactiveCard.style.setProperty('--rx', `${rotateX}deg`);
    interactiveCard.style.setProperty('--ry', `${rotateY}deg`);
  });

  cardScene.addEventListener('mouseleave', () => {
    interactiveCard.style.setProperty('--rx', `0deg`);
    interactiveCard.style.setProperty('--ry', `0deg`);
  });

  // Client Validation Helpers
  function validateInputs() {
    let isValid = true;
    
    if (inputName.value.trim().length < 2) {
      msgName.classList.add('visible');
      inputName.parentElement.classList.add('invalid');
      isValid = false;
    } else {
      msgName.classList.remove('visible');
      inputName.parentElement.classList.remove('invalid');
    }
    
    if (inputTitle.value.trim().length < 2) {
      msgTitle.classList.add('visible');
      inputTitle.parentElement.classList.add('invalid');
      isValid = false;
    } else {
      msgTitle.classList.remove('visible');
      inputTitle.parentElement.classList.remove('invalid');
    }
    
    return isValid;
  }

  // Submit profile generation
  profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!validateInputs()) return;

    // Set Loading state
    btnText.classList.add('hidden');
    btnLoader.classList.remove('hidden');
    btnGenerate.disabled = true;

    const requestPayload = {
      name: inputName.value,
      title: inputTitle.value,
      bio: inputBio.value,
      avatarUrl: activeAvatarUrl,
      email: inputEmail.value,
      theme: themePicker.value,
      accentColor: inputAccent.value,
      github: inputGithub.value,
      linkedin: inputLinkedin.value,
      twitter: inputTwitter.value
    };

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestPayload)
      });

      if (!response.ok) {
        const errDetails = await response.json();
        throw new Error(errDetails.error || 'Server processing failed');
      }

      const data = await response.json();
      currentCardData = data;
      
      // Update UI with response details
      renderProfileCard(data);
      
      // Add card to history
      saveToHistory(data);
      
    } catch (err) {
      alert(`Error creating profile card: ${err.message}`);
    } finally {
      // Revert loading state
      btnText.classList.remove('hidden');
      btnLoader.classList.add('hidden');
      btnGenerate.disabled = false;
    }
  });

  // Render processed card
  function renderProfileCard(profile) {
    // Update Theme styling context
    setTheme(profile.theme);
    body.style.setProperty('--theme-accent', profile.accentColor);
    inputAccent.value = profile.accentColor;
    colorHexLabel.textContent = profile.accentColor.toUpperCase();

    // Populate Fields
    cardNameVal.textContent = profile.name;
    cardTitleVal.textContent = profile.title;
    cardBioVal.textContent = profile.bio || 'Professional identity crafted beautifully.';
    
    cardAvatar.src = profile.avatarUrl;
    cardAvatar.onerror = () => {
      cardAvatar.src = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(profile.name)}`;
    };

    // Card Badge and Verification
    cardBadgeVal.textContent = profile.meta.badge;
    if (profile.meta.verified) {
      cardVerifyVal.classList.remove('hidden');
    } else {
      cardVerifyVal.classList.add('hidden');
    }

    // Contact Email
    if (profile.email) {
      cardEmailVal.textContent = profile.email;
      cardContactVal.classList.remove('hidden');
    } else {
      cardContactVal.classList.add('hidden');
    }

    // Social handles render
    cardSocialsContainer.innerHTML = '';
    
    if (profile.socials.github) {
      const ghBtn = document.createElement('a');
      ghBtn.href = `https://github.com/${profile.socials.github}`;
      ghBtn.target = '_blank';
      ghBtn.className = 'card-social-btn';
      ghBtn.title = 'GitHub Profile';
      ghBtn.innerHTML = '<i class="fa-brands fa-github"></i>';
      cardSocialsContainer.appendChild(ghBtn);
    }
    
    if (profile.socials.linkedin) {
      const liBtn = document.createElement('a');
      liBtn.href = `https://linkedin.com/in/${profile.socials.linkedin}`;
      liBtn.target = '_blank';
      liBtn.className = 'card-social-btn';
      liBtn.title = 'LinkedIn Profile';
      liBtn.innerHTML = '<i class="fa-brands fa-linkedin-in"></i>';
      cardSocialsContainer.appendChild(liBtn);
    }

    if (profile.socials.twitter) {
      const twBtn = document.createElement('a');
      twBtn.href = `https://x.com/${profile.socials.twitter}`;
      twBtn.target = '_blank';
      twBtn.className = 'card-social-btn';
      twBtn.title = 'X / Twitter Profile';
      twBtn.innerHTML = '<i class="fa-brands fa-x-twitter"></i>';
      cardSocialsContainer.appendChild(twBtn);
    }

    // Show interactive components, hide placeholder
    previewPlaceholder.classList.add('hidden');
    interactiveCard.classList.remove('hidden');

    // Populate metadata details
    metaCompleteness.textContent = `${profile.meta.completeness}%`;
    metaProgressBar.style.width = `${profile.meta.completeness}%`;
    metaReadTime.textContent = `~${profile.meta.readTimeSec}s`;
    metaId.textContent = profile.id;
    
    const creationDate = new Date(profile.meta.createdAt);
    metaCreated.textContent = creationDate.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Make analytics section visible
    metaPanel.classList.remove('hidden');

    // Scroll to card view if mobile screen size
    if (window.innerWidth <= 992) {
      cardScene.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Copy HTML/CSS utilities
  btnCopyHtml.addEventListener('click', () => {
    if (!currentCardData) return;

    const themeColors = {
      cyberpunk: { bg: '#090616', card: '#1c1436', text: '#bfc2db' },
      sunset: { bg: '#1c081e', card: '#45144a', text: '#ebd5ed' },
      emerald: { bg: '#030f0c', card: '#0e2e26', text: '#c1ded7' },
      royal: { bg: '#09041a', card: '#211545', text: '#d9d4f0' },
      minimalist: { bg: '#f4f6fa', card: '#ffffff', text: '#4b5563' }
    };
    const details = themeColors[currentCardData.theme] || themeColors.cyberpunk;

    const htmlTemplate = `
<!-- ProfileCard.io Generated Card -->
<div class="profile-card-embed" style="
  width: 350px;
  background: ${details.card};
  border: 1px solid ${currentCardData.accentColor}40;
  border-radius: 16px;
  padding: 24px;
  font-family: system-ui, -apple-system, sans-serif;
  color: ${details.text};
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
">
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
    <span style="background: ${currentCardData.accentColor}; color: #fff; padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: bold; text-transform: uppercase;">${currentCardData.meta.badge}</span>
  </div>
  <div style="text-align: center; margin-bottom: 15px;">
    <img src="${currentCardData.avatarUrl}" style="width: 80px; height: 80px; border-radius: 50%; border: 2px solid #fff; object-fit: cover;" alt="Avatar">
    <h3 style="margin: 10px 0 2px 0; color: #fff; font-size: 20px;">${currentCardData.name}</h3>
    <p style="margin: 0; color: ${currentCardData.accentColor}; font-size: 12px; font-weight: bold; text-transform: uppercase;">${currentCardData.title}</p>
    <div style="width: 30px; height: 2px; background: ${currentCardData.accentColor}; margin: 10px auto;"></div>
    <p style="font-size: 13px; line-height: 1.4; margin: 0;">${currentCardData.bio}</p>
  </div>
</div>
    `;

    navigator.clipboard.writeText(htmlTemplate.trim())
      .then(() => {
        const originalText = btnCopyHtml.innerHTML;
        btnCopyHtml.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
        setTimeout(() => btnCopyHtml.innerHTML = originalText, 2000);
      })
      .catch(err => console.error('Clipboard write failed: ', err));
  });

  // Copy JSON Data
  btnCopyData.addEventListener('click', () => {
    if (!currentCardData) return;
    
    navigator.clipboard.writeText(JSON.stringify(currentCardData, null, 2))
      .then(() => {
        const originalText = btnCopyData.innerHTML;
        btnCopyData.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
        setTimeout(() => btnCopyData.innerHTML = originalText, 2000);
      })
      .catch(err => console.error('Clipboard write failed: ', err));
  });

  // Local Storage History Management
  function getHistory() {
    try {
      const stored = localStorage.getItem('profile_cards_history');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  function saveToHistory(profile) {
    let history = getHistory();
    // Exclude duplicates of same Name & Title
    history = history.filter(item => !(item.name === profile.name && item.title === profile.title));
    
    // Add to top of list
    history.unshift(profile);
    
    // Limit to 6 entries
    if (history.length > 6) history.pop();
    
    localStorage.setItem('profile_cards_history', JSON.stringify(history));
    renderHistoryList();
  }

  function deleteHistoryItem(id, event) {
    if (event) event.stopPropagation(); // Avoid triggering card loading
    let history = getHistory();
    history = history.filter(item => item.id !== id);
    localStorage.setItem('profile_cards_history', JSON.stringify(history));
    renderHistoryList();
  }

  function renderHistoryList() {
    const history = getHistory();
    
    if (history.length === 0) {
      historySection.classList.add('hidden');
      return;
    }

    historyList.innerHTML = '';
    
    history.forEach(item => {
      const itemEl = document.createElement('div');
      itemEl.className = 'history-item';
      itemEl.title = 'Click to load in preview';
      itemEl.addEventListener('click', () => {
        // Load details back into form inputs
        inputName.value = item.name;
        inputTitle.value = item.title;
        inputBio.value = item.bio;
        inputEmail.value = item.email;
        inputAccent.value = item.accentColor;
        colorHexLabel.textContent = item.accentColor.toUpperCase();
        
        // Find matching preset avatar or fill URL field
        let matchFound = false;
        presetBtns.forEach(btn => {
          const presetUrl = btn.getAttribute('data-url');
          if (presetUrl && presetUrl === item.avatarUrl) {
            btn.classList.add('active');
            matchFound = true;
          } else {
            btn.classList.remove('active');
          }
        });
        
        if (!matchFound) {
          document.querySelector('.preset-avatar-btn[data-url=""]').classList.remove('active');
          inputAvatarUrl.value = item.avatarUrl;
        } else {
          inputAvatarUrl.value = '';
        }
        
        activeAvatarUrl = item.avatarUrl;
        themePicker.value = item.theme;
        
        currentCardData = item;
        renderProfileCard(item);
      });

      // Item Avatar Image
      const avatarImg = document.createElement('img');
      avatarImg.className = 'history-item-avatar';
      avatarImg.src = item.avatarUrl;
      avatarImg.onerror = () => {
        avatarImg.src = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(item.name)}`;
      };

      // Item Details
      const detailsEl = document.createElement('div');
      detailsEl.className = 'history-item-details';
      
      const nameEl = document.createElement('span');
      nameEl.className = 'history-item-name';
      nameEl.textContent = item.name;
      
      const titleEl = document.createElement('span');
      titleEl.className = 'history-item-title';
      titleEl.textContent = item.title;
      
      const badgeEl = document.createElement('span');
      badgeEl.className = 'history-item-badge';
      badgeEl.textContent = `${item.meta.badge} — ${item.meta.completeness}% Strength`;

      detailsEl.appendChild(nameEl);
      detailsEl.appendChild(titleEl);
      detailsEl.appendChild(badgeEl);

      // Delete Button
      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'history-item-delete';
      deleteBtn.title = 'Delete history card';
      deleteBtn.innerHTML = '<i class="fa-regular fa-trash-can"></i>';
      deleteBtn.addEventListener('click', (e) => deleteHistoryItem(item.id, e));

      itemEl.appendChild(avatarImg);
      itemEl.appendChild(detailsEl);
      itemEl.appendChild(deleteBtn);
      
      historyList.appendChild(itemEl);
    });

    historySection.classList.remove('hidden');
  }

  // Clear History handler
  btnClearHistory.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear your generation history?')) {
      localStorage.removeItem('profile_cards_history');
      renderHistoryList();
    }
  });

  // Initial load history rendering
  renderHistoryList();
});
