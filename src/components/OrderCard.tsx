import React, {useState} from "react";
import {Order, StatusEnum} from "../types.ts";
import {getStatusLabel, getStatusColor} from "../utils.ts";
import {Table} from "react-bootstrap";

interface OrderCardProps {
    order: Order;
    onStatusChange: (orderId: number, status: StatusEnum) => Promise<void>;
}


const ConfirmActionModal: React.FC<{
    show: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
}> = ({
          show,
          title,
          message,
          confirmText = "Да, выполнить",
          cancelText = "Отмена",
          onConfirm,
          onCancel,
      }) => {
    if (!show) return null;

    return (
        <div className="modal fade show" style={{display: "block", backgroundColor: "rgba(0,0,0,0.5)"}} tabIndex={-1}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{title}</h5>
                        <button type="button" className="btn-close" onClick={onCancel}></button>
                    </div>
                    <div className="modal-body">
                        <p>{message}</p>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onCancel}>
                            {cancelText}
                        </button>
                        <button type="button" className="btn btn-primary" onClick={onConfirm}>
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const OrderCard: React.FC<OrderCardProps> = ({order, onStatusChange}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [pendingStatus, setPendingStatus] = useState<StatusEnum | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const currentStatus = order.status;
    const isStorage = order.service === "хранение";

    const handleStatusClick = (newStatus: StatusEnum) => {
        setPendingStatus(newStatus);
        setShowConfirm(true);
    };

    const confirmStatusChange = async () => {
        if (!pendingStatus) return;

        setIsLoading(true);
        try {
            await onStatusChange(order.id, pendingStatus);
        } finally {
            setIsLoading(false);
            setShowConfirm(false);
            setPendingStatus(null);
        }
    };

    const getActionConfig = () => {
        if (isStorage) {

            if (currentStatus === StatusEnum.DRAFT) {
                return {
                    main: {label: "Выдать клиенту", status: StatusEnum.PROCESSED, variant: "success"},
                    cancel: {label: "Отменить хранение", status: StatusEnum.CANCELLED, variant: "danger"},
                };
            } else {
                return {
                    main: {label: "Принять на хранение", status: StatusEnum.DRAFT, variant: "primary"},
                };
            }
        } else {

            if (currentStatus === StatusEnum.DRAFT) {
                return {
                    main: {label: "Обработать заказ", status: StatusEnum.PROCESSED, variant: "success"},
                    cancel: {label: "Отменить", status: StatusEnum.CANCELLED, variant: "danger"},
                };
            } else if (currentStatus === StatusEnum.PROCESSED || currentStatus === StatusEnum.CANCELLED) {
                return {
                    cancel: {label: "Вернуть в работу", status: StatusEnum.DRAFT, variant: "warning"},
                };
            }
        }
        return {};
    };

    const actions = getActionConfig();

    return (
        <>
            <div className="accordion-item mb-3 border rounded shadow-sm">
                <h2 className="accordion-header">
                    <button
                        className={`accordion-button ${isOpen ? "" : "collapsed"} fw-medium`}
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        style={{fontSize: "1.05rem"}}
                    >
            <span className="me-3">
              {isStorage ? "Хранение" : "Заказ"} #{order.id}
            </span>
                        <span className="text-muted">— {order.customer_name || "Без имени"}</span>
                        <span className="text-muted">{order.customer_phone}</span>
                        <span className={`badge text-dark bg-${getStatusColor(currentStatus)} ms-auto`}>
              {getStatusLabel(currentStatus)}
            </span>

                    </button>
                </h2>

                <div className={`accordion-collapse collapse ${isOpen ? "show" : ""}`}>
                    <div className="accordion-body">
                        <div className="table-responsive mb-3">
                            <Table striped bordered hover variant="dark">
                                <thead>
                                <tr>
                                    <th>Бренд</th>
                                    <th>Модель</th>
                                    <th>Кол-во</th>
                                    <th>Цена</th>
                                </tr>
                                </thead>
                                <tbody>
                                {order.items.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.product?.brand || "-"}</td>
                                        <td>{item.product?.model || "-"}</td>
                                        <td>{item.quantity}</td>
                                        <td>{item.price ? `${item.price} ₽` : "-"}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </Table>
                        </div>
                        <div className="d-flex flex-wrap gap-2">
                            {actions.main && (
                                <button
                                    className={`btn btn-${actions.main.variant} ${isLoading ? "disabled" : ""}`}
                                    onClick={() => handleStatusClick(actions.main.status)}
                                    disabled={isLoading}
                                >
                                    {isLoading && pendingStatus === actions.main.status ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Выполняется...
                                        </>
                                    ) : (
                                        actions.main.label
                                    )}
                                </button>
                            )}

                            {actions.cancel && (
                                <button
                                    className={`btn btn-${actions.cancel.variant} ${isLoading ? "disabled" : ""}`}
                                    onClick={() => handleStatusClick(actions.cancel.status)}
                                    disabled={isLoading}
                                >
                                    {actions.cancel.label}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {showConfirm && pendingStatus && (
                <ConfirmActionModal
                    show={showConfirm}
                    title="Подтвердите действие"
                    message={
                        isStorage
                            ? pendingStatus === StatusEnum.DRAFT
                                ? "Принять товар на хранение?"
                                : pendingStatus === StatusEnum.PROCESSED
                                    ? "Выдать товар клиенту? Это действие нельзя отменить."
                                    : "Отменить хранение? Товар будет снят с хранения."
                            : pendingStatus === StatusEnum.PROCESSED
                                ? "Обработать заказ? Товар будет списан со склада."
                                : "Отменить заказ?"
                    }
                    confirmText={
                        pendingStatus === StatusEnum.PROCESSED && isStorage
                            ? "Да, выдать"
                            : pendingStatus === StatusEnum.DRAFT && isStorage
                                ? "Принять на хранение"
                                : "Подтвердить"
                    }
                    onConfirm={confirmStatusChange}
                    onCancel={() => {
                        setShowConfirm(false);
                        setPendingStatus(null);
                    }}
                />
            )}
        </>
    );
};