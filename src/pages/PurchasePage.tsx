import {useState, useEffect, useMemo, useRef} from "react";
import {
    Button,
    Table,
    Form,
    Row,
    Col,
    Modal,
    Alert,
    InputGroup,
    FormControl,
    Badge,
} from "react-bootstrap";
import {PurchaseRow} from "../components/PurchaseRow.tsx";
import * as api from "../apiService.ts";
import type {PurchaseItem} from "../types";
import * as XLSX from "xlsx";


const ConfirmSaveModal: React.FC<{
    show: boolean;
    date: string;
    count: number;
    onConfirm: () => void;
    onCancel: () => void;
}> = ({show, date, count, onConfirm, onCancel}) => (
    <>
        <Modal show={show} onHide={onCancel} centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Подтвердите сохранение закупки</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p className="mb-0">
                    Сохранить закупку ({count} позиций)?
                </p>
                <p className="text-muted mt-3 mb-0">
                    Товары будут добавлены на склад с автоматическим подбором адресов.
                </p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onCancel}>Отмена</Button>
                <Button variant="success" onClick={onConfirm}>Сохранить закупку</Button>
            </Modal.Footer>
        </Modal>
    </>
);

export const PurchasePage = () => {
    const [rows, setRows] = useState<PurchaseItem[]>([]);
    const [section, setSection] = useState<string>("winter");
    const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
    const [existingProducts, setExistingProducts] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [alert, setAlert] = useState<{ type: "success" | "danger"; message: string } | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);


    const nextIdRef = useRef(1);
    const fetch = async () => {
        try {
            const res = await api.getAllProducts();
            setExistingProducts(res.data || []);
        } catch (err) {
            setAlert({type: "danger", message: "Не удалось загрузить товары"});
        }
    };

    useEffect(() => {

        fetch();
    }, []);


    const filteredProducts = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const q = searchQuery.toLowerCase();
        return existingProducts.filter((p: any) =>
            `${p.brand || ""} ${p.model || ""}`.toLowerCase().includes(q)
        );
    }, [searchQuery, existingProducts]);


    const addEmptyRow = () => {
        setRows((prev) => [
            ...prev,
            {
                id: nextIdRef.current++,
                type: section == 'components' ? 'component' : 'tire',
                brand: "",
                model: "",
                width: "",
                profile: "",
                diameter: "",
                index: "",
                spikes: "",
                season: section != 'components' ? section : undefined,
                year: new Date().getFullYear(),
                country: "",
                category: "",
                parameters: "",
                compatibility: "",
                weight: 0,
                material: "",
                color: "",
                price: 0,
                quantity: 1,
                note: "",
            },
        ]);
    };


    const addExistingProduct = (product: any) => {
        const isTire = !!product.tire;
        setRows((prev) => [
            ...prev,
            {
                id: (product.component && product.component.id) | (product.tire && product.tire.id),
                type: isTire ? "tire" : "component",
                existingProductId: product.id,
                brand: product.brand || "",
                model: product.model || "",
                width: product.tire?.width || "",
                profile: product.tire?.profile || "",
                diameter: product.tire?.diameter || "",
                index: product.tire?.index || "",
                spikes: product.tire?.spikes || "",
                year: product.tire?.year || new Date().getFullYear(),
                country: product.tire?.country || "",
                category: product.component?.category || "",
                parameters: product.component?.parameters || "",
                compatibility: product.component?.compatibility || "",
                weight: product.component?.weight || 0,
                material: product.component?.material || "",
                color: product.component?.color || "",
                price: product.price || 0,
                quantity: product.warehouse_qty,
                note: product.note || "",
                location: product.location,
                warehouse_id: product.warehouse_id,
                storage_id: product.storage_id
            },
        ]);
        setSearchQuery("");
        setShowSearchResults(false);
    };

    const updateRow = (id: number, data: Partial<PurchaseItem>) => {
        setRows((prev) => prev.map((r) => (r.id === id ? {...r, ...data} : r)));
    };

    const deleteRow = (id: number) => {
        setRows((prev) => prev.filter((r) => r.id !== id));
    };


    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const newRows: PurchaseItem[] = [];
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data, {type: "array"});
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const json = XLSX.utils.sheet_to_json<any>(sheet, {header: 1, defval: ""});

            if (json.length < 2) {
                setAlert({type: "danger", message: "Файл пустой"});
                return;
            }

            const headers = json[0].map((h: any) => (h + "").trim().toLowerCase());

            const getColIndex = (names: string[]) => {
                for (const name of names) {
                    const idx = headers.findIndex((h) =>
                        h.includes(name.toLowerCase()) || name.toLowerCase().includes(h)
                    );
                    if (idx !== -1) return idx;
                }
                return -1;
            };

            const get = (row: any[], names: string[]) => {
                const idx = getColIndex(names);
                return idx !== -1 ? (row[idx] + "").trim() : "";
            };

            const getNum = (row: any[], names: string[]) => {
                const val = get(row, names);
                const num = parseFloat(val.replace(/[^0-9.,]/g, "").replace(",", "."));
                return isNaN(num) ? undefined : num;
            };

            for (let i = 1; i < json.length; i++) {
                const row = json[i];
                if (!row || row.length === 0) continue;

                const quantity = getNum(row, ["количество", "кол-во", "qty", "шт", "quantity"]) || 1;
                if (quantity <= 0) continue;

                const price = getNum(row, ["цена", "price", "стоимость"]);

                const width = get(row, ["ширина", "width"]);
                const diameter = get(row, ["диаметр", "diameter", "r"]);
                const profile = get(row, ["профиль", "profile"]);
                const season = get(row, ["сезон", "Сезон", "season"]);

                const isTire = width || diameter || profile;

                if (isTire) {
                    newRows.push({
                        id: nextIdRef.current++,
                        type: "tire",
                        brand: get(row, ["бренд", "brand"]),
                        model: get(row, ["модель", "model"]),
                        width,
                        profile,
                        diameter,
                        index: get(row, ["индекс", "index"]),
                        spikes: get(row, ["шипы", "spikes", "шип"]),
                        year: parseInt(get(row, ["год", "year"])) || new Date().getFullYear(),
                        country: get(row, ["страна", "country"]),
                        price: price || 0,
                        quantity,
                        season: ['зимняя','winter'].includes(season) ? 'winter': 'summer',
                        note: get(row, ["заметка", "note"]),
                        category: "", parameters: "", compatibility: "", weight: 0, material: "", color: "",

                    });
                } else {
                    newRows.push({
                        id: nextIdRef.current++,
                        type: "component",
                        category: get(row, ["категория", "тип"]),
                        brand: get(row, ["бренд", "brand"]),
                        model: get(row, ["модель", "model"]),
                        parameters: get(row, ["параметры", "parameters"]),
                        compatibility: get(row, ["совместимость", "compatibility"]),
                        weight: getNum(row, ["вес", "weight"]) || 0,
                        material: get(row, ["материал", "material"]),
                        color: get(row, ["цвет", "color"]),
                        price: price || 0,
                        quantity,
                        note: get(row, ["заметка", "note"]),
                        width: "",
                        profile: "",
                        diameter: "",
                        index: "",
                        spikes: "",
                        year: new Date().getFullYear(),
                        country: "",
                    });
                }
            }

            setRows((prev) => [...prev, ...newRows]);
            setAlert({type: "success", message: `Загружено ${newRows.length} позиций из файла`});
            e.target.value = "";
        } catch (err) {
            setAlert({type: "danger", message: "Ошибка чтения файла"});
        }
    };

    const handleSave = () => {
        if (rows.length === 0) return;
        setShowConfirmModal(true);
    };

    const confirmSave = async () => {
        setShowConfirmModal(false);
        try {
            for (const row of rows) {
                let productId: number;
                if (row.existingProductId) {
                    productId = row.existingProductId;
                    if (row.type == "tire") {
                        await api.updateTire(row.id, row);
                    } else {
                        await api.updateComponent(row.id, row);
                    }
                    if (row.location === 'склад, хранение' || row.location === 'склад')
                        await api.updateWarehouseItem(row.warehouse_id, row);
                    else
                        await api.addProductToWarehouse(productId, row.quantity);

                } else {
                    const prodRes = await api.createProduct({
                        brand: row.brand,
                        model: row.model,
                        price: row.price,
                        note: row.note,
                    });
                    productId = prodRes.data.id;
                    if (row.type === "tire") {
                        await api.createTire({
                            product_id: productId,
                            width: row.width || null,
                            profile: row.profile || null,
                            diameter: row.diameter || null,
                            index: row.index || null,
                            spikes: row.spikes || null,
                            year: row.year,
                            season: row.season,
                            country: row.country || null,
                        });
                    } else {
                        await api.createComponent({
                            product_id: productId,
                            category: row.category || undefined,
                            parameters: row.parameters || "",
                            compatibility: row.compatibility || "",
                            weight: row.weight,
                            material: row.material || "",
                            color: row.color || null,
                        });
                    }
                    await api.addProductToWarehouse(productId, row.quantity);
                }
            }
            setAlert({type: "success", message: `Закупка успешно сохранена (${rows.length})`});
            setRows([]);
            fetch();
        } catch (err: any) {
            const msg = err.response?.data?.detail[0].msg == 'Field required' ? 'Отсутсвуют необходимые поля' : err.response?.data?.detail[0].msg;
            setAlert({
                type: "danger",
                message: msg || "Ошибка при сохранении",
            });
        }
    };

    return (
        <div className="p-4">
            <h2 className="mb-3">Закупка товаров</h2>

            {alert && (
                <Alert variant={alert.type} onClose={() => setAlert(null)} dismissible className="mb-4">
                    {alert.message}
                </Alert>
            )}

            <Row className="g-3 mb-4 align-items-end">
                <Col md={4}>
                    <Form.Label>Поиск товара</Form.Label>
                    <InputGroup>
                        <FormControl
                            placeholder="Бренд или модель..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setShowSearchResults(!!e.target.value.length > 0);
                            }}
                        />
                        {searchQuery && (
                            <Button variant="outline-secondary" onClick={() => {
                                setSearchQuery("");
                                setShowSearchResults(false);
                            }}>
                                ×
                            </Button>
                        )}
                    </InputGroup>

                    {showSearchResults && filteredProducts.length > 0 && (
                        <div className="border bg-white rounded shadow mt-1" style={{
                            maxHeight: "300px",
                            overflowY: "auto",
                            position: "absolute",
                            zIndex: 1000,
                            width: "32%"
                        }}>
                            {filteredProducts.map((p) => (
                                <div key={p.id} className="p-2 border-bottom cursor-pointer hover-bg-light bg-dark"
                                     onClick={() => addExistingProduct(p)}>
                                    <strong>{p.brand} {p.model}</strong>
                                    {p.tire && <Badge bg="info"
                                                      className="ms-2">{p.tire.width}/{p.tire.profile} R{p.tire.diameter}</Badge>}
                                    {p.component &&
                                        <Badge bg="secondary" className="ms-2">{p.component.category}</Badge>}
                                    <small className="text-muted d-block">ID: {p.id} • {p.price || "?"} ₽</small>
                                </div>
                            ))}
                        </div>
                    )}
                </Col>

                <Col md={3}>
                    <Form.Label>Секция</Form.Label>
                    <Form.Select value={section} onChange={(e) => setSection(e.target.value)}>
                        <option value="winter">Зимние шины</option>
                        <option value="summer">Летние шины</option>
                        <option value="components">Комплектующие</option>
                    </Form.Select>
                </Col>

                <Col md={2}>
                    <Form.Label>Дата закупки</Form.Label>
                    <Form.Control type="date" value={date} onChange={(e) => setDate(e.target.value)}/>
                </Col>

                <Col md={3}>
                    <Form.Label>Загрузить накладную</Form.Label>
                    <Form.Control type="file" accept=".xlsx,.xls,.csv,.txt" onChange={handleFileUpload}/>
                </Col>

                <Col md={3}>
                    <Button variant="primary" onClick={addEmptyRow} className="w-100 mt-4">
                        + Вручную
                    </Button>
                </Col>
            </Row>

            <Table striped bordered hover responsive className="table-dark">
                <thead className="text-light">
                <tr>
                    <th>Тип</th>
                    <th>Бренд</th>
                    <th>Модель</th>
                    <th>Ширина</th>
                    <th>Профиль</th>
                    <th>Диаметр</th>
                    <th>Индекс</th>
                    <th>Шипы</th>
                    <th>Год</th>
                    <th>Страна</th>
                    <th>Категория</th>
                    <th>Совместимость</th>
                    <th>Вес</th>
                    <th>Материал</th>
                    <th>Цвет</th>
                    <th>Цена</th>
                    <th>Кол-во</th>
                    <th>Заметка</th>
                    <th>Действия</th>
                </tr>
                </thead>
                <tbody>
                {rows.length === 0 ? (
                    <tr>
                        <td colSpan={19} className="text-center text-muted py-5">
                            Начните с поиска или загрузите файл
                        </td>
                    </tr>
                ) : (
                    rows.map((row) => (
                        <PurchaseRow
                            key={row.id}
                            row={row}
                            updateRow={updateRow}
                            deleteRow={deleteRow}
                            allowTypeChange={true}
                        />
                    ))
                )}
                </tbody>
            </Table>

            {rows.length > 0 && (
                <div className="mt-4 text-end">
                    <Button variant="success" size="lg" onClick={handleSave}>
                        Сохранить закупку ({rows.length})
                    </Button>
                </div>
            )}

            <ConfirmSaveModal
                show={showConfirmModal}
                date={date}
                count={rows.length}
                onConfirm={confirmSave}
                onCancel={() => setShowConfirmModal(false)}
            />
        </div>
    );
};