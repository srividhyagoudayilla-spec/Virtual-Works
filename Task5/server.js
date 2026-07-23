const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;
const dataDir = path.join(__dirname, 'data');
const usersFile = path.join(dataDir, 'users.json');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function loadUsers() {
  if (!fs.existsSync(usersFile)) {
    const seedUsers = [
      { id: 1, name: 'Ava Patel', role: 'Frontend Engineer', available: true },
      { id: 2, name: 'Noah Kim', role: 'Backend Engineer', available: true },
      { id: 3, name: 'Mina Chen', role: 'Product Designer', available: false },
      { id: 4, name: 'Liam Brooks', role: 'QA Lead', available: true }
    ];
    fs.writeFileSync(usersFile, JSON.stringify(seedUsers, null, 2));
    return seedUsers;
  }

  try {
    const raw = fs.readFileSync(usersFile, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Could not read users file, resetting data.', error);
    const fallbackUsers = [
      { id: 1, name: 'Ava Patel', role: 'Frontend Engineer', available: true },
      { id: 2, name: 'Noah Kim', role: 'Backend Engineer', available: true },
      { id: 3, name: 'Mina Chen', role: 'Product Designer', available: false },
      { id: 4, name: 'Liam Brooks', role: 'QA Lead', available: true }
    ];
    fs.writeFileSync(usersFile, JSON.stringify(fallbackUsers, null, 2));
    return fallbackUsers;
  }
}

let users = loadUsers();

function saveUsers() {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/users', (_req, res) => {
  res.json(users);
});

app.patch('/api/users/:id', (req, res) => {
  const userId = Number(req.params.id);
  const available = req.body?.available;

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ error: 'Invalid user id' });
  }

  if (typeof available !== 'boolean') {
    return res.status(400).json({ error: 'available must be a boolean' });
  }

  const user = users.find((entry) => entry.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  user.available = available;
  saveUsers();
  res.json(user);
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Availability tracker running at http://localhost:${port}`);
});

module.exports = { app, usersFile };
