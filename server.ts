import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize GoogleGenAI SDK server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Domain Data for Manakish Bakery
interface MenuItem {
  id: string;
  name: string;
  category: "Manakish" | "Beverages" | "Desserts";
  price: number;
  description: string;
  ingredients: string[];
  availableToppings: string[];
}

const menu: MenuItem[] = [
  {
    id: "m1",
    name: "Zaatar Manousheh",
    category: "Manakish",
    price: 3.00,
    description: "Classic Lebanese wild thyme mixed with toasted sesame seeds and cold-pressed olive oil, baked to crispy golden perfection.",
    ingredients: ["Wheat flour", "Wild thyme (zaatar)", "Toasted sesame", "Olive oil", "Yeast", "Sea salt"],
    availableToppings: ["Extra Olives", "Fresh Mint", "Tomatoes & Cucumbers", "Labneh Swirl"]
  },
  {
    id: "m2",
    name: "Cheese Manousheh",
    category: "Manakish",
    price: 4.50,
    description: "A rich, gooey blend of melted traditional Akkawi and premium Mozzarella cheese on our signature warm flatbread.",
    ingredients: ["Wheat flour", "Akkawi cheese", "Mozzarella cheese", "Yeast", "Olive oil"],
    availableToppings: ["Sesame Seeds", "Spicy Harissa", "Tomatoes & Cucumbers"]
  },
  {
    id: "m3",
    name: "Lahm Bi Ajeen",
    category: "Manakish",
    price: 5.50,
    description: "Savory minced beef mixed with finely chopped onions, ripe tomatoes, and traditional Lebanese seven spices.",
    ingredients: ["Wheat flour", "Minced beef", "Onions", "Tomatoes", "Lebanese seven spices", "Lemon juice"],
    availableToppings: ["Pomegranate Molasses", "Pine Nuts"]
  },
  {
    id: "m4",
    name: "Kishk Manousheh",
    category: "Manakish",
    price: 4.00,
    description: "Traditional fermented dried yogurt and cracked wheat spread, baked with diced onions and fresh olive oil.",
    ingredients: ["Wheat flour", "Kishk powder", "Onions", "Tomatoes", "Olive oil"],
    availableToppings: ["Fresh Mint", "Tomatoes & Cucumbers"]
  },
  {
    id: "m5",
    name: "Spinach & Feta Manousheh",
    category: "Manakish",
    price: 4.50,
    description: "Tangy baby spinach chopped with sweet onions, sumac, and crumbled Greek feta cheese.",
    ingredients: ["Wheat flour", "Fresh spinach", "Onions", "Feta cheese", "Sumac", "Lemon juice", "Olive oil"],
    availableToppings: ["Pomegranate Molasses", "Walnuts"]
  },
  {
    id: "t1",
    name: "Ayran Yogurt Drink",
    category: "Beverages",
    price: 2.00,
    description: "Chilled, frothy, and refreshing traditional salted yogurt drink.",
    ingredients: ["Yogurt", "Water", "Salt"],
    availableToppings: []
  },
  {
    id: "t2",
    name: "Lebanese Black Tea",
    category: "Beverages",
    price: 1.50,
    description: "Aromatic black tea brewed with fresh spearmint leaves or sage.",
    ingredients: ["Water", "Black tea leaves", "Spearmint", "Sugar (optional)"],
    availableToppings: []
  },
  {
    id: "t3",
    name: "Turkish Coffee",
    category: "Beverages",
    price: 2.50,
    description: "Strong, finely ground coffee brewed in a traditional pot and infused with fragrant cardamom.",
    ingredients: ["Water", "Finely ground coffee", "Cardamom"],
    availableToppings: []
  },
  {
    id: "d1",
    name: "Nutella & Banana Manousheh",
    category: "Desserts",
    price: 5.00,
    description: "Warm, sweet flatbread smothered with creamy Nutella and fresh sliced bananas.",
    ingredients: ["Wheat flour", "Nutella chocolate hazelnut spread", "Bananas"],
    availableToppings: []
  },
  {
    id: "d2",
    name: "Baklava Piece",
    category: "Desserts",
    price: 1.75,
    description: "Sweet, crispy filo pastry layered with pistachios and walnuts, drizzled with orange blossom syrup.",
    ingredients: ["Filo pastry", "Pistachios", "Walnuts", "Butter", "Orange blossom syrup"],
    availableToppings: []
  }
];

const toppingsPrices: Record<string, number> = {
  "Extra Olives": 0.50,
  "Fresh Mint": 0.50,
  "Tomatoes & Cucumbers": 0.75,
  "Labneh Swirl": 1.00,
  "Sesame Seeds": 0.30,
  "Spicy Harissa": 0.50,
  "Pomegranate Molasses": 0.75,
  "Pine Nuts": 1.25,
  "Walnuts": 1.00
};

interface DeliveryZone {
  area: string;
  time: string;
  fee: number;
}

const deliveryZones: DeliveryZone[] = [
  // Official Administrative Quarters
  { area: "Achrafieh", time: "20-30 mins", fee: 2.50 },
  { area: "Ras Beirut", time: "25-35 mins", fee: 3.00 },
  { area: "Mazraa", time: "25-35 mins", fee: 2.50 },
  { area: "Mousaitbeh", time: "25-35 mins", fee: 2.50 },
  { area: "Marfaa", time: "15-25 mins", fee: 2.00 },
  { area: "Beirut Central District", time: "15-25 mins", fee: 2.00 },
  { area: "Downtown", time: "15-25 mins", fee: 2.00 },
  { area: "Saifi", time: "15-25 mins", fee: 2.00 },
  { area: "Rmeil", time: "20-30 mins", fee: 2.50 },
  { area: "Medawar", time: "20-30 mins", fee: 2.50 },
  { area: "Zuqaq al-Blat", time: "20-30 mins", fee: 2.00 },
  { area: "Bachoura", time: "20-30 mins", fee: 2.00 },
  { area: "Dar El-Mreisseh", time: "20-30 mins", fee: 2.50 },
  { area: "Minet El-Hosn", time: "15-25 mins", fee: 2.00 },

  // Prominent Neighborhoods & Commercial Areas
  { area: "Hamra", time: "20-30 mins", fee: 2.50 },
  { area: "Mar Mikhael", time: "20-30 mins", fee: 2.50 },
  { area: "Gemmayzeh", time: "15-25 mins", fee: 2.00 },
  { area: "Badaro", time: "25-35 mins", fee: 3.00 },
  { area: "Verdun", time: "25-35 mins", fee: 3.00 },
  { area: "Raouché", time: "30-40 mins", fee: 3.50 },
  { area: "Karantina", time: "25-35 mins", fee: 3.50 },
  { area: "Basta", time: "20-30 mins", fee: 2.00 },
  { area: "Sodeco", time: "20-30 mins", fee: 2.50 },
  { area: "Sioufi", time: "25-35 mins", fee: 3.00 },
  { area: "Geitawi", time: "25-35 mins", fee: 3.00 },

  // Immediate Suburbs (Greater Beirut Area)
  { area: "Bourj Hammoud", time: "30-40 mins", fee: 4.00 },
  { area: "Sin El Fil", time: "30-45 mins", fee: 4.00 },
  { area: "Chyah", time: "35-50 mins", fee: 4.50 },
  { area: "Haret Hreik", time: "35-50 mins", fee: 4.50 },
  { area: "Hazmieh", time: "35-50 mins", fee: 5.00 }
];

interface OrderItem {
  itemId: string;
  name: string;
  quantity: number;
  price: number;
  toppings: string[];
}

interface Order {
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

// Global Order State with Persistent JSON Database File (Durable Data Layer)
const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const DB_FILE = path.join(DATA_DIR, "orders-db.json");

const defaultOrders: Order[] = [
  {
    id: "BAKE-1001",
    customerName: "Asmaa Hajj Chehade",
    items: [
      {
        itemId: "m1",
        name: "Zaatar Manousheh",
        quantity: 2,
        price: 3.00,
        toppings: ["Extra Olives", "Fresh Mint"]
      },
      {
        itemId: "m2",
        name: "Cheese Manousheh",
        quantity: 1,
        price: 4.50,
        toppings: ["Spicy Harissa"]
      }
    ],
    deliveryType: "delivery",
    deliveryArea: "Downtown",
    deliveryAddress: "123 Elm Street, Apt 4B",
    deliveryFee: 2.00,
    subtotal: 13.00,
    total: 15.00,
    status: "Delivered",
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(), // 3 hours ago
    estimatedTime: "Delivered"
  },
  {
    id: "BAKE-1002",
    customerName: "Mohammad",
    items: [
      {
        itemId: "m3",
        name: "Lahm Bi Ajeen",
        quantity: 1,
        price: 5.50,
        toppings: ["Pomegranate Molasses"]
      },
      {
        itemId: "t1",
        name: "Ayran Yogurt Drink",
        quantity: 1,
        price: 2.00,
        toppings: []
      }
    ],
    deliveryType: "pickup",
    deliveryFee: 0,
    subtotal: 8.25,
    total: 8.25,
    status: "Baking",
    createdAt: new Date(Date.now() - 600000).toISOString(), // 10 mins ago
    estimatedTime: "15-20 mins"
  }
];

let lastOrderId = 1002;
let orders: Order[] = loadOrders();

function loadOrders(): Order[] {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(data) as Order[];
      
      let maxId = 1002;
      parsed.forEach((order) => {
        const numPart = parseInt(order.id.replace("BAKE-", ""));
        if (!isNaN(numPart) && numPart > maxId) {
          maxId = numPart;
        }
      });
      lastOrderId = maxId;
      return parsed;
    }
  } catch (err) {
    console.error("Error reading orders-db.json, using default seed orders:", err);
  }

  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultOrders, null, 2), "utf-8");
  } catch (err) {
    console.error("Error creating initial orders-db.json:", err);
  }
  return defaultOrders;
}

function saveOrders() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(orders, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving orders-db.json:", err);
  }
}

// Helper price calculation function
function runCalculateOrderPrice(items: any[], deliveryArea?: string) {
  let subtotal = 0;
  const breakdownItems: any[] = [];

  for (const item of items) {
    const menuItem = menu.find(
      (m) =>
        m.id === item.itemId ||
        m.name.toLowerCase() === item.itemId.toLowerCase() ||
        m.name.toLowerCase().includes(item.itemId.toLowerCase())
    );

    if (!menuItem) {
      throw new Error(`Menu item '${item.itemId}' not found.`);
    }

    let itemPrice = menuItem.price;
    let toppingsCost = 0;
    const toppingsList = item.toppings || [];

    for (const topping of toppingsList) {
      const price = toppingsPrices[topping];
      if (price !== undefined) {
        toppingsCost += price;
      } else {
        throw new Error(`Topping '${topping}' is not available for ${menuItem.name}.`);
      }
    }

    const unitPrice = itemPrice + toppingsCost;
    const itemTotal = unitPrice * item.quantity;
    subtotal += itemTotal;

    breakdownItems.push({
      id: menuItem.id,
      name: menuItem.name,
      quantity: item.quantity,
      basePrice: itemPrice,
      toppings: toppingsList,
      toppingsCost,
      unitPrice,
      totalPrice: itemTotal
    });
  }

  let deliveryFee = 0;
  let estTime = "15-20 mins";

  if (deliveryArea) {
    const zone = deliveryZones.find(
      (z) => z.area.toLowerCase() === deliveryArea.toLowerCase()
    );
    if (!zone) {
      throw new Error(
        `Delivery area '${deliveryArea}' is outside our delivery zone. We only deliver to: ${deliveryZones
          .map((z) => z.area)
          .join(", ")}. Please use 'pickup' instead.`
      );
    }
    deliveryFee = zone.fee;
    estTime = zone.time;
  }

  const total = subtotal + deliveryFee;

  return {
    success: true,
    items: breakdownItems,
    subtotal: parseFloat(subtotal.toFixed(2)),
    deliveryFee: parseFloat(deliveryFee.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
    estimatedTime: estTime
  };
}

// Create order
function runCreateOrder(
  customerName: string,
  items: any[],
  deliveryType: string,
  deliveryArea?: string,
  deliveryAddress?: string
) {
  if (!customerName) {
    throw new Error("Customer name is required to place an order.");
  }
  if (!items || items.length === 0) {
    throw new Error("Order must contain at least one item.");
  }

  const isDelivery = deliveryType.toLowerCase() === "delivery";
  if (isDelivery) {
    if (!deliveryArea) {
      throw new Error("Delivery area is required for delivery orders.");
    }
    if (!deliveryAddress) {
      throw new Error("Delivery address is required for delivery orders.");
    }
  }

  const pricing = runCalculateOrderPrice(items, isDelivery ? deliveryArea : undefined);

  const orderItems = pricing.items.map((item) => ({
    itemId: item.id,
    name: item.name,
    quantity: item.quantity,
    price: item.basePrice,
    toppings: item.toppings,
  }));

  const orderId = `BAKE-${++lastOrderId}`;
  const newOrder: Order = {
    id: orderId,
    customerName,
    items: orderItems,
    deliveryType: isDelivery ? "delivery" : "pickup",
    deliveryArea: isDelivery ? deliveryArea : undefined,
    deliveryAddress: isDelivery ? deliveryAddress : undefined,
    deliveryFee: pricing.deliveryFee,
    subtotal: pricing.subtotal,
    total: pricing.total,
    status: "Received",
    createdAt: new Date().toISOString(),
    estimatedTime: pricing.estimatedTime,
  };

  orders.push(newOrder);
  return {
    success: true,
    message: `Order ${orderId} created successfully!`,
    order: newOrder,
  };
}

// Cancel order
function runCancelOrder(orderId: string) {
  const order = orders.find((o) => o.id.toLowerCase() === orderId.toLowerCase());
  if (!order) {
    throw new Error(`Order '${orderId}' not found.`);
  }

  if (order.status === "Delivered") {
    throw new Error(`Order '${orderId}' has already been delivered and cannot be cancelled.`);
  }
  if (order.status === "Cancelled") {
    return { success: true, message: `Order '${orderId}' is already cancelled.`, order };
  }

  order.status = "Cancelled";
  order.estimatedTime = "N/A";

  return {
    success: true,
    message: `Order '${orderId}' has been successfully cancelled.`,
    order,
  };
}

// Update order
function runUpdateOrder(
  orderId: string,
  items: any[],
  deliveryType?: string,
  deliveryArea?: string,
  deliveryAddress?: string
) {
  const order = orders.find((o) => o.id.toLowerCase() === orderId.toLowerCase());
  if (!order) {
    throw new Error(`Order '${orderId}' not found.`);
  }

  if (order.status === "Delivered") {
    throw new Error(`Order '${orderId}' has already been delivered and cannot be updated.`);
  }
  if (order.status === "Cancelled") {
    throw new Error(`Order '${orderId}' has been cancelled and cannot be updated.`);
  }

  const updatedDeliveryType = deliveryType || order.deliveryType;
  const isDelivery = updatedDeliveryType.toLowerCase() === "delivery";
  const updatedDeliveryArea = isDelivery ? (deliveryArea || order.deliveryArea) : undefined;
  const updatedDeliveryAddress = isDelivery ? (deliveryAddress || order.deliveryAddress) : undefined;

  const pricing = runCalculateOrderPrice(items, isDelivery ? updatedDeliveryArea : undefined);

  order.items = pricing.items.map((item) => ({
    itemId: item.id,
    name: item.name,
    quantity: item.quantity,
    price: item.basePrice,
    toppings: item.toppings,
  }));
  order.deliveryType = isDelivery ? "delivery" : "pickup";
  order.deliveryArea = updatedDeliveryArea;
  order.deliveryAddress = updatedDeliveryAddress;
  order.deliveryFee = pricing.deliveryFee;
  order.subtotal = pricing.subtotal;
  order.total = pricing.total;
  order.estimatedTime = pricing.estimatedTime;

  return {
    success: true,
    message: `Order '${orderId}' has been updated successfully.`,
    order,
  };
}

// Get status
function runGetOrderStatus(orderId: string) {
  const order = orders.find((o) => o.id.toLowerCase() === orderId.toLowerCase());
  if (!order) {
    throw new Error(`Order '${orderId}' not found.`);
  }
  return {
    success: true,
    order,
  };
}

// Generate checkout receipt / kitchen handoff report (Reporting Tool)
function runGenerateReceiptReport(orderId: string) {
  const order = orders.find((o) => o.id.toLowerCase() === orderId.toLowerCase());
  if (!order) {
    throw new Error(`Order '${orderId}' not found.`);
  }

  const itemsTable = order.items
    .map(
      (item) =>
        `| ${item.quantity}x | ${item.name} ${
          item.toppings.length > 0 ? `(with ${item.toppings.join(", ")})` : ""
        } | $${(item.price * item.quantity).toFixed(2)} |`
    )
    .join("\n");

  const report = `
========================================
       MANAKISH BAKERY RECEIPT
========================================
Order ID:     ${order.id}
Date/Time:    ${new Date(order.createdAt).toLocaleString()}
Customer:     ${order.customerName}
Service:      ${order.deliveryType.toUpperCase()}
Status:       ${order.status}
----------------------------------------
ITEMIZED ORDER BREAKDOWN:
| Qty | Item Details | Total Price |
|---|---|---|
${itemsTable}
----------------------------------------
FINANCIAL SUMMARY:
Subtotal:     $${order.subtotal.toFixed(2)}
Delivery Fee: $${order.deliveryFee.toFixed(2)}
GRAND TOTAL:  $${order.total.toFixed(2)}
----------------------------------------
Logistics details:
Estimated Delivery/Pickup Time: ${order.estimatedTime}
${order.deliveryAddress ? `Delivery Address: ${order.deliveryAddress} (${order.deliveryArea})` : "Pickup Location: Counter 1"}

Note from Baker Asmaa: 
- "We hope you enjoy your fresh, wood-fired flatbreads! To reheat, place them in a hot skillet for 1-2 minutes until the cheese/crust crisps up perfectly!"
========================================
`;

  return {
    success: true,
    report: report.trim(),
    order,
  };
}

// Gemini Tools Definitions
const tools = [
  {
    functionDeclarations: [
      {
        name: "getMenu",
        description: "Get the complete bakery menu containing flatbread options, ingredients, toppings, and prices.",
        parameters: {
          type: "OBJECT",
          properties: {},
          required: [],
        },
      },
      {
        name: "getDeliveryAreasAndHours",
        description: "Get delivery areas, delivery fees, estimated delivery times, and opening hours.",
        parameters: {
          type: "OBJECT",
          properties: {},
          required: [],
        },
      },
      {
        name: "calculateOrderPrice",
        description: "Calculate the total subtotal, toppings price, delivery fee, and grand total for a proposed list of items.",
        parameters: {
          type: "OBJECT",
          properties: {
            items: {
              type: "ARRAY",
              description: "The list of items with quantity and toppings.",
              items: {
                type: "OBJECT",
                properties: {
                  itemId: { type: "STRING", description: "The ID or name of the menu item (e.g. 'm1', 'Zaatar Manousheh')." },
                  quantity: { type: "INTEGER", description: "How many of this item to order." },
                  toppings: {
                    type: "ARRAY",
                    description: "List of extra toppings to add.",
                    items: { type: "STRING" },
                  },
                },
                required: ["itemId", "quantity"],
              },
            },
            deliveryArea: {
              type: "STRING",
              description: "The delivery neighborhood/zone. Keep empty for pickup.",
            },
          },
          required: ["items"],
        },
      },
      {
        name: "createOrder",
        description: "Place a new order in the system. Returns the created order with ID and totals.",
        parameters: {
          type: "OBJECT",
          properties: {
            customerName: { type: "STRING", description: "Full name of the customer." },
            items: {
              type: "ARRAY",
              description: "Items, quantities, and toppings.",
              items: {
                type: "OBJECT",
                properties: {
                  itemId: { type: "STRING", description: "The ID or name of the menu item." },
                  quantity: { type: "INTEGER", description: "Quantity." },
                  toppings: {
                    type: "ARRAY",
                    description: "Toppings list.",
                    items: { type: "STRING" },
                  },
                },
                required: ["itemId", "quantity"],
              },
            },
            deliveryType: { type: "STRING", description: "Either 'pickup' or 'delivery'." },
            deliveryArea: { type: "STRING", description: "Required if deliveryType is 'delivery'." },
            deliveryAddress: { type: "STRING", description: "Required if deliveryType is 'delivery'." },
          },
          required: ["customerName", "items", "deliveryType"],
        },
      },
      {
        name: "cancelOrder",
        description: "Cancel an active order in the system using its Order ID (e.g. 'BAKE-1003').",
        parameters: {
          type: "OBJECT",
          properties: {
            orderId: { type: "STRING", description: "Order ID to cancel." },
          },
          required: ["orderId"],
        },
      },
      {
        name: "updateOrder",
        description: "Update items, delivery options, or delivery address on an existing order.",
        parameters: {
          type: "OBJECT",
          properties: {
            orderId: { type: "STRING", description: "ID of the order to update." },
            items: {
              type: "ARRAY",
              description: "Full updated list of items.",
              items: {
                type: "OBJECT",
                properties: {
                  itemId: { type: "STRING" },
                  quantity: { type: "INTEGER" },
                  toppings: { type: "ARRAY", items: { type: "STRING" } },
                },
                required: ["itemId", "quantity"],
              },
            },
            deliveryType: { type: "STRING" },
            deliveryArea: { type: "STRING" },
            deliveryAddress: { type: "STRING" },
          },
          required: ["orderId", "items"],
        },
      },
      {
        name: "getOrderStatus",
        description: "Fetch current preparation or delivery status for a specific order ID.",
        parameters: {
          type: "OBJECT",
          properties: {
            orderId: { type: "STRING", description: "The unique Order ID." },
          },
          required: ["orderId"],
        },
      },
      {
        name: "generateReceiptReport",
        description: "Produces a formal structured receipt report, kitchen ticket, and handoff advice for a specific Order ID. Use this to summarize a finished order.",
        parameters: {
          type: "OBJECT",
          properties: {
            orderId: { type: "STRING", description: "The unique Order ID." },
          },
          required: ["orderId"],
        },
      },
    ],
  },
];

// Agent execution loop
async function handleGeminiAgent(messages: any[]) {
  let currentMessages = [...messages];
  let attempts = 0;
  const maxAttempts = 5;
  const toolLogs: any[] = [];

  while (attempts < maxAttempts) {
    attempts++;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: currentMessages,
      config: {
        systemInstruction: `You are the warm, polite, and extremely efficient AI Assistant for "Manakish Bakery" (run by Asmaa Hajj Chehade and Mohammad Rayed).
Your goal is to offer pristine customer support and seamlessly handle orders.

Here is the context of your tools:
1. "getMenu": Fetches all items, categories, descriptions, prices, toppings, and ingredients.
2. "getDeliveryAreasAndHours": Fetches delivery fees, times, and open hours.
3. "calculateOrderPrice": Calculates subtotals, extra toppings cost, delivery fees, and grand total.
4. "createOrder": Officially registers an order in the bakery database. Always get customer confirmation first with the exact total price!
5. "cancelOrder": Cancels an active order using its Order ID.
6. "updateOrder": Updates an order with a brand new list of items and options.
7. "getOrderStatus": Retrieves the live status of an order.
8. "generateReceiptReport": Produces a formal structured receipt report, kitchen ticket, and handoff advice for a specific Order ID. Use this tool immediately after successfully creating an order or whenever the customer wants a formal invoice or receipt summary!

Strict Guidelines:
- You MUST call "getMenu" or "getDeliveryAreasAndHours" when asked about the menu or delivery zones. Do not invent items or prices!
- If the customer wants to order, guide them through. Collect their name, items, toppings, delivery/pickup preference, and if delivery, their area & address.
- ALWAYS calculate the price breakdown using "calculateOrderPrice" and state it clearly before asking "Would you like me to place this order for you?"
- Once they say yes, call "createOrder" and provide the Order ID (e.g. BAKE-1003) and details. Then, immediately call "generateReceiptReport" to display a formal structured receipt summary!
- Be encouraging and warm! Recommend pairings (e.g., "A refreshing glass of Ayran pairs perfectly with our Zaatar Manousheh!").
- Keep answers compact, structured, and easy to read. Use bullet points or markdown tables.`,
        tools: tools as any,
      },
    });

    const functionCalls = response.functionCalls;
    if (!functionCalls || functionCalls.length === 0) {
      return { text: response.text || "", toolLogs };
    }

    // Append model's response with function calls
    currentMessages.push({
      role: "model",
      parts: response.candidates?.[0]?.content?.parts || [],
    });

    const functionResponsesParts: any[] = [];

    for (const call of functionCalls) {
      let result;
      try {
        const args = (call.args || {}) as any;
        if (call.name === "getMenu") {
          result = { success: true, menu };
        } else if (call.name === "getDeliveryAreasAndHours") {
          result = { success: true, hours: "7:00 AM - 8:00 PM", deliveryZones };
        } else if (call.name === "calculateOrderPrice") {
          result = runCalculateOrderPrice(args.items, args.deliveryArea);
        } else if (call.name === "createOrder") {
          result = runCreateOrder(
            args.customerName,
            args.items,
            args.deliveryType,
            args.deliveryArea,
            args.deliveryAddress
          );
          saveOrders(); // Persist newly created order to database
        } else if (call.name === "cancelOrder") {
          result = runCancelOrder(args.orderId);
          saveOrders(); // Persist order cancellation to database
        } else if (call.name === "updateOrder") {
          result = runUpdateOrder(
            args.orderId,
            args.items,
            args.deliveryType,
            args.deliveryArea,
            args.deliveryAddress
          );
          saveOrders(); // Persist order update to database
        } else if (call.name === "getOrderStatus") {
          result = runGetOrderStatus(args.orderId);
        } else if (call.name === "generateReceiptReport") {
          result = runGenerateReceiptReport(args.orderId);
        } else {
          result = { error: `Tool ${call.name} is not implemented.` };
        }
      } catch (err: any) {
        result = { error: err.message || "An error occurred executing this tool." };
      }

      toolLogs.push({ name: call.name, args: call.args, result });

      functionResponsesParts.push({
        functionResponse: {
          name: call.name,
          response: result,
        },
      });
    }

    currentMessages.push({
      role: "user",
      parts: functionResponsesParts,
    });
  }

  throw new Error("Tool loop exceeded max attempts.");
}

// API Routes

// Get menu
app.get("/api/menu", (req, res) => {
  res.json({ menu, toppingsPrices, deliveryZones });
});

// Get orders list
app.get("/api/orders", (req, res) => {
  res.json({ orders });
});

// Manually step status (for testing/interactive purposes in UI)
app.post("/api/orders/step", (req, res) => {
  const { id } = req.body;
  const order = orders.find((o) => o.id === id);
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  const statuses: Order["status"][] = [
    "Received",
    "Baking",
    "Ready for Pickup",
    "Out for Delivery",
    "Delivered",
  ];

  const currentIndex = statuses.indexOf(order.status);
  if (currentIndex !== -1 && currentIndex < statuses.length - 1) {
    let nextIndex = currentIndex + 1;
    // skip irrelevant status
    if (order.deliveryType === "pickup" && statuses[nextIndex] === "Out for Delivery") {
      nextIndex++;
    }
    if (order.deliveryType === "delivery" && statuses[nextIndex] === "Ready for Pickup") {
      nextIndex++;
    }

    if (nextIndex < statuses.length) {
      order.status = statuses[nextIndex];
      if (order.status === "Delivered") {
        order.estimatedTime = "Delivered";
      }
    }
  }

  saveOrders(); // Save status update to persistent file database
  res.json({ success: true, order });
});

// Chat endpoint with AI Agent
app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid request payload. 'messages' array is required." });
  }

  try {
    const { text, toolLogs } = await handleGeminiAgent(messages);
    res.json({ text, toolLogs, orders });
  } catch (error: any) {
    console.error("Gemini Agent Error:", error);
    res.status(500).json({ error: error.message || "An error occurred with the AI agent." });
  }
});

// Serve frontend assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Bakery Server running at http://localhost:${PORT}`);
  });
}

startServer();
