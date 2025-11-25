
import React, {useCallback, useState} from "react";
import {Modal, Button} from "react-bootstrap";

interface ConfirmSaveModalProps {
    show: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmSaveModal: React.FC<ConfirmSaveModalProps> = ({

                                                                      show,
                                                                      onConfirm,
                                                                      onCancel,
                                                                  }) => {
    return (
        <Modal show={show} onHide={onCancel} centered>
            <Modal.Header closeButton>
                <Modal.Title>Несохранённые изменения</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>У вас есть несохранённые изменения. Сохранить их?</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onCancel}>
                    Не сохранять
                </Button>
                <Button variant="primary" onClick={onConfirm}>
                    Сохранить
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
export const useUnsavedChanges = <T,>(initialData: T) => {
    const [data, setData] = useState<T>(initialData);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const updateData = useCallback((newData: Partial<T>) => {
        setData(prev => {
            const updated = { ...prev, ...newData };
            const changed = JSON.stringify(updated) !== JSON.stringify(initialData);
            setHasUnsavedChanges(changed);
            return updated;
        });
    }, [initialData]);

    const resetChanges = useCallback(() => {
        setData(initialData);
        setHasUnsavedChanges(false);
    }, [initialData]);

    return {
        data,
        updateData,
        hasUnsavedChanges,
        resetChanges,
    };
};