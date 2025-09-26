import sqlite3 from 'sqlite3';
import { promisify } from 'util';

const db = new sqlite3.Database('./database.sqlite');

// Promisify database methods
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
};

const dbGet = promisify(db.get.bind(db));
const dbAll = promisify(db.all.bind(db));

// Initialize database tables
export const initDatabase = async () => {
  try {
    // Users table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT,
        google_id TEXT UNIQUE,
        name TEXT,
        avatar_url TEXT,
        credits INTEGER DEFAULT 0,
        subscription_id TEXT,
        subscription_status TEXT DEFAULT 'inactive',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Usage history table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS usage_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        action TEXT NOT NULL,
        credits_used INTEGER DEFAULT 0,
        details TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Credit transactions table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS credit_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL, -- 'earned', 'spent', 'purchased'
        amount INTEGER NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Photos table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        original_image_url TEXT,
        generated_images TEXT NOT NULL, -- JSON array of base64 images
        theme TEXT NOT NULL,
        credits_used INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

// User operations
export const createUser = async (userData) => {
  const { email, passwordHash, googleId, name, avatarUrl } = userData;
  const result = await dbRun(
    `INSERT INTO users (email, password_hash, google_id, name, avatar_url) 
     VALUES (?, ?, ?, ?, ?)`,
    [email, passwordHash, googleId, name, avatarUrl]
  );
  return result.lastID;
};

export const getUserByEmail = async (email) => {
  return await dbGet('SELECT * FROM users WHERE email = ?', [email]);
};

export const getUserById = async (id) => {
  return await dbGet('SELECT * FROM users WHERE id = ?', [id]);
};

export const getUserByGoogleId = async (googleId) => {
  return await dbGet('SELECT * FROM users WHERE google_id = ?', [googleId]);
};

export const updateUserCredits = async (userId, credits) => {
  await dbRun(
    'UPDATE users SET credits = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [credits, userId]
  );
};

export const addCredits = async (userId, amount, description = 'Credits added') => {
  // Get current credits
  const user = await getUserById(userId);
  const newCredits = user.credits + amount;
  
  // Update user credits
  await updateUserCredits(userId, newCredits);
  
  // Record transaction
  await dbRun(
    `INSERT INTO credit_transactions (user_id, type, amount, description) 
     VALUES (?, 'earned', ?, ?)`,
    [userId, amount, description]
  );
  
  return newCredits;
};

export const spendCredits = async (userId, amount, description = 'Credits spent') => {
  // Get current credits
  const user = await getUserById(userId);
  
  if (user.credits < amount) {
    throw new Error('Insufficient credits');
  }
  
  const newCredits = user.credits - amount;
  
  // Update user credits
  await updateUserCredits(userId, newCredits);
  
  // Record transaction
  await dbRun(
    `INSERT INTO credit_transactions (user_id, type, amount, description) 
     VALUES (?, 'spent', ?, ?)`,
    [userId, amount, description]
  );
  
  return newCredits;
};

export const recordUsage = async (userId, action, creditsUsed = 0, details = '') => {
  await dbRun(
    `INSERT INTO usage_history (user_id, action, credits_used, details) 
     VALUES (?, ?, ?, ?)`,
    [userId, action, creditsUsed, details]
  );
};

export const getUserUsageHistory = async (userId, limit = 50) => {
  return await dbAll(
    `SELECT * FROM usage_history 
     WHERE user_id = ? 
     ORDER BY created_at DESC 
     LIMIT ?`,
    [userId, limit]
  );
};

export const getUserCreditTransactions = async (userId, limit = 50) => {
  return await dbAll(
    `SELECT * FROM credit_transactions 
     WHERE user_id = ? 
     ORDER BY created_at DESC 
     LIMIT ?`,
    [userId, limit]
  );
};

export const updateUserSubscription = async (userId, subscriptionId, status) => {
  await dbRun(
    `UPDATE users 
     SET subscription_id = ?, subscription_status = ?, updated_at = CURRENT_TIMESTAMP 
     WHERE id = ?`,
    [subscriptionId, status, userId]
  );
};

// Photo operations
export const getUserPhotos = async (userId, limit = 50) => {
  const photos = await dbAll(
    `SELECT * FROM photos 
     WHERE user_id = ? 
     ORDER BY created_at DESC 
     LIMIT ?`,
    [userId, limit]
  );
  return photos;
};

export const savePhoto = async (userId, originalImageUrl, generatedImages, theme, creditsUsed = 0) => {
  const result = await dbRun(
    `INSERT INTO photos (user_id, original_image_url, generated_images, theme, credits_used)
     VALUES (?, ?, ?, ?, ?)`,
    [userId, originalImageUrl, JSON.stringify(generatedImages), theme, creditsUsed]
  );
  return result.lastID;
};

export const deletePhoto = async (photoId, userId) => {
  const result = await dbRun(
    `DELETE FROM photos WHERE id = ? AND user_id = ?`,
    [photoId, userId]
  );
  return result.changes > 0;
};

// Photo operations are handled by database-gcs.js

export { db };
