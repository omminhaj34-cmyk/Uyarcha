import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import sharp from 'sharp';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import sanitizeHtml from 'sanitize-html';
import {
    getUserByUsername,
    getPosts,
    getPostBySlug,
    getPostById,
    createPost,
    updatePost,
    deletePost
} from './db.js';

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer upload logic with limits and filter
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB Limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPG, PNG, and WebP are allowed.'));
        }
    }
});

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

const generateSlug = (title, excludeId = null) => {
    let baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    let slug = baseSlug;
    let counter = 1;
    const allPosts = getPosts();
    while (allPosts.some(p => p.slug === slug && String(p.id) !== String(excludeId))) {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }
    return slug;
};

const sanitizeInput = (html) => {
    return sanitizeHtml(html, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']),
        allowedAttributes: {
            ...sanitizeHtml.defaults.allowedAttributes,
            img: ['src', 'alt', 'width', 'height']
        }
    });
};

const calcReadTime = (html) => {
    const text = sanitizeHtml(html || '', { allowedTags: [] });
    const words = text.trim().split(/\s+/).length || 1;
    return `${Math.ceil(words / 200)} min read`;
};

const generateExcerpt = (html) => {
    const text = sanitizeHtml(html || '', { allowedTags: [] }).trim();
    if (text.length <= 160) return text;
    return text.substring(0, 160) + '...';
};

app.get("/", (req, res) => res.json({ status: "OK", message: "CMS API Running on SQLite" }));

app.get('/api/posts', (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        let isAdmin = false;
        if (authHeader) {
            try {
                const token = authHeader.replace('Bearer ', '');
                jwt.verify(token, JWT_SECRET);
                isAdmin = true;
            } catch (err) { }
        }

        // Step 3: Fix posts API
        let posts = getPosts();
        if (!isAdmin) {
            // Public view: only published and not scheduled
            posts = posts.filter(p => String(p.status || "").toLowerCase() === 'published');
        }
        res.json(posts || []);
    } catch (e) {
        console.error("API Error [GET /api/posts]:", e);
        res.json([]); // Never return null
    }
});

app.get('/api/posts/:slug', (req, res) => {
    try {
        const post = getPostBySlug(req.params.slug);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const authHeader = req.headers.authorization;
        let isAdmin = false;
        if (authHeader) {
            try {
                const token = authHeader.replace('Bearer ', '');
                jwt.verify(token, JWT_SECRET);
                isAdmin = true;
            } catch (err) {
                isAdmin = false;
            }
        }

        if (!isAdmin && String(post.status || "").toLowerCase() !== 'published') {
            return res.status(404).json({ error: 'Post not found' });
        }

        res.json(post);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/api/login', (req, res) => {
    try {
        const { username, password } = req.body;
        const user = getUserByUsername(username);

        if (user && bcrypt.compareSync(password, user.password)) {
            const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
            res.json({ token });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/upload', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image uploaded' });
        }
        const titleRef = req.body.title ? req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : 'img';
        const filename = `${titleRef}-${Date.now()}.webp`;
        await sharp(req.file.buffer)
            .resize({ width: 1200, withoutEnlargement: true })
            .webp({ quality: 80 })
            .toFile(path.join(uploadDir, filename));
        res.json({ url: `/uploads/${filename}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Image processing failed' });
    }
});

app.post('/api/posts', authMiddleware, async (req, res) => {
    try {
        const payload = req.body || {};
        if (!payload.title || !payload.content || !payload.category) {
            return res.status(400).json({ error: 'Title, content, and category are required' });
        }

        // Step 10: Ensure fields match frontend Article type
        const postData = {
            id: payload.id || Date.now().toString(),
            title: payload.title,
            slug: payload.slug || generateSlug(payload.title),
            content: sanitizeInput(payload.content),
            excerpt: payload.excerpt || generateExcerpt(payload.content),
            category: payload.category,
            author: payload.author || 'Admin',
            date: payload.date || new Date().toISOString().split('T')[0],
            image: payload.image || '',
            readTime: calcReadTime(payload.content),
            status: payload.status || 'published'
        };

        const newPost = createPost(postData);
        res.status(201).json(newPost);
    } catch (error) {
        console.error("API Error [POST /api/posts]:", error);
        res.status(500).json({ error: 'Database error' });
    }
});

app.put('/api/posts/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const currentPost = getPostById(id);

        if (!currentPost) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const payload = req.body || {};
        
        // Prepare updates
        const updates = { ...payload };
        
        if (updates.content) {
            updates.content = sanitizeInput(updates.content);
            updates.readTime = calcReadTime(updates.content);
            if (!updates.excerpt) {
                updates.excerpt = generateExcerpt(updates.content);
            }
        }

        if (updates.title && updates.title !== currentPost.title) {
            updates.slug = generateSlug(updates.title, id);
        }

        const updatedPost = updatePost(id, updates);
        res.json(updatedPost);
    } catch (error) {
        console.error("API Error [PUT /api/posts/:id]:", error);
        res.status(500).json({ error: 'Database error' });
    }
});

app.delete('/api/posts/:id', authMiddleware, (req, res) => {
    try {
        const success = deletePost(req.params.id);
        if (!success) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.status(204).send();
    } catch (error) {
        console.error("API Error [DELETE /api/posts/:id]:", error);
        res.status(500).json({ error: 'Database error' });
    }
});

app.get('/sitemap.xml', (req, res) => {
    try {
        const posts = getPosts().filter(p => p.status !== 'draft');

        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        posts.forEach(post => {
            xml += `  <url>\n    <loc>/article/${post.slug}</loc>\n  </url>\n`;
        });

        xml += '</urlset>';

        res.header('Content-Type', 'application/xml');
        res.send(xml);
    } catch (e) {
        console.error(e);
        res.status(500).send('Error generating sitemap');
    }
});

// Central error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: err.message || 'Something broke!' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    console.log("Network ready");
});