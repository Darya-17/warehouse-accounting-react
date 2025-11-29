import {ChangeEvent} from "react";
import {Button, Form, Badge} from "react-bootstrap";
import type {PurchaseItem} from "../types";

type PurchaseRowProps = {
    row: PurchaseItem;
    updateRow: (id: number, data: Partial<PurchaseItem>) => void;
    deleteRow: (id: number) => void;
    season: 'winter' | 'summer';
};


const getSeasonLabel = (
    season: 'winter' | 'summer'
) => {
    return season === 'winter' ? 'Зимние' : 'Летние';
}
const dash = <span className="text-muted">—</span>;

export const PurchaseRow = ({row, updateRow, deleteRow}: PurchaseRowProps) => {
    const handleChange = (field: keyof PurchaseItem) => (e: ChangeEvent<any>) => {
        let value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
        if (e.target.type === "number") {
            value = Number(value);
        }
        updateRow(row.id, {[field]: value});
    };

    const isTire = row.type === "tire";

    return (
        <tr>
            <td>
                <Badge
                    bg={isTire ? "info" : "secondary"}>{isTire ? `${getSeasonLabel(row.season)} шины` : "Комплект"}</Badge>
            </td>

            <td><Form.Control value={row.brand} onChange={handleChange("brand")}/></td>
            <td><Form.Control value={row.model} onChange={handleChange("model")}/></td>


            <td>{isTire ? <Form.Control value={row.width} onChange={handleChange("width")}/> : dash}</td>
            <td>{isTire ? <Form.Control value={row.profile} onChange={handleChange("profile")}/> : dash}</td>
            <td>{isTire ? <Form.Control value={row.diameter} onChange={handleChange("diameter")}/> : dash}</td>
            <td>{isTire ? <Form.Control value={row.index} onChange={handleChange("index")}/> : dash}</td>
            <td>{isTire ? <Form.Control value={row.spikes} onChange={handleChange("spikes")}/> : dash}</td>
            <td>{isTire ? <Form.Control type="number" value={row.year} onChange={handleChange("year")}/> : dash}</td>
            <td>{isTire ? <Form.Control value={row.country} onChange={handleChange("country")}/> : dash}</td>


            <td>{!isTire ? <Form.Control value={row.category} onChange={handleChange("category")}/> : dash}</td>
            <td>{!isTire ?
                <Form.Control value={row.compatibility} onChange={handleChange("compatibility")}/> : dash}</td>
            <td>{!isTire ?
                <Form.Control type="number" value={row.weight} onChange={handleChange("weight")}/> : dash}</td>
            <td>{!isTire ? <Form.Control value={row.material} onChange={handleChange("material")}/> : dash}</td>
            <td>{!isTire ? <Form.Control value={row.color} onChange={handleChange("color")}/> : dash}</td>

            <td><Form.Control type="number" min={0} value={row.price} onChange={handleChange("price")} placeholder="0"/>
            </td>
            <td><Form.Control type="number" min={1} value={row.quantity} onChange={handleChange("quantity")}/></td>
            <td><Form.Control value={row.note} onChange={handleChange("note")} placeholder="Заметка"/></td>

            <td>
                <Button variant="danger" size="sm" onClick={() => deleteRow(row.id)}>
                    Удалить
                </Button>
            </td>
        </tr>
    );
};