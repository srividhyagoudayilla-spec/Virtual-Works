import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and JSON body parsing
app.use(cors());
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Profile card processing API
app.post('/api/profile', (req, res) => {
  const {
    name,
    title,
    bio,
    avatarUrl,
    email,
    theme,
    accentColor,
    github,
    linkedin,
    twitter
  } = req.body;

  // Simple backend validations
  if (!name || name.trim().length < 2) {
    return res.status(400).json({ error: 'Name must be at least 2 characters long.' });
  }

  if (!title || title.trim().length < 2) {
    return res.status(400).json({ error: 'Job title/role must be at least 2 characters long.' });
  }

  // Sanitizing inputs and setting defaults
  const cleanName = name.trim();
  const cleanTitle = title.trim();
  const cleanBio = bio ? bio.trim() : '';
  const cleanEmail = email ? email.trim().toLowerCase() : '';
  const cleanTheme = theme || 'cyberpunk';
  const cleanAccentColor = accentColor || '#ff007f';

  // Handle avatar fallback: use robot avatar generator if empty
  let finalAvatar = avatarUrl ? avatarUrl.trim() : '';
  if (!finalAvatar) {
    // Dicebear avatars or robohash
    finalAvatar = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(cleanName)}`;
  }

  // Calculate profile completeness score
  let score = 0;
  const fields = [cleanName, cleanTitle, cleanBio, finalAvatar, cleanEmail, github, linkedin, twitter];
  fields.forEach(field => {
    if (field && field.trim() !== '') score += 1;
  });
  const completeness = Math.round((score / fields.length) * 100);

  // Compute read time for bio
  const wordCount = cleanBio.split(/\s+/).filter(Boolean).length;
  const readTimeSec = Math.max(1, Math.round(wordCount / 2.5)); // ~150 WPM

  // Determine a specialty badge
  let badge = 'Rising Star';
  const hasSocials = github && linkedin && twitter;
  if (hasSocials) {
    badge = 'Networking Guru';
  } else if (wordCount > 40) {
    badge = 'Storyteller';
  } else if (cleanTitle.toLowerCase().includes('engineer') || cleanTitle.toLowerCase().includes('developer') || cleanTitle.toLowerCase().includes('coder')) {
    badge = 'Tech Craftsman';
  } else if (completeness === 100) {
    badge = 'Completionist';
  }

  // Construct processed response payload
  const processedProfile = {
    id: `prof_${Math.random().toString(36).substr(2, 9)}`,
    name: cleanName,
    title: cleanTitle,
    bio: cleanBio,
    avatarUrl: finalAvatar,
    email: cleanEmail,
    theme: cleanTheme,
    accentColor: cleanAccentColor,
    socials: {
      github: github ? github.trim() : '',
      linkedin: linkedin ? linkedin.trim() : '',
      twitter: twitter ? twitter.trim() : ''
    },
    meta: {
      completeness,
      readTimeSec,
      badge,
      createdAt: new Date().toISOString(),
      verified: completeness >= 75
    }
  };

  return res.status(200).json(processedProfile);
});

// Serve index.html for any other route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
