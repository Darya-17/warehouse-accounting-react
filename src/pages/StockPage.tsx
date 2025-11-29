import React, {useEffect, useMemo, useState} from "react";
import {Container, Row, Col, Form, Pagination, Button} from "react-bootstrap";
import {StockTable} from "../components/StockTable";
import {WarehouseMap, WarehouseClickProps} from "../components/WarehouseMap";
import {InventoryItem} from "../types";
import {getInventory} from "../apiService.ts";
import {InventoryModal} from "../components/InventoryModal.tsx";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";
import {getPdfDoc} from "../utils.ts";
import {TurnoverModal} from "../components/TurnoverModal.tsx";

export const StockPage: React.FC = () => {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [selectedSection, setSelectedSection] = useState<string | null>(null);
    const [selectedRack, setSelectedRack] = useState<string | null>(null);
    const [selectedType, setSelectedType] = useState<"tire" | "component">("tire");
    const [globalSearch, setGlobalSearch] = useState<string>("");
    const [columnFilters, setColumnFilters] = useState<Partial<Record<string, string>>>({});
    const [sortField, setSortField] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const [page, setPage] = useState(1);
    const pageSize = 30;
    const [showModal, setShowModal] = useState<boolean>(false);

    useEffect(() => {
        getInventory().then((data) => setItems(data.data));
    }, []);

    const filteredItems = useMemo(() => {
        let list = [...items];

        list = list.filter((item) =>
            selectedType === "tire" ? item.tire != null : item.component != null
        );

        if (selectedSection) {
            list = list.filter(
                (i) => {
                    switch (selectedSection) {
                        case "components":
                            return i.component != null;
                        case "storage":
                            return i.location_type == 'storage';
                        case "winter":
                            return i.tire != null && i.tire?.season == 'winter';
                        case "summer":
                            return i.tire != null && i.tire?.season == 'summer';
                    }
                }
            );
        }

        if (selectedRack) {
            list = list.filter((i) => i.rack.startsWith(selectedRack));
        }

        if (globalSearch.trim() !== "") {
            const q = globalSearch.toLowerCase();
            list = list.filter((i) => JSON.stringify(i).toLowerCase().includes(q));
        }

        Object.entries(columnFilters).forEach(([field, value]) => {
            if (!value) return;
            const q = value.toLowerCase();
            list = list.filter((i) => {
                const fromProduct = (i.product as any)[field];
                const fromTire = i.tire ? (i.tire as any)[field] : undefined;
                const fromComponent = i.component ? (i.component as any)[field] : undefined;
                const fromSelf = (i as any)[field];
                const combined = [fromProduct, fromTire, fromComponent, fromSelf]
                    .filter(Boolean)
                    .map((v) => v.toString().toLowerCase());
                return combined.some((v) => v.includes(q));
            });
        });

        if (sortField) {
            list.sort((a, b) => {
                const av =
                    (a.product as any)[sortField] ??
                    (a.tire as any)?.[sortField] ??
                    (a.component as any)?.[sortField] ??
                    (a as any)[sortField] ??
                    "";
                const bv =
                    (b.product as any)[sortField] ??
                    (b.tire as any)?.[sortField] ??
                    (b.component as any)?.[sortField] ??
                    (b as any)[sortField] ??
                    "";
                if (av === bv) return 0;
                return sortDirection === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
            });
        }

        return list;
    }, [
        items,
        selectedSection,
        selectedRack,
        globalSearch,
        columnFilters,
        sortField,
        sortDirection,
        selectedType,
    ]);

    const totalPages = Math.ceil(filteredItems.length / pageSize);
    const pageItems = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredItems.slice(start, start + pageSize);
    }, [filteredItems, page]);

    const handleMapSelect = (sel: WarehouseClickProps) => {
        if (sel.type === "section") {
            setSelectedSection((prev) => (prev === sel.name ? null : sel.name));
            setSelectedRack(null);
        } else {
            setSelectedRack((prev) => (prev === sel.name ? null : sel.name));
            setSelectedSection(null);
        }
    };


    const generatePriceListPDF = async () => {
        const doc = await getPdfDoc();
        const tableData = filteredItems.map((item) => [
            item.product.brand ?? "",
            item.product.model ?? "",
            item.product.price ?? "",
        ]);
        doc.text("Прайс-лист склада", 14, 15);
        autoTable(doc, {
            head: [["Бренд", "Модель", "Цена"]],
            body: tableData,
            startY: 20,
            styles: {
                font: "Roboto",
                fontStyle: "normal",
                fontSize: 8
            },
            headStyles: {
                font: "Roboto",
                fontStyle: "normal"
            },
            bodyStyles: {
                font: "Roboto",
                fontStyle: "normal"
            }
        });
        doc.save("pricelist.pdf");
    };
    const generateTurnoverReportPDF = async (items: InventoryItem[], startDate: any, endDate: any) => {
        const doc = await getPdfDoc();
        const tableData = items.map((item) => [
            item.product.brand ?? "",
            item.product.model ?? "",
            item.quantity,
            item.quantity
        ]);
        doc.text(`Отчет оборачиваемости за период ${startDate} — ${endDate}`, 10, 10);

        const days =
            (new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000;
        const rows = items.map(item => {
            const sales = item.sales ?? 0;
            const stock = item.quantity ?? 0;
            const avgStock = stock;
            const turnover = avgStock === 0 ? 0 : sales / avgStock;
            const dsi = sales === 0 ? "-" : (avgStock / sales) * days;

            return [
                item.id,
                item.brand,
                item.model,
                stock,
                sales,
                avgStock,
                turnover.toFixed(2),
                dsi.toString()
            ];
        });

        autoTable(doc, {
            startY: 20,
            head: [["ID", "Бренд", "Модель", "Остаток", "Продажи", "Средн. остаток", "Оборач.", "DSI"]],
            body: rows,
            styles: {
                font: "Roboto",
                fontStyle: "normal",
                fontSize: 8
            },
            headStyles: {
                font: "Roboto",
                fontStyle: "normal"
            },
            bodyStyles: {
                font: "Roboto",
                fontStyle: "normal"
            },
        });
        doc.save("turnover_report.pdf");
    };
    const [showTurnover, setShowTurnover] = useState(false);

    return (
        <Container fluid>
            <TurnoverModal
                show={showTurnover}
                onHide={() => setShowTurnover(false)}
                items={items}
                onGenerate={(start, end) => {
                    generateTurnoverReportPDF(items, start, end);
                    setShowTurnover(false);
                }}
            />

            <Row className="mb-4">
                <Col>
                    <WarehouseMap onSelect={handleMapSelect}/>
                </Col>
            </Row>

            <Row className="mb-3">
                <Col className="d-flex justify-content-end">
                    <Button variant="primary" className="me-2" onClick={() => setShowModal(true)}>
                        Инвентаризация
                    </Button>
                    <Button variant="info" className="me-2" onClick={generatePriceListPDF}>
                        Прайс-лист
                    </Button>
                    <Button variant="success" onClick={() => setShowTurnover(true)}>
                        Отчет оборачиваемости
                    </Button>

                    <InventoryModal
                        show={showModal}
                        onHide={() => setShowModal(false)}
                        items={items}
                    />
                </Col>
            </Row>

            <Row className="mb-3">
                <Col><h2>Склад</h2></Col>
                <Col className="row">
                    <Col className="align-content-center">
                        <Form.Check
                            id="filter-component"
                            type="radio"
                            checked={selectedType === "component"}
                            onChange={() => setSelectedType("component")}
                            label="Комплектующие"
                            name="typeProductsGroup"
                        />
                    </Col>
                    <Col className="align-content-center">
                        <Form.Check
                            id="filter-tire"
                            type="radio"
                            checked={selectedType === "tire"}
                            onChange={() => setSelectedType("tire")}
                            label="Шины"
                            name="typeProductsGroup"
                        />
                    </Col>
                    <Col>
                        <Form.Control
                            placeholder="Поиск"
                            value={globalSearch}
                            onChange={(e) => {
                                setGlobalSearch(e.target.value);
                                setPage(1);
                            }}
                        />
                    </Col>
                </Col>
            </Row>

            <Row>
                <Col>
                    <StockTable
                        items={pageItems}
                        type={selectedType}
                        sortField={sortField as any}
                        sortDirection={sortDirection}
                        filters={columnFilters as any}
                        onSortChange={(field, direction) => {
                            setSortField(field);
                            setSortDirection(direction);
                            setPage(1);
                        }}
                        onFilterChange={(field, value) => {
                            setColumnFilters((prev) => ({...prev, [field]: value}));
                            setPage(1);
                        }}
                    />
                </Col>
            </Row>

            <Row className="mt-3">
                <Col>
                    <Pagination>
                        <Pagination.First onClick={() => setPage(1)} disabled={page <= 1}/>
                        <Pagination.Prev onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}/>
                        {Array.from({length: totalPages}, (_, i) => (
                            <Pagination.Item key={i} active={page === i + 1} onClick={() => setPage(i + 1)}>
                                {i + 1}
                            </Pagination.Item>
                        ))}
                        <Pagination.Next onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                         disabled={page >= totalPages}/>
                        <Pagination.Last onClick={() => setPage(totalPages)} disabled={page >= totalPages}/>
                    </Pagination>
                </Col>
            </Row>
        </Container>
    );
};
