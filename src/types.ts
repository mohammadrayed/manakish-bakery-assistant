export interface MenuItem {
  id: string;
  name: string;
  category: "Manakish" | "Beverages" | "Desserts";
  price: number;
  description: string;
  ingredients: string[];
  availableToppings: string[];
}

export interface OrderItem {
  itemId: string;
  name: string;
  quantity: number;
  price: number;
  toppings: string[];
}

export interface Order {
  id: string;
  customerName: string;
  items: OrderItem[];
  deliveryType: "pickup" | "delivery";
  deliveryArea?: string;
  deliveryAddress?: string;
  deliveryFee: number;
  subtotal: number;
  total: number;
  status: "Received" | "Baking" | "Ready for Pickup" | "Out for Delivery" | "Delivered" | "Cancelled";
  createdAt: string;
  estimatedTime: string;
}

export interface DeliveryZone {
  area: string;
  time: string;
  fee: number;
}

export interface ChatMessage {
  role: "user" | "model";
  parts: {
    text?: string;
    functionCall?: {
      name: string;
      args: any;
    };
    functionResponse?: {
      name: string;
      response: any;
    };
  }[];
}

export interface ToolLog {
  name: string;
  args: any;
  result: any;
}
