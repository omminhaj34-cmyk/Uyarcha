import { supabase } from "./supabase";
import type { Article } from "@/types/post";
import { categories, allTags } from "./constants";
import { timeout } from "./config";

export { categories, allTags };

/* ======================
DATABASE HEALTH
====================== */

export async function checkDatabaseHealth() {
  if (!supabase) return false;
  try {
    const result = await Promise.race([
      supabase.from("posts").select("id").limit(1),
      timeout(5000)
    ]);
    return !(result as any).error;
  } catch {
    return false;
  }
}

/* ======================
SAFE QUERY
====================== */

export async function safeQuery<T>(query:any){

try{

const {data,error}=await query;

if(error){

console.error("DB ERROR:",error);

return{
success:false,
error:error.message,
data:null
};

}

return{
success:true,
data:data as T
};

}catch(err){

console.error(err);

return{
success:false,
error:"Network failure",
data:null
};

}

}

/* ======================
SLUG
====================== */

export const slugify=(text:string)=>{

return text
.toLowerCase()
.trim()
.replace(/\s+/g,"-")
.replace(/[^\w-]/g,"")
.replace(/--+/g,"-");

};

/* ======================
READ TIME
====================== */

export const calculateReadTime=(content:string)=>{

const words=(content||"")
.split(/\s/g).length;

return `${Math.ceil(words/200)} min read`;

};

/* ======================
GET POSTS
====================== */

export async function getPublishedPosts(){
  const now = new Date().toISOString();
  const query = supabase
    .from("posts")
    .select("id, title, slug, image, category, publish_date, views, excerpt")
    .eq("status", "published")
    .lte("publish_date", now)
    .order("publish_date", { ascending: false });

  const { success, data } = await safeQuery<Article[]>(query);
  return success ? (data || []) : [];
}

/* ======================
TRENDING & FEATURED
====================== */

export async function getTrendingPosts(limit: number = 5) {
  const now = new Date().toISOString();
  const query = supabase
    .from("posts")
    .select("id, title, slug, image, category, publish_date, views, excerpt")
    .eq("status", "published")
    .lte("publish_date", now)
    .order("views", { ascending: false })
    .limit(limit);

  const { success, data } = await safeQuery<Article[]>(query);
  return success ? (data || []) : [];
}

export async function getFeaturedPosts() {
  const now = new Date().toISOString();
  const query = supabase
    .from("posts")
    .select("id, title, slug, image, category, publish_date, views, excerpt")
    .eq("status", "published")
    .eq("featured", true)
    .lte("publish_date", now)
    .order("publish_date", { ascending: false })
    .limit(2);

  const { success, data } = await safeQuery<Article[]>(query);
  if (success && data && data.length > 0) return data;
  return getPublishedPosts();
}

/* ======================
SINGLE POSTS
====================== */

export async function getPostBySlug(slug: string) {
  const now = new Date().toISOString();
  const query = supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .lte("publish_date", now)
    .maybeSingle();

  const { success, data } = await safeQuery<Article>(query);
  return success ? data : null;
}

export async function incrementViews(postId: string) {
  if (!postId) return;
  try {
     const { error } = await supabase.rpc('increment_views', { post_id: postId });
     if (error) console.error("Error incrementing views:", error);
  } catch (err) {
     console.error("View increment failure:", err);
  }
}

export async function getRelatedPosts(category: string, currentId: string, limit: number = 3) {
  const now = new Date().toISOString();
  const query = supabase
    .from("posts")
    .select("id, title, slug, image, category, publish_date, views, excerpt")
    .eq("status", "published")
    .eq("category", category)
    .lte("publish_date", now)
    .neq("id", currentId)
    .limit(limit);

  const { success, data } = await safeQuery<Article[]>(query);
  if (success && data && data.length > 0) return data;
  return getPublishedPosts(); 
}

/* ======================
ADMIN FUNCTIONS
====================== */

export async function getAllPosts() {
  const query = supabase
    .from("posts")
    .select("id, title, slug, image, category, status, views, publish_date, created_at")
    .order("created_at", { ascending: false });

  const { success, data } = await safeQuery<Article[]>(query);
  return success ? (data || []) : [];
}

/* ======================
CREATE POST
====================== */

export async function createPost(
postData:Partial<Article>
){

if(!postData.title ||
!postData.content){

return{
success:false,
error:"Title/content required"
};

}

try{

let baseSlug=
postData.slug ||
slugify(postData.title);

let finalSlug=baseSlug;

let counter=1;

while(true){

const {data}=
await supabase
.from("posts")
.select("id")
.eq("slug",finalSlug)
.maybeSingle();

if(!data) break;

finalSlug=
`${baseSlug}-${counter++}`;

}

const insertData={

title:postData.title,

slug:finalSlug,

content:postData.content,

excerpt:
postData.excerpt || "",

image:
postData.image || "",

category:
postData.category || "General",

views:0,

status:
postData.status || "published",

featured:
postData.featured || false,

seo_description:
postData.seo_description || "",

publish_date:
new Date(),

created_at:
new Date()

};

const {data,error}=
await supabase
.from("posts")
.insert([insertData])
.select()
.single();

if(error){

return{
success:false,
error:error.message
};

}

return{
success:true,
data
};

}catch{

return{
success:false,
error:"Unexpected error"
};

}

}

/* ======================
DELETE POST
====================== */

export async function deletePost(id: string) {
  try {
    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", id);
      
    if (error) {
      console.error("Supabase delete failed:", error);
      throw error;
    }
  } catch (err: any) {
    console.error("Delete error:", err);
    throw new Error(err.message || "Failed to delete post.");
  }
}

/* ======================
IMAGE UPLOAD (FIXED)
====================== */

export async function uploadImage(
file:File
):Promise<string|null>{

try{

const fileName=
`${Date.now()}-${file.name.replace(/\s/g,"-")}`;

/* FIX:
Bucket must match EXACT name:
Image
*/

const {error}=
await supabase.storage
.from("Image")
.upload(fileName,file);

if(error){

console.error("Upload error:",error);

return null;

}

const {data}=
supabase.storage
.from("Image")
.getPublicUrl(fileName);

return data.publicUrl;

}catch(err){

console.error(err);

return null;

}

}