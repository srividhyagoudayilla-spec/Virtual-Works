const usersContainer = document.getElementById('users');

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderUsers(users) {
  usersContainer.innerHTML = users
    .map(
      (user) => `
        <article class="user-card ${user.available ? 'available' : 'offline'}">
          <div class="user-info">
            <h2>${escapeHtml(user.name)}</h2>
            <p>${escapeHtml(user.role)}</p>
          </div>
          <div class="card-actions">
            <span class="status-pill">${user.available ? 'Available' : 'Away'}</span>
            <label class="switch">
              <input type="checkbox" data-user-id="${user.id}" ${user.available ? 'checked' : ''} />
              <span class="slider"></span>
            </label>
          </div>
        </article>
      `
    )
    .join('');

  usersContainer.querySelectorAll('input[type="checkbox"]').forEach((input) => {
    input.addEventListener('change', async (event) => {
      const target = event.currentTarget;
      const userId = Number(target.dataset.userId);
      const available = target.checked;
      const card = target.closest('.user-card');
      const statusPill = card?.querySelector('.status-pill');

      if (card) {
        card.classList.toggle('available', available);
        card.classList.toggle('offline', !available);
      }

      if (statusPill) {
        statusPill.textContent = available ? 'Available' : 'Away';
      }

      try {
        const response = await fetch(`/api/users/${userId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ available })
        });

        if (!response.ok) {
          throw new Error('Could not update availability');
        }
      } catch (error) {
        target.checked = !available;
        if (card) {
          card.classList.toggle('available', !available);
          card.classList.toggle('offline', available);
        }
        if (statusPill) {
          statusPill.textContent = !available ? 'Available' : 'Away';
        }
        console.error(error);
      }
    });
  });
}

async function loadUsers() {
  try {
    const response = await fetch('/api/users');
    if (!response.ok) {
      throw new Error('Could not fetch users');
    }

    const users = await response.json();
    renderUsers(users);
  } catch (error) {
    usersContainer.innerHTML = '<p>Unable to load the team roster right now.</p>';
    console.error(error);
  }
}

loadUsers();
