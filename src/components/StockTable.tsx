import {Table, Button, Popover, OverlayTrigger, Form} from "react-bootstrap";
import {InventoryItem} from "../types";

type StockTableProps = {
    items: InventoryItem[];
    type: "tire" | "component";

    sortField: keyof InventoryItem | null;
    sortDirection: "asc" | "desc";
    filters: Partial<Record<keyof InventoryItem, string>>;
    onSortChange: (field: keyof InventoryItem, direction: "asc" | "desc") => void;
    onFilterChange: (field: keyof InventoryItem, value: string) => void;
};

export const StockTable: React.FC<StockTableProps> = ({
                                                          items,
                                                          type,
                                                          sortField,
                                                          sortDirection,
                                                          filters,
                                                          onSortChange,
                                                          onFilterChange,
                                                      }) => {

    const getFieldValue = (item: InventoryItem, field: keyof InventoryItem) => {

        if (item[field] !== undefined) return (item as any)[field];


        if (item.product && field in item.product) return (item.product as any)[field];


        if (item.tire && field in item.tire) return (item.tire as any)[field];


        if (item.component && field in item.component) return (item.component as any)[field];


        if (field === "address") return `${item.rack}-${item.shelf}-${item.cell}`;

        return "";
    };


    const selectFields: (keyof InventoryItem)[] = ["category", "spikes", "country"];

    const renderHeaderWithPopover = (field: keyof InventoryItem, label: string) => {
        const popover = (
            <Popover id={`popover-${field.toString()}`}>
                <Popover.Header as="h3">Сортировка и фильтры</Popover.Header>
                <Popover.Body>
                    <Form>
                        <Form.Group>
                            <Form.Check
                                id={`${field}-asc`}
                                type="checkbox"
                                label="По возрастанию"
                                checked={sortField === field && sortDirection === "asc"}
                                onChange={e => {
                                    const checked = e.currentTarget.checked;
                                    onSortChange(checked ? field : null as any, "asc");
                                }}
                            />

                            <Form.Check
                                id={`${field}-desc`}
                                type="checkbox"
                                label="По убыванию"
                                checked={sortField === field && sortDirection === "desc"}
                                onChange={e => {
                                    const checked = e.currentTarget.checked;
                                    onSortChange(checked ? field : null as any, "desc");
                                }}
                            />
                        </Form.Group>

                        <Form.Group className="mt-2">
                            <Form.Label>Фильтр</Form.Label>

                            {selectFields.includes(field) ? (
                                <Form.Select
                                    value={filters[field] ?? ""}
                                    onChange={e => onFilterChange(field, e.target.value)}
                                >
                                    <option value="">Все</option>
                                    {[...new Set(items.map(i => getFieldValue(i, field)))]
                                        .filter(Boolean)
                                        .map(opt => (
                                            <option key={opt}>{opt}</option>
                                        ))}
                                </Form.Select>
                            ) : (
                                <Form.Control
                                    type="text"
                                    value={filters[field] ?? ""}
                                    placeholder="Введите для фильтра"
                                    onChange={e => onFilterChange(field, e.target.value)}
                                />
                            )}
                        </Form.Group>

                    </Form>
                </Popover.Body>
            </Popover>
        );

        return (
            <OverlayTrigger trigger="click" placement="bottom" overlay={popover} rootClose>
                <Button variant="link" className="p-0">
                    {label} <span style={{fontSize: "0.8em"}}>⇅</span>
                </Button>
            </OverlayTrigger>
        );
    };

    const columns: Array<{ field: keyof InventoryItem; label: string }> =
        type === "tire"
            ? [
                {field: "brand", label: "Бренд"},
                {field: "model", label: "Модель"},
                {field: "width", label: "Ширина"},
                {field: "profile", label: "Профиль"},
                {field: "diameter", label: "Диаметр"},
                {field: "index", label: "Индекс"},
                {field: "spikes", label: "Шипы"},
                {field: "year", label: "Год"},
                {field: "country", label: "Страна"},
                {field: "address", label: "Адрес"},
                {field: "note", label: "Заметка"},
                {field: "season", label: "Сезон"},
                {field: "price", label: "Цена"},
                {field: "quantity", label: "Количество"},
            ]
            : [
                {field: "category", label: "Категория"},
                {field: "brand", label: "Бренд"},
                {field: "model", label: "Модель"},
                {field: "parameters", label: "Параметры"},
                {field: "compatibility", label: "Совместимость"},
                {field: "weight", label: "Вес"},
                {field: "material", label: "Материал"},
                {field: "color", label: "Цвет"},
                {field: "address", label: "Адрес"},
                {field: "note", label: "Заметка"},
                {field: "price", label: "Цена"},
                {field: "quantity", label: "Количество"},
            ];

    return (
        <Table striped bordered hover variant="dark">
            <thead>
            <tr>
                {columns.map(col => (
                    <th key={col.field}>{renderHeaderWithPopover(col.field, col.label)}</th>
                ))}
            </tr>
            </thead>
            <tbody>
            {items.map(item => (
                <tr key={item.id}>
                    {columns.map(col => (
                        <td key={col.field}>{getFieldValue(item, col.field) ?? ""}</td>
                    ))}
                </tr>
            ))}
            </tbody>
        </Table>
    );
};
