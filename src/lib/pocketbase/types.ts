export interface Category { id: string; name_en: string; name_fr: string; slug: string; order: number; }
export interface Album {
  id: string; title_en: string; title_fr: string; slug: string; category: string;
  cover: string; description_en: string; description_fr: string; date: string;
  order: number; starred: boolean; published: boolean;
}
export interface Photo {
  id: string; album: string; image: string; alt_en: string; alt_fr: string;
  caption_en: string; caption_fr: string; order: number;
}
export interface Review {
  id: string; author: string; role: string; quote_en: string; quote_fr: string;
  avatar: string; order: number; published: boolean;
}
export interface Collab {
  id: string; name: string; logo: string; url: string;
  description_en: string; description_fr: string; order: number; published: boolean;
}
export interface SiteContent { id: string; key: string; value_en: string; value_fr: string; }
export interface ContactMessage { id: string; name: string; email: string; message: string; locale: "en" | "fr"; }
