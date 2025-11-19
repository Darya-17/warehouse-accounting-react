import axios from "axios";
import {InventoryItem, type Order, type Product, PurchaseItem, StatusEnum, type Warehouse} from "./types.ts";

const api = axios.create({
    baseURL: "http://localhost:8000",
    headers: {
        "Content-Type": "application/json",
    },
});


export const getProducts = () => api.get<Product[]>("/products");
export const getProductById = (id: number) => api.get<Product>(`/products/${id}`);
export const createProduct = (data: Partial<Product>) => api.post<Product>("/products", data);
export const updateProduct = (id: number, data: Partial<Product>) =>
    api.put<Product>(`/products/${id}`, data);
export const deleteProduct = (id: number) => api.delete(`/products/${id}`);


export const getOrders = () => api.get<Order[]>("/orders");
export const getOrderById = (id: number) => api.get<Order>(`/orders/${id}`);
export const createOrder = (data: Partial<Order>) => api.post<Order>("/orders", data);
export const updateOrder = (id: number, data: Partial<Order>) => api.patch<Order>(`/orders/${id}`, data);
export const deleteOrder = (id: number) => api.delete(`/orders/${id}`);


export const getWarehouse = () => api.get<Warehouse[]>("/warehouse");
export const getStorage = () => api.get<Storage[]>("/storage");


export const changeOrderStatus = (id: number, status: StatusEnum) =>
    updateOrder(id, {
        status
    });

export const addProductToWarehouse = (productId: number, quantity: number) =>
    api.post<Warehouse>("/warehouse", {product_id: productId, quantity});
export const getAllProducts = () => api.get<PurchaseItem[]>("/all_products");
export const getInventory = () => api.get<InventoryItem[]>("/inventory");