import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import sharp from 'sharp';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'posts.json');

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
const upload = multer({ storage: multer.memoryStorage() });

const ADMIN_SECRET = 'wt-20260308';
const ADMIN_USERNAME = 'admin';
const JWT_SECRET = 'my_super_secret_jwt_key_2026';

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
    }
    const token = authHeader.replace('Bearer ', '');
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Invalid token' });
    }
};

// Load posts from file
const getPosts = () => {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            return [];
        }
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading posts.json', err);
        return [];
    }
};

// Save posts to file
const savePosts = (posts) => {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2), 'utf8');
    } catch (err) {
        console.error('Error writing posts.json', err);
    }
};

// GET /api/posts
app.get('/api/posts', (req, res) => {
    const posts = getPosts();
    res.json(posts);
});

// POST /api/login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USERNAME && password === ADMIN_SECRET) {
        const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// GET /sitemap.xml
app.get('/sitemap.xml', (req, res) => {
    const posts = getPosts().filter(p => p.status !== 'draft');

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    posts.forEach(post => {
        // Here you would optimally use your live domain name. Example uses relative /post/ path as requested.
        xml += `  <url>\n    <loc>/post/${post.slug}</loc>\n  </url>\n`;
    });

    xml += '</urlset>';

    res.header('Content-Type', 'application/xml');
    res.send(xml);
});

// POST /api/posts
app.post('/api/posts', authMiddleware, upload.single('image'), async (req, res) => {
    const posts = getPosts();
    const newPost = req.body;
    if (req.file) {
        let baseName = newPost.slug || (newPost.title ? newPost.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'post-image');
        baseName = baseName.replace(/(^-|-$)+/g, '');
        const filename = `${baseName}-${Date.now()}.webp`;

        await sharp(req.file.buffer)
            .resize({ width: 1200, withoutEnlargement: true })
            .webp({ quality: 80 })
            .toFile(path.join(uploadDir, filename));

        newPost.image = `/uploads/${filename}`;
    }
    posts.unshift(newPost);
    savePosts(posts);
    res.status(201).json(newPost);
});

// PUT /api/posts/:id
app.put('/api/posts/:id', authMiddleware, upload.single('image'), async (req, res) => {
    const posts = getPosts();
    const index = posts.findIndex(p => p.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Post not found' });
    }

    const updateData = req.body;
    if (req.file) {
        const postToUpdate = { ...posts[index], ...updateData };
        let baseName = postToUpdate.slug || (postToUpdate.title ? postToUpdate.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'post-image');
        baseName = baseName.replace(/(^-|-$)+/g, '');
        const filename = `${baseName}-${Date.now()}.webp`;

        await sharp(req.file.buffer)
            .resize({ width: 1200, withoutEnlargement: true })
            .webp({ quality: 80 })
            .toFile(path.join(uploadDir, filename));

        updateData.image = `/uploads/${filename}`;
    }

    posts[index] = { ...posts[index], ...updateData };
    savePosts(posts);
    res.json(posts[index]);
});

// DELETE /api/posts/:id
app.delete('/api/posts/:id', authMiddleware, (req, res) => {
    let posts = getPosts();
    const initialLength = posts.length;
    posts = posts.filter(p => p.id !== req.params.id);
    if (posts.length === initialLength) {
        return res.status(404).json({ error: 'Post not found' });
    }
    savePosts(posts);
    res.status(204).send();
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
