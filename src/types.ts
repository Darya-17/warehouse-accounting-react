
export enum SectionEnum {
    STORAGE = "storage",
    WINTER = "winter",
    SUMMER = "summer",
    COMPONENTS = "components",
}

export enum CategoryEnum {
    COVERS = "covers",
    RACKS = "racks",
    ALLOY_WHEELS = "alloy_wheels",
    STEEL_WHEELS = "steel_wheels",
    FORGED_WHEELS = "forged_wheels",
    BOLTS = "bolts",
    CAPS = "caps",
    RINGS = "rings",
    VALVES = "valves",
    VALVE_CAPS = "valve_caps",
    SEALING_TAPE = "sealing_tape",
    SEALANTS = "sealants",
    BALANCE_WEIGHTS = "balance_weights",
    INNER_TUBES = "inner_tubes",
    REPAIR_MATERIALS = "repair_materials",
    CLEANERS = "cleaners",
    PROTECTORS = "protectors",
    DUST_DEFENSE = "dust_defense",
    COMPRESSORS = "compressors",
    MANOMETERS = "manometers",
    TPMS = "tpms",
    JACKS = "jacks",
    WRENCHES = "wrenches",
    TOOLS = "tools",
    ANTIPUNCTURE = "antipuncture",
    WASHER_FLUIDS = "washer_fluids",
    BRUSHES = "brushes",
    CAR_CARE = "car_care",
}

export enum SeasonEnum {
    SUMMER = "summer",
    WINTER = "winter",
}

export enum StatusEnum {
    DRAFT = "draft",
    PROCESSED = "processed",
    CANCELLED = "cancelled",
}

export interface Base {
    active: boolean;
    created_at?: string;
    updated_at?: string;
}


export interface Product extends Base {
    id: number;
    brand?: string;
    model?: string;
    price?: number;
    note?: string;
    section: SectionEnum;
}


export interface Tire extends Base {
    id: number;
    product_id: number;
    width?: string;
    profile?: string;
    diameter?: string;
    index?: string;
    spikes?: string;
    year?: number;
    country?: string;
    season?: SeasonEnum;
    product: Product;
}


export interface Component extends Base {
    id: number;
    product_id: number;
    category: CategoryEnum;
    type?: string;
    parameters?: string;
    compatibility?: string;
    weight?: number;
    material?: string;
    color?: string;
    product: Product;
}


export interface Warehouse extends Base {
    id: number;
    product_id: number;
    quantity: number;
}


export interface Storage extends Base {
    id: number;
    product_id: number;
    quantity: number;
}


export interface Order extends Base {
    id: number;
    customer_name?: string;
    phone?: string;
    service?: string;
    status: StatusEnum;
    items: OrderItem[];
}


export interface OrderItem extends Base {
    id: number;
    order_id: number;
    product_id: number;
    quantity: number;
    price?: number;
    product?: Product;
}
export type PurchaseItem = {
    id: number;
    type: "tire" | "component";
    brand: string;
    model: string;
    note: string;
    price?: number;
    quantity: number;
    width?: string;
    profile?: string;
    diameter?: string;
    index?: string;
    spikes?: string;
    year?: number;
    country?: string;

    category?: string;
    parameters?: string;
    compatibility?: string;
    weight?: number;
    material?: string;
    color?: string;
};
export interface InventoryItem {
    id: number;
    location_type: "warehouse" | "storage";
    rack: string;
    shelf: string;
    cell: string;
    quantity: number;
    product: Product;
    tire?: Tire | null;
    component?: Component | null;
}
