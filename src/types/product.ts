export type PieCategory = "fruit" | "cream" | "savory" | "seasonal";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: PieCategory;
  available: boolean;
  popularity: number; // 1-100, used for sorting
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
}
