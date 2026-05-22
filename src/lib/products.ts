import type { Product, PieCategory } from "@/types/product";

export const PIE_CATALOG: Product[] = [
  // Fruit pies
  {
    id: "cherry-lattice",
    name: "Signature Cherry Lattice",
    description: "Tart Montmorency cherries in a buttery lattice crust, baked fresh this morning.",
    price: 32.00,
    image: "/icon-pie.svg",
    category: "fruit",
    available: true,
    popularity: 95,
  },
  {
    id: "apple-crumble",
    name: "Apple Crumble",
    description: "Honeycrisp apples with cinnamon and a brown sugar oat crumble topping.",
    price: 28.00,
    image: "/icon-pie.svg",
    category: "fruit",
    available: true,
    popularity: 88,
  },
  {
    id: "blueberry-burst",
    name: "Blueberry Burst",
    description: "Wild Maine blueberries with a hint of lemon zest in a flaky double crust.",
    price: 30.00,
    image: "/icon-pie.svg",
    category: "fruit",
    available: true,
    popularity: 82,
  },
  {
    id: "peach-cobbler",
    name: "Georgia Peach",
    description: "Fresh Georgia peaches with vanilla bean and a buttery biscuit top.",
    price: 29.00,
    image: "/icon-pie.svg",
    category: "fruit",
    available: false,
    popularity: 75,
  },

  // Cream pies
  {
    id: "banana-cream",
    name: "Banana Cream Dream",
    description: "Silky vanilla custard layered with fresh bananas and topped with whipped cream.",
    price: 26.00,
    image: "/icon-pie.svg",
    category: "cream",
    available: true,
    popularity: 79,
  },
  {
    id: "coconut-cream",
    name: "Coconut Cream",
    description: "Rich coconut custard with toasted coconut flakes and vanilla bean whipped cream.",
    price: 27.00,
    image: "/icon-pie.svg",
    category: "cream",
    available: true,
    popularity: 71,
  },
  {
    id: "chocolate-silk",
    name: "Chocolate Silk",
    description: "Decadent dark chocolate mousse in a chocolate cookie crust.",
    price: 31.00,
    image: "/icon-pie.svg",
    category: "cream",
    available: true,
    popularity: 90,
  },
  {
    id: "key-lime",
    name: "Key Lime",
    description: "Tangy key lime filling with graham cracker crust and meringue topping.",
    price: 28.00,
    image: "/icon-pie.svg",
    category: "cream",
    available: true,
    popularity: 85,
  },

  // Savory pies
  {
    id: "chicken-pot",
    name: "Classic Chicken Pot Pie",
    description: "Tender chicken with vegetables in a creamy herb sauce under a golden crust.",
    price: 34.00,
    image: "/icon-pie.svg",
    category: "savory",
    available: true,
    popularity: 86,
  },
  {
    id: "beef-mushroom",
    name: "Beef & Mushroom",
    description: "Slow-braised beef with cremini mushrooms and red wine reduction.",
    price: 36.00,
    image: "/icon-pie.svg",
    category: "savory",
    available: true,
    popularity: 78,
  },
  {
    id: "vegetable-garden",
    name: "Garden Vegetable",
    description: "Roasted seasonal vegetables with goat cheese in a herb-infused crust.",
    price: 30.00,
    image: "/icon-pie.svg",
    category: "savory",
    available: false,
    popularity: 65,
  },

  // Seasonal pies
  {
    id: "pumpkin-spice",
    name: "Pumpkin Spice",
    description: "Classic pumpkin pie with warm spices and a graham cracker crust.",
    price: 26.00,
    image: "/icon-pie.svg",
    category: "seasonal",
    available: true,
    popularity: 92,
  },
  {
    id: "strawberry-rhubarb",
    name: "Strawberry Rhubarb",
    description: "Sweet strawberries and tart rhubarb balanced perfectly in a buttery crust.",
    price: 29.00,
    image: "/icon-pie.svg",
    category: "seasonal",
    available: true,
    popularity: 76,
  },
  {
    id: "pecan-bourbon",
    name: "Pecan Bourbon",
    description: "Caramelized pecans with a touch of Kentucky bourbon in a flaky crust.",
    price: 33.00,
    image: "/icon-pie.svg",
    category: "seasonal",
    available: true,
    popularity: 84,
  },
  {
    id: "maple-walnut",
    name: "Maple Walnut",
    description: "Vermont maple syrup custard with candied walnuts and a hint of cinnamon.",
    price: 31.00,
    image: "/icon-pie.svg",
    category: "seasonal",
    available: true,
    popularity: 68,
  },
];

// Legacy export for backward compatibility
export const TODAYS_PIE: Product = PIE_CATALOG.find(p => p.id === "cherry-lattice")!;

export const WEEKLY_SCHEDULE: { day: string; pie: string; highlight?: boolean }[] = [
  { day: "Mon", pie: "Classic Apple" },
  { day: "Tue", pie: "Signature Cherry Lattice", highlight: true },
  { day: "Wed", pie: "Apple Crumble" },
  { day: "Thu", pie: "Pecan Bourbon" },
  { day: "Fri", pie: "Pumpkin Spice" },
  { day: "Sat", pie: "Baker's Choice" },
  { day: "Sun", pie: "Baker's Choice" },
];

export const MIN_QUANTITY = 1;
export const MAX_QUANTITY = 10;

export const CATEGORY_LABELS: Record<PieCategory, string> = {
  fruit: "Fruit",
  cream: "Cream",
  savory: "Savory",
  seasonal: "Seasonal",
};

export const ITEMS_PER_PAGE = 6;
