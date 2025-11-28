

import axios from "axios";
import {StatusEnum} from "./types.ts";

const api = axios.create({
    baseURL: "http://localhost:8000",
    headers: {
        "Content-Type": "application/json",
    },
});


export const getAllProducts = () => {
    return api.get("/products/");
};

export const createProduct = (data: {
    brand: string;
    model: string;
    price?: number;
    note?: string;
}) => {
    return api.post("/products/", data);
};

export const updateProduct = (id: number, data: Partial<{
    brand: string;
    model: string;
    price: number;
    note: string;
}>) => {
    return api.patch(`/products/${id}`, data);
};


export const createTire = (data: {
    product_id: number;
    width?: string | null;
    profile?: string | null;
    diameter?: string | null;
    index?: string | null;
    spikes?: string | null;
    year?: number;
    country?: string | null;
    season?: "winter" | "summer";
}) => {
    return api.post("/tires/", data);
};

export const updateTire = (id: number, data: Partial<{
    width?: string;
    profile?: string;
    diameter?: string;
    index?: string;
    spikes?: string;
    year?: number;
    country?: string;
    season?: "winter" | "summer";
}>) => {
    return api.patch(`/tires/${id}`, data);
};


export const createComponent = (data: {
    product_id: number;
    category: string;
    parameters?: string;
    compatibility?: string;
    weight: number;
    material: string;
    color?: string | null;
}) => {
    return api.post("/components/", data);
};

export const updateComponent = (id: number, data: Partial<{
    category: string;
    parameters?: string;
    compatibility?: string;
    weight: number;
    material: string;
    color?: string | null;
}>) => {
    return api.patch(`/components/${id}`, data);
};

export const updateWarehouseItem = (
    id: number,
    data: {
        quantity?: number;
        rack?: string;
        shelf?: string;
        cell?: string;
        product_id?: number;
    }
) => {
    return api.patch(`/warehouse/${id}`, data);
};
export const updateStorageItem = (
    id: number,
    data: {
        quantity?: number;
        rack?: string;
        shelf?: string;
        cell?: string;
        product_id?: number;
    }
) => {
    return api.patch(`/storage/${id}`, data);
};


export const addProductToWarehouse = (productId: number, quantity: number) => {
    return api.post("/warehouse/", {
        product_id: productId,
        rack: "Закупка",
        shelf: "Новая",
        cell: "0",
        quantity,
    });
};
export const changeOrderStatus = (id: number, status: StatusEnum) =>
    updateOrder(id, {
        status
    });


export const createOrder = (data: any) => api.post("/orders/", data);
export const updateOrder = (id: number, data: any) => api.patch(`/orders/${id}`, data);
export const getOrders = () => api.get("/orders/");


export const getInventory = () => api.get("/inventory/");


api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("API Error:", error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default api;