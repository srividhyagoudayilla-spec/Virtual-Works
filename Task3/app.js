// State Management
let coffeesState = [];
let activeCategory = 'all';

// Coffee Trivia list to display random facts
const coffeeFacts = [
  "Coffee remains warm 20% longer when you add milk or cream.",
  "Espresso has about one-third the caffeine of a regular drip coffee.",
  "The word 'espresso' comes from Italian, meaning 'expressed' or 'forced out'.",
  "Light roast coffees actually have slightly more caffeine than dark roasts.",
  "Coffee is the second most traded commodity in the world, right after crude oil.",
  "The first webcam was created at Cambridge University just to check a coffee pot's status.",
  "Cold brew coffee is naturally sweeter and less acidic than hot-brewed coffee."
];

// Inline SVG helper to draw beautiful, premium vector cups
function getCoffeeSVG(name, category) {
  const normName = name.toLowerCase();
  
  if (normName.includes('cold brew') || category.toLowerCase() === 'cold') {
    // Tall iced coffee glass with straw and ice cubes
    return `
      <svg class="coffee-icon-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Liquid Level -->
        <path d="M35 30H65V75C65 79.4 61.4 83 57 83H43C38.6 83 35 79.4 35 75V30Z" fill="var(--primary)" opacity="0.8"/>
        <!-- Ice Cubes -->
        <rect x="42" y="38" width="12" height="12" rx="2" transform="rotate(15 42 38)" fill="#faedcd" opacity="0.6"/>
        <rect x="48" y="55" width="10" height="10" rx="2" transform="rotate(-25 48 55)" fill="#faedcd" opacity="0.6"/>
        <!-- Glass Outline -->
        <path d="M30 20L35 80C35.5 85 40 88 45 88H55C60 88 64.5 85 65 80L70 20" stroke="var(--primary)" stroke-width="3" stroke-linecap="round"/>
        <!-- Straw -->
        <line x1="48" y1="8" x2="62" y2="60" stroke="#faedcd" stroke-width="4" stroke-linecap="round"/>
        <line x1="48" y1="8" x2="42" y2="8" stroke="#faedcd" stroke-width="4" stroke-linecap="round"/>
      </svg>
    `;
  }
  
  if (normName.includes('espresso')) {
    // Elegant, small espresso demitasse cup with saucer
    return `
      <svg class="coffee-icon-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Crema Layer -->
        <ellipse cx="45" cy="48" rx="20" ry="7" fill="#8b5a2b"/>
        <!-- Cup Body -->
        <path d="M25 45C25 58.8 34 68 45 68C56 68 65 58.8 65 45H25Z" fill="var(--surface-hover)" stroke="var(--primary)" stroke-width="3"/>
        <!-- Cup Handle -->
        <path d="M65 48C70 48 74 52 74 56C74 60 70 62 65 62" stroke="var(--primary)" stroke-width="3" stroke-linecap="round"/>
        <!-- Saucer -->
        <path d="M20 78C32 84 58 84 70 78" stroke="var(--primary)" stroke-width="3" stroke-linecap="round"/>
      </svg>
    `;
  }
  
  if (normName.includes('mocha') || normName.includes('sweet') || category.toLowerCase() === 'sweet') {
    // Tall mug with whipped cream topping
    return `
      <svg class="coffee-icon-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Coffee Liquid inside -->
        <rect x="33" y="38" width="34" height="38" rx="4" fill="var(--primary)" opacity="0.7"/>
        <!-- Tall Glass Outline -->
        <path d="M30 30V76C30 80.4 33.6 84 38 84H62C66.4 84 70 80.4 70 76V30" stroke="var(--primary)" stroke-width="3" stroke-linecap="round"/>
        <!-- Glass Handle -->
        <path d="M70 42C76 42 80 47 80 53V61C80 67 76 72 70 72" stroke="var(--primary)" stroke-width="3"/>
        <!-- Whipped Cream Peak -->
        <path d="M33 30C33 22 41 18 47 22C47 16 53 14 59 20C65 18 67 24 67 30H33Z" fill="#faedcd" stroke="var(--primary)" stroke-width="1.5"/>
        <!-- Drizzle -->
        <path d="M38 28Q45 22 50 29T62 26" stroke="#4a2c11" stroke-width="2" stroke-linecap="round" fill="none"/>
      </svg>
    `;
  }

  // Default Standard Cappuccino / Latte cup with Latte Art
  return `
    <svg class="coffee-icon-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Foam Art (Heart representation) -->
      <path d="M45 42C45 40 42 37 39 37C35.5 37 34 40.5 36 43.5C38 46.5 45 52 45 52C45 52 52 46.5 54 43.5C56 40.5 54.5 37 51 37C48 37 45 40 45 42Z" fill="#faedcd" opacity="0.9"/>
      <!-- Cup Body -->
      <path d="M20 40C20 59.3 31.2 70 45 70C58.8 70 70 59.3 70 40H20Z" fill="var(--surface-hover)" stroke="var(--primary)" stroke-width="3" stroke-linejoin="round"/>
      <!-- Cup Handle -->
      <path d="M70 45C76 45 81 49 81 54C81 59 76 61 70 61" stroke="var(--primary)" stroke-width="3" stroke-linecap="round"/>
      <!-- Plate/Saucer -->
      <path d="M12 78C26 86 64 86 78 78" stroke="var(--primary)" stroke-width="3" stroke-linecap="round"/>
    </svg>
  `;
}

// Render dynamic statistics
function renderStats() {
  const totalVotes = coffeesState.reduce((sum, item) => sum + item.votes, 0);
  document.getElementById('totalVotes').textContent = totalVotes.toLocaleString();
  
  if (coffeesState.length > 0) {
    // Sort to find leader (first item in coffeesState is already sorted by votes DESC from API)
    const leader = coffeesState[0];
    document.getElementById('leaderName').textContent = `${leader.name} (${leader.votes} votes)`;
  } else {
    document.getElementById('leaderName').textContent = "None yet";
  }
}

// Display Toast Notifications
function showToast(title, desc, type = 'default') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icon = type === 'success' ? '☕' : '⚠️';
  
  toast.innerHTML = `
    <div class="toast-icon">${icon}</div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-desc">${desc}</div>
    </div>
  `;
  
  container.appendChild(toast);
  
  // Clean up element after animation finishes
  setTimeout(() => {
    toast.remove();
  }, 4000);
}

// Fetch menu from the server
async function fetchCoffees() {
  try {
    const response = await fetch('/api/coffees');
    if (!response.ok) throw new Error('Failed to retrieve items.');
    coffeesState = await response.json();
    renderMenu();
    renderStats();
  } catch (error) {
    console.error('Error fetching coffee data:', error);
    document.getElementById('menuGrid').innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">☕</div>
        <h3>Failed to grind coffee beans</h3>
        <p>Could not connect to the database server. Please verify the backend is running.</p>
        <button class="vote-action-btn" onclick="fetchCoffees()" style="margin-top: 1rem; width: auto; padding: 0.6rem 1.5rem;">Try Again</button>
      </div>
    `;
  }
}

// Cast vote with Optimistic UI updates
async function castVote(coffeeId) {
  // Find coffee in state
  const targetIndex = coffeesState.findIndex(c => c.id === coffeeId);
  if (targetIndex === -1) return;
  
  const originalCoffeeState = { ...coffeesState[targetIndex] };
  const originalAllState = coffeesState.map(c => ({ ...c }));
  
  // Optimistic UI Update: Increment local vote count instantly
  coffeesState[targetIndex].votes += 1;
  // Re-sort state so elements rearrange seamlessly
  coffeesState.sort((a, b) => b.votes - a.votes || b.rating - a.rating);
  
  renderMenu();
  renderStats();
  
  showToast('Vote Placed!', `Your vote for ${originalCoffeeState.name} has been counted.`, 'success');
  
  try {
    const response = await fetch(`/api/coffees/${coffeeId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error('Server error when registering vote.');
    }
    
    const data = await response.json();
    
    // Sync state with actual server response just in case other votes happened
    const freshDataResponse = await fetch('/api/coffees');
    if (freshDataResponse.ok) {
      coffeesState = await freshDataResponse.json();
      renderMenu();
      renderStats();
    }
    
  } catch (err) {
    console.error('Voting failed, rolling back UI:', err);
    // Rollback UI to original state
    coffeesState = originalAllState;
    renderMenu();
    renderStats();
    showToast('Voting Error', 'Failed to save your vote. Please try again.', 'error');
  }
}

// Render menu grid based on state and active filter
function renderMenu() {
  const menuGrid = document.getElementById('menuGrid');
  
  // Filter coffees
  const filteredCoffees = coffeesState.filter(coffee => {
    return activeCategory === 'all' || coffee.category === activeCategory;
  });
  
  if (filteredCoffees.length === 0) {
    menuGrid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🍂</div>
        <h3>No brews found</h3>
        <p>No coffee items match the selected category filter.</p>
      </div>
    `;
    return;
  }
  
  // Calculate total votes for percentage calculations
  const totalVotes = coffeesState.reduce((sum, item) => sum + item.votes, 0) || 1;
  
  menuGrid.innerHTML = filteredCoffees.map(coffee => {
    // Calculate percentage share
    const voteShare = ((coffee.votes / totalVotes) * 100).toFixed(1);
    
    return `
      <article class="coffee-card" data-id="${coffee.id}">
        <div class="card-badge">${coffee.category}</div>
        
        <div class="card-visual">
          <div class="steam-container">
            <div class="steam-line"></div>
            <div class="steam-line"></div>
            <div class="steam-line"></div>
          </div>
          <div class="coffee-svg-wrapper">
            ${getCoffeeSVG(coffee.name, coffee.category)}
          </div>
        </div>
        
        <div class="card-info">
          <div class="card-header">
            <h3 class="coffee-title">${coffee.name}</h3>
            <span class="coffee-rating">
              <svg class="rating-star" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.62L12 2L9.19 8.62L2 9.24L7.45 13.97L5.82 21L12 17.27Z"/>
              </svg>
              ${coffee.rating.toFixed(1)}
            </span>
          </div>
          
          <p class="coffee-desc">${coffee.description}</p>
          
          <div class="vote-metrics">
            <div class="vote-status-row">
              <span class="vote-count-label">Votes</span>
              <span class="vote-count-num" id="votes-val-${coffee.id}">${coffee.votes} <span style="font-size:0.75rem; font-weight:normal; color:var(--text-muted);">(${voteShare}%)</span></span>
            </div>
            <div class="vote-bar-bg">
              <div class="vote-bar-fill" style="width: ${voteShare}%;"></div>
            </div>
          </div>
          
          <button class="vote-action-btn" onclick="castVote(${coffee.id})">
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
            </svg>
            Vote Brew
          </button>
        </div>
      </article>
    `;
  }).join('');
}

// Add Filter Logic
document.getElementById('filterButtons').addEventListener('click', (e) => {
  if (!e.target.classList.contains('filter-btn')) return;
  
  // Remove active state from current button
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  
  // Add active state to clicked button
  e.target.classList.add('active');
  
  // Update state filter and rerender
  activeCategory = e.target.getAttribute('data-category');
  renderMenu();
});

// Seed Random Coffee Fact
function displayRandomFact() {
  const factIndex = Math.floor(Math.random() * coffeeFacts.length);
  document.getElementById('coffeeFact').textContent = coffeeFacts[factIndex];
}

// Setup Reset Link
document.getElementById('resetDbLink').addEventListener('click', async (e) => {
  e.preventDefault();
  if (confirm('This will restart the voting session. Proceed?')) {
    // For demo purposes, we can trigger a hard reload of data by restarting/reseeding.
    // Let's implement a quick POST to delete/reset the db or just mock a clear.
    // Since we don't have a direct reset API endpoint, let's create a reset action or let the user know they can reload the server.
    // Wait, let's add a reset API route to server.js if needed, or simply reload.
    // Let's create a reset endpoint in our server.js to make it work!
    try {
      const response = await fetch('/api/reset', { method: 'POST' });
      if (response.ok) {
        showToast('Reset Complete', 'Votes have been re-seeded to default settings.', 'success');
        fetchCoffees();
      } else {
        showToast('Reset Failed', 'Server rejected database reset.', 'error');
      }
    } catch (err) {
      showToast('Reset Error', 'Could not connect to reset api.', 'error');
    }
  }
});

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
  fetchCoffees();
  displayRandomFact();
  // Rotate facts every 15 seconds
  setInterval(displayRandomFact, 15000);
});
