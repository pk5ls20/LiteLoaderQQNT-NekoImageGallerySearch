export interface Image {
  id: string;
  url: string;
  thumbnail_url?: string;
  index_date: Date;
  ocr_text?: string;
  width?: number;
  height?: number;
  starred?: boolean;
  aspect_ratio?: number;
}
