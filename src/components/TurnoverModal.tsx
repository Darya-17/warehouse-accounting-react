import React, { useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";

interface TurnoverModalProps {
    show: boolean;
    onHide: () => void;
    items: any[];
    onGenerate: (start: string, end: string) => void;
}

export const TurnoverModal: React.FC<TurnoverModalProps> = ({
                                                                show,
                                                                onHide,
                                                                items,
                                                                onGenerate
                                                            }) => {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const handleGenerate = () => {
        if (!startDate || !endDate) {
            alert("Выберите обе даты!");
            return;
        }
        onGenerate(startDate, endDate);
    };

    return (
        <Modal show={show} onHide={onHide} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Отчет оборачиваемости</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Row>
                    <Col>
                        <Form.Label>Дата начала</Form.Label>
                        <Form.Control
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </Col>

                    <Col>
                        <Form.Label>Дата конца</Form.Label>
                        <Form.Control
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </Col>
                </Row>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Закрыть
                </Button>
                <Button variant="primary" onClick={handleGenerate}>
                    Сформировать
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
