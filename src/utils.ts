import {AppRouteObject} from "./Routes.tsx";
import {matchRoutes, useLocation} from "react-router-dom";
import {useEffect, useState} from "react";
import {InventoryItem, StatusEnum} from "./types.ts";
import {getInventory} from "./apiService.ts";
import jsPDF from "jspdf";

export const usePageTitle = (routes: AppRouteObject[]) => {
    const location = useLocation();

    useEffect(() => {
        const matches = matchRoutes(routes, location);
        if (!matches) return;

        const lastMatch = matches[matches.length - 1].route as AppRouteObject;
        if (lastMatch.title) {
            document.title = lastMatch.title;
        }
    }, [location]);
}
export const loadFontBinary = async (url: string) => {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    let binary = "";
    const bytes = new Uint8Array(buffer);

    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }

    return binary;
}

export const useInventory = () => {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const {data} = await getInventory();
            setInventory(data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const getQuantity = (productId: number, locationType?: "warehouse" | "storage") => {
        const items = inventory.filter(i => i.product.id === productId);
        if (locationType) return items.filter(i => i.location_type === locationType).reduce((sum, i) => sum + i.quantity, 0);
        return items.reduce((sum, i) => sum + i.quantity, 0);
    };

    return {inventory, loading, fetchInventory, getQuantity};
};
export const getPdfDoc = async () => {
    const doc = new jsPDF();
    const fontBinary = await loadFontBinary("/Roboto-Regular.ttf");
    doc.addFileToVFS("Roboto-Regular.ttf", fontBinary);
    doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
    doc.setFont("Roboto");
    return doc;
}
export const getStatusLabel = (status: StatusEnum) => {
    switch (status) {
        case StatusEnum.CANCELLED:
            return "отменен";
        case StatusEnum.DRAFT:
            return "в работе";
        case StatusEnum.PROCESSED:
            return "обработан";

    }
}