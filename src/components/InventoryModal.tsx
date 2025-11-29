// src/components/InventoryModal.tsx

import React, {useState, useMemo} from "react";
import {
    Modal,
    Button,
    Table,
    Form,
    Row,
    Col,
    Alert,
    Spinner,
} from "react-bootstrap";
import {InventoryItem, PurchaseItem} from "../types";
import autoTable from "jspdf-autotable";
import {getPdfDoc} from "../utils.ts";
import * as api from "../apiService.ts";

// Модалка подтверждения
const ConfirmInventoryModal: React.FC<{
    show: boolean;
    changesCount: number;
    onConfirm: () => void;
    onCancel: () => void;
}> = ({show, changesCount, onConfirm, onCancel}) => (
    <Modal show={show} onHide={onCancel} centered backdrop="static">
        <Modal.Header closeButton>
            <Modal.Title>Подтверждение инвентаризации</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            {changesCount === 0 ? (
                <p>Ничего не изменилось. Сформировать отчёт?</p>
            ) : (
                <p>
                    Будет обновлено <strong>{changesCount}</strong> позиций на складе.
                    <br/>
                    Это действие нельзя отменить.
                </p>
            )}
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={onCancel}>Отмена</Button>
            <Button variant="success" onClick={onConfirm}>
                {changesCount === 0 ? "Сформировать отчёт" : "Сохранить и скачать отчёт"}
            </Button>
        </Modal.Footer>
    </Modal>
);

type InventoryModalProps = {
    show: boolean;
    onHide: () => void;
    items: InventoryItem[];
};

export const InventoryModal: React.FC<InventoryModalProps> = ({show, onHide, items}) => {
    const [actualQuantities, setActualQuantities] = useState<Record<string, number>>({});
    const [locationFilter, setLocationFilter] = useState<"warehouse" | "storage" | "">("");
    const [saving, setSaving] = useState(false);
    const [alert, setAlert] = useState<{ type: "success" | "danger"; message: string } | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingChangesCount, setPendingChangesCount] = useState(0);

    const handleChange = (id: number, value: string) => {
        const num = value === "" ? 0 : parseInt(value, 10);
        setActualQuantities(prev => ({
            ...prev,
            [id]: isNaN(num) ? 0 : num
        }));
    };

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            if (locationFilter && item.location_type !== locationFilter) return false;
            return true;
        });
    }, [items, locationFilter]);

    const handleSaveAndGenerate = () => {
        const changes = filteredItems.filter(item => {
            const actual = actualQuantities[generateId(item)] ?? item.quantity;
            return actual !== item.quantity;
        });

        setPendingChangesCount(changes.length);
        setShowConfirmModal(true);
    };

    const confirmAndProceed = async () => {
        setShowConfirmModal(false);
        setSaving(true);
        setAlert(null);

        try {
            const updatePromises = filteredItems.map(async (item) => {
                const actual = actualQuantities[generateId(item)] ?? item.quantity;
                if (actual === item.quantity) return;

                if (item.location_type === "warehouse") {
                    await api.updateWarehouseItem(item.id, {quantity: actual});
                } else {
                    await api.updateStorageItem(item.id, {quantity: actual});
                }
            });
            await Promise.all(updatePromises);
            setAlert({
                type: "success",
                message: `Инвентаризация завершена: ${pendingChangesCount} изменений сохранено`,
            });
            generatePDFReport();
        } catch (err: any) {
            setAlert({
                type: "danger",
                message: err.response?.data?.detail || "Ошибка при сохранении",
            });
        } finally {
            setSaving(false);
        }
    };

    const generatePDFReport = async () => {
        const doc = await getPdfDoc();
        let y = 20;

        doc.setFontSize(18);
        doc.text("Отчёт по инвентаризации", 14, y);
        y += 10;
        doc.setFontSize(11);
        doc.text(`Дата: ${new Date().toLocaleDateString("ru-RU")}`, 14, y);
        y += 15;

        // Разделяем на три группы
        const empty: typeof filteredItems = [];
        const match: typeof filteredItems = [];
        const mismatch: typeof filteredItems = [];

        filteredItems.forEach(item => {
            const actual = actualQuantities[generateId(item)] ?? item.quantity;

            if (actualQuantities[generateId(item)] === undefined) {
                empty.push(item);
            } else if (actual === item.quantity) {
                match.push(item);
            } else {
                mismatch.push(item);
            }
        });

        const renderSection = (
            title: string,
            data: typeof filteredItems,
            color: [number, number, number]
        ) => {
            if (data.length === 0) return;

            doc.setFontSize(14);
            doc.setTextColor(...color);
            doc.text(title, 14, y);
            y += 8;

            const tableBody = data.map(item => {
                const actual = actualQuantities[generateId(item)] ?? item.quantity;
                const diff = actual - item.quantity;

                return [
                    item.product.brand || "-",
                    item.product.model || "-",
                    item.location_type === "warehouse" ? "Склад" : "Хранение",
                    `${item.rack}-${item.shelf}-${item.cell}`,
                    item.quantity.toString(),
                    actual.toString(),
                    diff === 0 ? "OK" : diff > 0 ? `+${diff}` : diff.toString(),
                ];
            });

            autoTable(doc, {
                head: [["Бренд", "Модель", "Локация", "Адрес", "Учтено", "Факт", "Разница"]],
                body: tableBody,
                startY: y,
                theme: "striped",
                styles: {
                    font: "Roboto",
                    fontStyle: "normal",
                    fontSize: 8
                },
                headStyles: {
                    font: "Roboto",
                    fontStyle: "normal",
                    fillColor: color
                },
                bodyStyles: {
                    font: "Roboto",
                    fontStyle: "normal"
                }
            });

            y = (doc as any).lastAutoTable.finalY + 15;
        };

        renderSection("НЕЗАПОЛНЕННЫЕ ЗНАЧЕНИЯ", empty, [255, 100, 100]);
        renderSection("СОВПАДАЮЩИЕ С НАЛИЧИЕМ", match, [100, 200, 100]);
        renderSection("НЕ СОВПАДАЮЩИЕ С НАЛИЧИЕМ", mismatch, [255, 165, 0]);

        doc.save(`инвентаризация_${new Date().toISOString().slice(0, 10)}.pdf`);
        onHide();
    };
    const generateId = (item: PurchaseItem) => {
        return `${item.product.id}-${item.id}`;
    }
    return (
        <>
            <Modal show={show} onHide={onHide} size="xl" fullscreen="xl-down">
                <Modal.Header closeButton>
                    <Modal.Title>Инвентаризация</Modal.Title>
                </Modal.Header>

                <Modal.Body style={{maxHeight: "75vh", overflowY: "auto"}}>
                    {alert && (
                        <Alert variant={alert.type} onClose={() => setAlert(null)} dismissible>
                            {alert.message}
                        </Alert>
                    )}

                    <Row className="mb-4">
                        <Col md={4}>
                            <Form.Label>Локация</Form.Label>
                            <Form.Select value={locationFilter}
                                         onChange={(e) => setLocationFilter(e.target.value as any)}>
                                <option value="">Все</option>
                                <option value="warehouse">Склад</option>
                                <option value="storage">Хранение</option>
                            </Form.Select>
                        </Col>
                    </Row>

                    <Table striped bordered hover className="table-dark">
                        <thead>
                        <tr>
                            <th>Бренд</th>
                            <th>Модель</th>
                            <th>Локация</th>
                            <th>Адрес</th>
                            <th>Учтено</th>
                            <th>Фактическое количество</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredItems.map((item) => {
                            const id = generateId(item);
                            const actual = actualQuantities[id] ?? item.quantity;
                            const isEmpty = actualQuantities[id] === undefined;
                            const diff = actual - item.quantity;

                            return (
                                <tr key={id} className={isEmpty ? "table" : diff !== 0 ? "table-info" : ""}>
                                    <td>{item.product.brand || "-"}</td>
                                    <td>{item.product.model || "-"}</td>
                                    <td>{item.location_type === "warehouse" ? "Склад" : "Хранение"}</td>
                                    <td>{item.rack}-{item.shelf}-{item.cell}</td>
                                    <td className="text-center">{item.quantity}</td>
                                    <td>
                                        <Form.Control
                                            type="number"
                                            min={0}
                                            placeholder={isEmpty ? "Не заполнено" : undefined}
                                            defaultValue={isEmpty ? "" : item.quantity}
                                            onChange={(e) => handleChange(id, e.target.value)}
                                            className={diff !== 0 ? "border-warning" : ""}
                                        />
                                        {diff !== 0 && (
                                            <small className={diff > 0 ? "text-success" : "text-danger"}>
                                                {diff > 0 ? "+" : ""}{diff}
                                            </small>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </Table>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide} disabled={saving}>
                        Отмена
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSaveAndGenerate}
                        disabled={saving}
                    >
                        {saving ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2"/>
                                Сохранение...
                            </>
                        ) : (
                            "Сохранить и скачать отчёт"
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>

            <ConfirmInventoryModal
                show={showConfirmModal}
                changesCount={pendingChangesCount}
                onConfirm={confirmAndProceed}
                onCancel={() => setShowConfirmModal(false)}
            />
        </>
    );
};