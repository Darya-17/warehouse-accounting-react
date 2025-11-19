import React, { useState } from "react";
import { Order, StatusEnum } from "../types.ts";
import {getStatusLabel} from "../utils.ts";

interface OrderCardProps {
    order: Order;
    onStatusChange: (orderId: number, status: StatusEnum) => void;
    onEdit: (orderId: number) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onStatusChange, onEdit }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="accordion-item mb-2">
            <h2 className="accordion-header">
                <button
                    className={`accordion-button ${isOpen ? "" : "collapsed"}`}
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {order.service === "хранение" ? "Хранение" : "Заказ"} #{order.id} — {order.customer_name || "Без имени"} — Статус: {getStatusLabel(order.status)}
                </button>
            </h2>

            <div className={`accordion-collapse collapse ${isOpen ? "show" : ""}`}>
                <div className="accordion-body">
                    <table className="table table-bordered table-hover mb-2">
                        <thead className="table-light">
                        <tr>
                            <th>Бренд</th>
                            <th>Модель</th>
                            <th>Количество</th>
                            <th>Цена</th>
                        </tr>
                        </thead>
                        <tbody>
                        {order.items.map(item => (
                            <tr key={item.id}>
                                <td>{item.product?.brand}</td>
                                <td>{item.product?.model}</td>
                                <td>{item.quantity}</td>
                                <td>{item.price || "-"}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-success"
                            disabled={order.status === StatusEnum.PROCESSED}
                            onClick={() => onStatusChange(order.id, StatusEnum.PROCESSED)}
                        >
                            Обработан
                        </button>
                        <button
                            className="btn btn-danger"
                            disabled={order.status === StatusEnum.CANCELLED}
                            onClick={() => onStatusChange(order.id, StatusEnum.CANCELLED)}
                        >
                            Отменен
                        </button>
                        <button className="btn btn-secondary" onClick={() => onEdit(order.id)}>
                            Редактировать
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
