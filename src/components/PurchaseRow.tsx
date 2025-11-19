import {ChangeEvent} from "react";
import {Button, Form} from "react-bootstrap";
import type {PurchaseItem} from "../types";

type PurchaseRowProps = {
    row: PurchaseItem;
    updateRow: (id: number, data: Partial<PurchaseItem>) => void;
    deleteRow: (id: number) => void;
};

export const PurchaseRow = ({row, updateRow, deleteRow}: PurchaseRowProps) => {
    const handleChange = (field: keyof PurchaseItem) => (e: ChangeEvent<any>) => {
        const value =
            e.target.type === "checkbox" ? e.target.checked : e.target.value;
        updateRow(row.id, {[field]: value});
    };

    const isTire = row.type === "tire";
    const isComponent = row.type === "component";

    return (
        <tr>
            {isTire && (
                <>
                    <td><Form.Control value={row.brand} onChange={handleChange("brand")}/></td>
                    <td><Form.Control value={row.model} onChange={handleChange("model")}/></td>
                    <td><Form.Control value={row.width} onChange={handleChange("width")}/></td>
                    <td><Form.Control value={row.profile} onChange={handleChange("profile")}/></td>
                    <td><Form.Control value={row.diameter} onChange={handleChange("diameter")}/></td>
                    <td><Form.Control value={row.index} onChange={handleChange("index")}/></td>
                    <td><Form.Control value={row.spikes} onChange={handleChange("spikes")}/></td>
                    <td><Form.Control value={row.year} onChange={handleChange("year")}/></td>
                    <td><Form.Control value={row.country} onChange={handleChange("country")}/></td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td><Form.Control value={row.price} onChange={handleChange("price")}/></td>
                    <td><Form.Control value={row.quantity} onChange={handleChange("quantity")}/></td>
                </>
            )}

            {isComponent && (
                <>
                    <td><Form.Control value={row.brand} onChange={handleChange("brand")}/></td>
                    <td><Form.Control value={row.model} onChange={handleChange("model")}/></td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td><Form.Control value={row.category} onChange={handleChange("category")}/></td>
                    <td><Form.Control value={row.compatibility} onChange={handleChange("compatibility")}/></td>
                    <td><Form.Control value={row.weight} onChange={handleChange("weight")}/></td>
                    <td><Form.Control value={row.material} onChange={handleChange("material")}/></td>
                    <td><Form.Control value={row.price} onChange={handleChange("price")}/></td>
                    <td><Form.Control value={row.quantity} onChange={handleChange("quantity")}/></td>
                </>
            )}

            <td>
                <Button variant="danger" size="sm" onClick={() => deleteRow(row.id)}>
                    Удалить
                </Button>
            </td>
        </tr>
    );
};
