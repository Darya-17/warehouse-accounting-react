import { useState, useEffect } from "react";
import { Button, Table, Form, Row, Col } from "react-bootstrap";
import type { PurchaseItem } from "../types";
import { PurchaseRow } from "../components/PurchaseRow.tsx";
import * as api from "../apiService";

let nextId = 1;


const SECTIONS = [
    { id: "winter", name: "Зимние шины", color: "#AEC6CF" },
    { id: "summer", name: "Летние шины", color: "#FFDAB9" },
    { id: "components", name: "Комплектующие", color: "#C1E1C1" },
    { id: "storage", name: "Хранение", color: "#F5CBA7" },
];

export const PurchasePage = () => {
    const [rows, setRows] = useState<PurchaseItem[]>([]);
    const [section, setSection] = useState<string | null>(null);
    const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
    const [allProducts, setAllProducts] = useState<PurchaseItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await api.getAllProducts();
                setAllProducts(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const addRow = () => {
        if (!section) return;
        setRows((prev) => [
            ...prev,
            {
                id: nextId++,
                type: section === "components" ? "component" : "tire",
                brand: "",
                model: "",
                width: "",
                profile: "",
                diameter: "",
                index: "",
                spikes: "",
                year: 2025,
                country: "",
                category: "",
                parameters: "",
                compatibility: "",
                weight: 0,
                material: "",
                color: "",
                address: "",
                note: "",
                price: 0,
                quantity: 0,
            },
        ]);
    };

    const updateRow = (id: number, data: Partial<PurchaseItem>) => {
        setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...data } : row)));
    };

    const deleteRow = (id: number) => {
        setRows((prev) => prev.filter((row) => row.id !== id));
    };

    const saveAll = async () => {
        if (!section) return;
        if (!window.confirm("Сохранить все изменения?")) return;

        try {
            for (const row of rows) {
                const productData = {
                    brand: row.brand,
                    model: row.model,
                    price: row.price,
                    note: row.note,
                };
                const createdProduct = await api.createProduct(productData);

                if (row.type === "tire") {
                    await api.createTire({ ...row, product_id: createdProduct.data.id });
                } else if (row.type === "component") {
                    await api.createComponent({ ...row, product_id: createdProduct.data.id });
                }

                await api.addProductToWarehouse(createdProduct.data.id, row.quantity);
            }
            alert("Закупка успешно сохранена!");
            setRows([]);
        } catch (err) {
            console.error(err);
            alert("Ошибка при сохранении.");
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        const file = e.target.files[0];
        const text = await file.text();
        const lines = text.split("\n");

        const newRows: PurchaseItem[] = lines
            .map((line) => {
                const [type, brand, model, quantity, address] = line.split(";");
                if (!type) return null;
                return {
                    id: nextId++,
                    type: type === "tire" ? "tire" : "component",
                    brand: brand || "",
                    model: model || "",
                    width: "",
                    profile: "",
                    diameter: "",
                    index: "",
                    spikes: "",
                    year: 2025,
                    country: "",
                    category: "",
                    parameters: "",
                    compatibility: "",
                    weight: 0,
                    material: "",
                    color: "",
                    address: address || "",
                    note: "",
                    price: 0,
                    quantity: quantity ? Number(quantity) : 0,
                };
            })
            .filter(Boolean) as PurchaseItem[];

        setRows((prev) => [...prev, ...newRows]);
    };

    return (
        <div className="p-3">
            <h2>Закупка</h2>

            <Row className="mb-3">
                <Col md={3}>
                    <Form.Label>Выберите секцию</Form.Label>
                    <Form.Select value={section || ""} onChange={(e) => setSection(e.target.value)}>
                        <option value="">-- Выберите секцию --</option>
                        {SECTIONS.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </Form.Select>
                </Col>
                <Col md={3}>
                    <Form.Label>Дата закупки</Form.Label>
                    <Form.Control type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </Col>
                <Col md={3} className="d-flex align-items-end">
                    <Button onClick={addRow} disabled={!section}>Добавить вручную</Button>
                </Col>
                <Col md={3} className="d-flex align-items-end">
                    <Form.Control type="file" onChange={handleFileUpload} />
                </Col>
            </Row>

            <Table striped bordered hover variant="dark" responsive style={{ tableLayout: "fixed" }}>
                <thead style={{ position: "sticky", top: 0, backgroundColor: "#333", zIndex: 2 }}>
                <tr>
                    <th>Бренд</th>
                    <th>Модель</th>
                    <th>Ширина</th>
                    <th>Профиль</th>
                    <th>Диаметр</th>
                    <th>Индекс</th>
                    <th>Шипы</th>
                    <th>Год</th>
                    <th>Страна</th>
                    <th>Адрес</th>
                    <th>Заметка</th>
                    <th>Цена</th>
                    <th style={{ backgroundColor: "#444" }}>Количество</th>
                    <th>Действия</th>
                </tr>
                </thead>
                <tbody>
                {rows.map((row) => (
                    <PurchaseRow key={row.id} row={row} updateRow={updateRow} deleteRow={deleteRow} allProducts={allProducts} />
                ))}
                </tbody>
            </Table>

            {loading && <div>Загрузка товаров...</div>}
            <Button variant="success" onClick={saveAll} disabled={!rows.length} className="mt-3">Сохранить все</Button>
        </div>
    );
};
