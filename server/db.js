import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const db = new Database(path.join(__dirname, 'database.db'));

// Enable WAL mode for better concurrency and stability
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    author TEXT,
    date TEXT,
    category TEXT,
    image TEXT,
    featured INTEGER DEFAULT 0,
    readTime TEXT,
    status TEXT DEFAULT 'published',
    metaTitle TEXT,
    metaDescription TEXT,
    publishDate TEXT,
    tags TEXT DEFAULT '[]',
    createdAt TEXT,
    updatedAt TEXT
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );
`);

// Step 4: Fix status default
db.prepare("UPDATE posts SET status='published' WHERE status IS NULL OR status=''").run();

export default db;

export const mapPost = (post) => {
    if (!post) return null;
    let tags = [];
    try {
        tags = post.tags ? JSON.parse(post.tags) : [];
    } catch (e) {
        tags = [];
    }
    return {
        ...post,
        featured: !!post.featured,
        tags
    };
};

export const getUserByUsername = (username) => {
    return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
};

export const getPosts = () => {
    const rows = db.prepare('SELECT * FROM posts ORDER BY date DESC, createdAt DESC').all();
    return rows.map(mapPost);
};

export const getPostBySlug = (slug) => {
    return mapPost(db.prepare('SELECT * FROM posts WHERE slug = ?').get(slug));
};

export const getPostById = (id) => {
    return mapPost(db.prepare('SELECT * FROM posts WHERE id = ?').get(id));
};

export const createPost = (post) => {
    const now = new Date().toISOString();
    const id = post.id || Date.now().toString();
    const create = db.prepare(`
        INSERT INTO posts (id, title, slug, excerpt, content, author, date, category, image, featured, readTime, status, metaTitle, metaDescription, publishDate, tags, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    create.run(
        String(id),
        post.title,
        post.slug,
        post.excerpt || '',
        post.content,
        post.author || 'Admin',
        post.date || now.split('T')[0],
        post.category || 'Technology',
        post.image || '',
        post.featured ? 1 : 0,
        post.readTime || '5 min read',
        post.status || 'published',
        post.metaTitle || '',
        post.metaDescription || '',
        post.publishDate || now.split('T')[0],
        JSON.stringify(post.tags || []),
        now,
        now
    );
    return getPostById(id);
};

export const updatePost = (id, updates) => {
    const current = getPostById(id);
    if (!current) return null;

    const now = new Date().toISOString();
    Object.keys(updates).forEach(k => {
        if (updates[k] !== undefined && updates[k] !== 'undefined') {
            current[k] = updates[k];
        }
    });

    const update = db.prepare(`
        UPDATE posts SET 
            title=?, slug=?, excerpt=?, content=?, author=?, date=?, category=?, image=?, featured=?, readTime=?, status=?, metaTitle=?, metaDescription=?, publishDate=?, tags=?, updatedAt=?
        WHERE id=?
    `);

    update.run(
        current.title,
        current.slug,
        current.excerpt || '',
        current.content,
        current.author,
        current.date,
        current.category,
        current.image,
        current.featured ? 1 : 0,
        current.readTime,
        current.status,
        current.metaTitle || '',
        current.metaDescription || '',
        current.publishDate || now.split('T')[0],
        JSON.stringify(current.tags || []),
        now,
        id
    );

    return getPostById(id);
};

export const deletePost = (id) => {
    const result = db.prepare('DELETE FROM posts WHERE id = ?').run(id);
    return result.changes > 0;
};
