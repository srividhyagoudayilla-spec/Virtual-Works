const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'database.db');

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Connect to SQLite Database
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    initializeDatabase();
  }
});

// Helper functions to wrap sqlite3 operations in Promises
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Initialize database schema and seed data
async function initializeDatabase() {
  try {
    // Create coffees table if not exists
    await dbRun(`
      CREATE TABLE IF NOT EXISTS coffees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT NOT NULL,
        rating REAL NOT NULL,
        votes INTEGER DEFAULT 0,
        category TEXT NOT NULL
      )
    `);

    // Check if table is empty to seed initial data
    const countRow = await dbGet('SELECT COUNT(*) AS count FROM coffees');
    if (countRow.count === 0) {
      console.log('Seeding initial coffee items...');
      const coffees = [
        {
          name: 'Cold Brew',
          description: 'Slow-steeped in cold water for 12 hours, yielding a super smooth, low-acid iced coffee.',
          rating: 4.9,
          votes: 50,
          category: 'Cold'
        },
        {
          name: 'Espresso',
          description: 'Bold, intense, and rich. The pure concentrated essence of premium coffee beans.',
          rating: 4.8,
          votes: 42,
          category: 'Classic'
        },
        {
          name: 'Flat White',
          description: 'Velvety microfoam poured over a double shot of smooth ristretto espresso.',
          rating: 4.7,
          votes: 25,
          category: 'Specialty'
        },
        {
          name: 'Cappuccino',
          description: 'Perfect harmony of rich espresso, warm steamed milk, and a thick layer of velvety foam.',
          rating: 4.6,
          votes: 28,
          category: 'Classic'
        },
        {
          name: 'Latte',
          description: 'Smooth espresso combined with generous steamed milk and a light, delicate layer of foam.',
          rating: 4.5,
          votes: 35,
          category: 'Classic'
        },
        {
          name: 'Mocha',
          description: 'Decadent fusion of bold espresso, hot steamed milk, and rich, sweet chocolate syrup.',
          rating: 4.4,
          votes: 30,
          category: 'Sweet'
        },
        {
          name: 'Macchiato',
          description: 'A classic espresso shot stained with a subtle dollop of warm, frothy milk foam.',
          rating: 4.3,
          votes: 18,
          category: 'Specialty'
        },
        {
          name: 'Americano',
          description: 'Rich espresso shots topped with hot water, offering a smooth yet bold coffee profile.',
          rating: 4.2,
          votes: 15,
          category: 'Classic'
        }
      ];

      const stmt = db.prepare('INSERT INTO coffees (name, description, rating, votes, category) VALUES (?, ?, ?, ?, ?)');
      for (const coffee of coffees) {
        stmt.run(coffee.name, coffee.description, coffee.rating, coffee.votes, coffee.category);
      }
      stmt.finalize();
      console.log('Seeding completed successfully.');
    }
  } catch (err) {
    console.error('Error initializing database:', err.message);
  }
}

// API Routes

// Get all coffees
app.get('/api/coffees', async (req, res) => {
  try {
    // Return coffees ordered by votes descending (leaderboard feel)
    const coffees = await dbAll('SELECT * FROM coffees ORDER BY votes DESC, rating DESC');
    res.json(coffees);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve coffee items' });
  }
});

// Vote for a coffee
app.post('/api/coffees/:id/vote', async (req, res) => {
  const coffeeId = parseInt(req.params.id, 10);
  if (isNaN(coffeeId)) {
    return res.status(400).json({ error: 'Invalid coffee ID' });
  }

  try {
    // Check if coffee exists
    const coffee = await dbGet('SELECT * FROM coffees WHERE id = ?', [coffeeId]);
    if (!coffee) {
      return res.status(404).json({ error: 'Coffee item not found' });
    }

    // Increment vote count
    await dbRun('UPDATE coffees SET votes = votes + 1 WHERE id = ?', [coffeeId]);

    // Retrieve updated coffee details
    const updatedCoffee = await dbGet('SELECT * FROM coffees WHERE id = ?', [coffeeId]);
    res.json({ message: 'Vote registered successfully', coffee: updatedCoffee });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to register vote' });
  }
});

// Reset database
app.post('/api/reset', async (req, res) => {
  try {
    await dbRun('DROP TABLE IF EXISTS coffees');
    await initializeDatabase();
    res.json({ message: 'Database reset and re-seeded successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reset database' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
