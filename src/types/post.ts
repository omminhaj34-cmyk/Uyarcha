export interface Article{

id:string

title:string

slug:string

content:string

excerpt:string

category:string

publish_date:string|Date

image:string

views:number

status:'draft'|'published'|'scheduled'

featured:boolean

seo_description?:string

created_at:string|Date

/* UI ONLY */

author?:string

readTime?:string

date?:string

seo_title?:string

seo_keywords?:string

tags?:string[]

deleted?:boolean

}