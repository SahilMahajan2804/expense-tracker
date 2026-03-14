export interface Category {
  categoryId: number;
  categoryName: string;
  description?: string;
  isActive: boolean;
}

export interface CategoryRequest {
  categoryName: string;
  description?: string;
  isActive?: boolean;
}
