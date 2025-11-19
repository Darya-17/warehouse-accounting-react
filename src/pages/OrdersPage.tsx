import { useEffect, useState } from "react";
import {changeOrderStatus, getOrders} from "../apiService.ts";
import {Order, StatusEnum} from "../types.ts";
import {OrderCard} from "../components/OrderCard.tsx";
import {OrderModal} from "../components/OrderModal.tsx";


export const OrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [editingOrderId, setEditingOrderId] = useState<number | null>(null);
    const [creatingService, setCreatingService] = useState<"продажа" | "хранение">("продажа");
    const [search, setSearch] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState<StatusEnum | "">("");

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await getOrders();
            setOrders(res.data);
        } catch (err: any) {
            setError("Ошибка при загрузке заказов");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleStatusChange = async (orderId: number, status: StatusEnum) => {
        try {
            await changeOrderStatus(orderId, status);
            fetchOrders();
        } catch (err: any) {
            setError(err.response?.data?.detail || "Ошибка при смене статуса");
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            !search ||
            order.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
            order.items.some(i =>
                i.product?.brand.toLowerCase().includes(search.toLowerCase()) ||
                i.product?.model.toLowerCase().includes(search.toLowerCase())
            );
        const matchesStatus = !statusFilter || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const openModal = (type: "продажа" | "хранение", id?: number) => {
        setCreatingService(type);
        setEditingOrderId(id ?? null);
        setModalOpen(true);
    };

    return (
        <div className="container my-4">
            <h2 className="mb-4">Заказы и хранение</h2>

            <div className="d-flex mb-3 gap-2">
                <button className="btn btn-primary" onClick={() => openModal("продажа")}>
                    Создать заказ
                </button>
                <button className="btn btn-warning" onClick={() => openModal("хранение")}>
                    Создать хранение
                </button>

                <input
                    type="text"
                    className="form-control w-auto"
                    placeholder="Поиск"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />

                <select
                    className="form-select w-auto"
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value as StatusEnum | "")}
                >
                    <option value="">Все статусы</option>
                    <option value={StatusEnum.DRAFT}>Черновик</option>
                    <option value={StatusEnum.PROCESSED}>Обработан</option>
                    <option value={StatusEnum.CANCELLED}>Отменен</option>
                </select>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {loading ? (
                <div className="text-center my-5">Загрузка...</div>
            ) : filteredOrders.length === 0 ? (
                <div className="text-center my-5">Нет заказов</div>
            ) : (
                <div className="accordion" id="ordersAccordion">
                    {filteredOrders.map(order => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            onStatusChange={handleStatusChange}
                            onEdit={id => openModal(order.service, id)}
                        />
                    ))}
                </div>
            )}

            {modalOpen && (
                <OrderModal

                    orderId={editingOrderId ?? undefined}
                    service={creatingService}
                    onClose={() => setModalOpen(false)}
                    onSaved={() => { setModalOpen(false); fetchOrders(); }}
                />
            )}
        </div>
    );
};
