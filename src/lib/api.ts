import { Article } from "@/data/articles";

const BASE_URL = import.meta.env.VITE_API_URL || '';

export const getPosts = async (): Promise<Article[]> => {
    const token = localStorage.getItem('admin_token');
    const headers: any = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const res = await fetch(`${BASE_URL}/api/posts`, { headers });
    if (!res.ok) throw new Error('Failed to fetch posts');
    return res.json();
};

export const getPost = async (slug: string): Promise<Article> => {
    const res = await fetch(`${BASE_URL}/api/posts/${slug}`);
    if (!res.ok) throw new Error('Failed to fetch post');
    return res.json();
};

export const createPost = async (postData: Partial<Article>): Promise<Article> => {
    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${BASE_URL}/api/posts`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to create post');
    }
    return res.json();
};

export const updatePost = async (id: string, postData: Partial<Article>): Promise<Article> => {
    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${BASE_URL}/api/posts/${id}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to update post');
    }
    return res.json();
};

export const deletePost = async (id: string): Promise<void> => {
    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${BASE_URL}/api/posts/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!res.ok) throw new Error('Failed to delete post');
};

export const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${BASE_URL}/api/upload`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}` // multer will parse multipart/form-data
        },
        body: formData
    });
    if (!res.ok) throw new Error('Failed to upload image');
    const data = await res.json();
    return data.url;
};

export const loginAdmin = async (password: string): Promise<string> => {
    const res = await fetch(`${BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password })
    });
    if (!res.ok) throw new Error('Invalid credentials');
    const data = await res.json();
    return data.token;
};

// Helper for fixing relative image URLs
export const getImageUrl = (url: string | undefined): string => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};
