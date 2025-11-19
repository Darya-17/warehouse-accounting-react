import { useInventory } from "../utils.ts";
import { useState } from "react";
import { InventoryItem, StatusEnum } from "../types.ts";
import { createOrder, updateOrder } from "../apiService.ts";

interface OrderModalProps {
    orderId?: number;
    service: "продажа" | "хранение";
    onClose: () => void;
    onSaved: () => void;
}

interface OrderLine {
    product: InventoryItem | null;
    quantity: number;
}

export const OrderModal: React.FC<OrderModalProps> = ({ orderId, service, onClose, onSaved }) => {
    const { inventory, getQuantity } = useInventory();
    const [lines, setLines] = useState<OrderLine[]>([{ product: null, quantity: 1 }]);
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [error, setError] = useState<string>("");

    const addLine = () => setLines([...lines, { product: null, quantity: 1 }]);
    const updateLine = (index: number, updated: Partial<OrderLine>) => {
        const newLines = [...lines];
        newLines[index] = { ...newLines[index], ...updated };
        setLines(newLines);
    };
    const removeLine = (index: number) => setLines(lines.filter((_, i) => i !== index));

    const checkStock = (): boolean => {
        for (const line of lines) {
            if (!line.product) continue;
            const availableQty = getQuantity(line.product.id, service === "хранение" ? "storage" : "warehouse");
            if (line.quantity > availableQty) {
                setError(`Недостаточно товара ${line.product.product.brand} ${line.product.product.model}. Доступно: ${availableQty}`);
                return false;
            }
        }
        return true;
    };

    const handleSave = async () => {
        if (!customerName || !customerPhone) {
            setError("Заполните ФИО и телефон");
            return;
        }

        if (!checkStock()) return;

        const items = lines
            .filter(line => line.product !== null)
            .map(line => ({
                product_id: line.product!.product.id,
                quantity: line.quantity,
                price: line.product!.product.price,
            }));

        if (items.length === 0) {
            setError("Добавьте хотя бы один товар");
            return;
        }

        const payload = {
            service,
            status: StatusEnum.DRAFT,
            customer_name: customerName,
            customer_phone: customerPhone,
            items,
        };

        try {
            if (orderId) {
                await updateOrder(orderId, payload);
            } else {
                await createOrder(payload);
            }
            onSaved();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.detail || "Ошибка при сохранении");
        }
    };

    return (
        <>
            <div className="modal fade show" style={{ display: "block" }} tabIndex={-1}>
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">
                                {orderId
                                    ? "Редактировать заказ"
                                    : service === "хранение"
                                        ? "Создать хранение"
                                        : "Создать заказ"}
                            </h5>
                            <button type="button" className="btn-close" onClick={onClose}></button>
                        </div>

                        <div className="modal-body">
                            {error && <div className="alert alert-danger">{error}</div>}

                            <div className="mb-3">
                                <label className="form-label">ФИО</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={customerName}
                                    onChange={e => setCustomerName(e.target.value)}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Телефон</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={customerPhone}
                                    onChange={e => setCustomerPhone(e.target.value)}
                                />
                            </div>

                            {lines.map((line, idx) => {
                                const maxQty = line.product
                                    ? getQuantity(line.product.id, service === "хранение" ? "storage" : "warehouse")
                                    : 1;

                                return (
                                    <div key={idx} className="d-flex gap-2 align-items-center mb-2">
                                        <select
                                            className="form-select"
                                            value={line.product ? line.product.id : ""}
                                            onChange={e => {
                                                const selected = inventory.find(i => i.id === Number(e.target.value)) || null;
                                                updateLine(idx, { product: selected, quantity: 1 });
                                            }}
                                        >
                                            <option value="">Выберите товар</option>
                                            {inventory.map(i => (
                                                <option key={i.id} value={i.id}>
                                                    {i.product.brand} {i.product.model} ({i.quantity} шт на складе)
                                                </option>
                                            ))}
                                        </select>

                                        <input
                                            type="number"
                                            className="form-control"
                                            min={1}
                                            max={maxQty}
                                            value={line.quantity}
                                            onChange={e => {
                                                let val = Number(e.target.value);
                                                if (val > maxQty) val = maxQty;
                                                if (val < 1) val = 1;
                                                updateLine(idx, { quantity: val });
                                            }}
                                        />

                                        <button className="btn btn-danger" onClick={() => removeLine(idx)}>
                                            Удалить
                                        </button>
                                    </div>
                                );
                            })}

                            <button className="btn btn-secondary mt-2" onClick={addLine}>
                                Добавить товар
                            </button>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-primary" onClick={handleSave}>
                                Сохранить
                            </button>
                            <button className="btn btn-secondary" onClick={onClose}>
                                Отмена
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="modal-backdrop fade show"></div>
        </>
    );
};
