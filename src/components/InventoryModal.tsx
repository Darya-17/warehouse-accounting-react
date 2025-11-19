import React, {useState, useMemo} from "react";
import {Modal, Button, Table, Form, Row, Col} from "react-bootstrap";
import {InventoryItem, CategoryEnum} from "../types";
import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";
import {getPdfDoc, loadFontBinary} from "../utils.ts";

type InventoryModalProps = {
    show: boolean;
    onHide: () => void;
    items: InventoryItem[];
};

interface InventoryReportData {
    empty: InventoryItem[];
    match: InventoryItem[];
    mismatch: InventoryItem[];
}


export const InventoryModal: React.FC<InventoryModalProps> = ({show, onHide, items}) => {
    const [actualQuantities, setActualQuantities] = useState<Record<number, number | null>>({});
    const [locationFilter, setLocationFilter] = useState<"warehouse" | "storage" | "">("");
    const [categoryFilter, setCategoryFilter] = useState<string>("");

    const handleChange = (id: number, value: string) => {
        const val = value === "" ? null : parseInt(value, 10);
        setActualQuantities(prev => ({...prev, [id]: val}));
    };

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            if (locationFilter && item.location_type !== locationFilter) return false;
            if (categoryFilter) {
                const cat = item.component?.category ?? "";
                if (cat !== categoryFilter) return false;
            }
            return true;
        });
    }, [items, locationFilter, categoryFilter]);

    const handleSave = () => {
        const report = {empty: [], match: [], mismatch: []};

        filteredItems.forEach(item => {
            const actual = actualQuantities[item.id];
            const expected = item.quantity;

            if (actual === null || actual === undefined) {
                report.empty.push(item);
            } else if (actual === expected) {
                report.match.push(item);
            } else {
                report.mismatch.push({item, oldQty: expected, actualQty: actual});
            }
        });

        generatePDFReport(report);
        onHide();
    };

    const generatePDFReport = async (data: InventoryReportData) => {
        const doc = await getPdfDoc();
        let currentY = 10;
        doc.text("Отчет инвентаризации", 10, currentY);
        currentY += 10;
        const renderTable = (title: string, items: InventoryItem[], head: string[], getRow: (item: InventoryItem) => any[]) => {
            if (!items.length) return;
            doc.text(title, 10, currentY);
            currentY += 5;

            autoTable(doc, {
                startY: currentY,
                head: [head],
                body: items.map(getRow),
                theme: "grid",
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


            currentY = (doc as any).lastAutoTable.finalY + 10;
        };


        renderTable(
            "Не заполненные значения",
            data.empty,
            ["ID", "Бренд", "Модель", "Адрес", "Учтено"],
            item => [
                item.id,
                item.brand,
                item.model,
                `${item.shelf}-${item.cell}`,
                item.quantity ?? "-"
            ]
        );


        renderTable(
            "Совпавшие с наличием",
            data.match,
            ["ID", "Бренд", "Модель", "Адрес", "Учтено", "Фактическое"],
            item => [
                item.id,
                item.brand,
                item.model,
                `${item.shelf}-${item.cell}`,
                item.quantity ?? 0,
                item.actualQuantity ?? 0
            ]
        );


        renderTable(
            "Не совпавшие с наличием",
            data.mismatch,
            ["ID", "Бренд", "Модель", "Адрес", "Учтено", "Фактическое"],
            item => [
                item.id,
                item.brand,
                item.model,
                `${item.shelf}-${item.cell}`,
                item.quantity ?? 0,
                item.actualQuantity ?? 0
            ]
        );

        doc.save("inventory_report.pdf");
    };


    return (
        <Modal show={show} onHide={onHide} size="xl">
            <Modal.Header closeButton>
                <Modal.Title>Инвентаризация</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{maxHeight: "70vh", overflowY: "auto"}}>
                <Row className="mb-3">
                    <Col md={3}>
                        <Form.Label>Фильтр по локации</Form.Label>
                        <Form.Select value={locationFilter} onChange={e => setLocationFilter(e.target.value as any)}>
                            <option value="">Все</option>
                            <option value="warehouse">Склад</option>
                            <option value="storage">Хранение</option>
                        </Form.Select>
                    </Col>
                    <Col md={3}>
                        <Form.Label>Фильтр по категории</Form.Label>
                        <Form.Select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                            <option value="">Все</option>
                            {Object.values(CategoryEnum).map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </Form.Select>
                    </Col>
                </Row>

                <Table striped bordered hover variant="dark">
                    <thead>
                    <tr>
                        <th>Бренд</th>
                        <th>Модель</th>
                        <th>Текущее количество</th>
                        <th>Фактическое количество</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredItems.map(item => (
                        <tr key={item.id}>
                            <td>{item.product.brand}</td>
                            <td>{item.product.model}</td>
                            <td>{item.quantity}</td>
                            <td>
                                <Form.Control
                                    type="number"
                                    min={0}
                                    value={actualQuantities[item.id] ?? ""}
                                    onChange={e => handleChange(item.id, e.target.value)}
                                />
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </Table>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Отмена
                </Button>
                <Button variant="primary" onClick={handleSave}>
                    Сохранить и сформировать отчет
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
