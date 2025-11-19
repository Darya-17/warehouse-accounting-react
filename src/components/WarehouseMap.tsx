import React, {CSSProperties, useState} from "react";
import {Col, Container, Row} from "react-bootstrap";

export interface WarehouseClickProps {
    type: "section" | "rack";
    name: string;
}

interface Props {
    onSelect?: (data: WarehouseClickProps) => void;
}

export const WarehouseMap: React.FC<Props> = ({onSelect}) => {

    const rackStyle: CSSProperties = {
        backgroundColor: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: "0.5rem",
        padding: "1rem",
        textAlign: "center",
        fontWeight: "500",
        cursor: "pointer",
        transition: "0.2s"
    };

    const rackHover: CSSProperties = {
        backgroundColor: "rgba(255,255,255,0.12)",
        transform: "scale(1.03)",
    };

    const containerStyle: CSSProperties = {
        borderWidth: "2px",
        borderRadius: "0.75rem",
        padding: "1rem",
        cursor: "pointer",
    };


    const HoverableRack = ({name, backgroundClass}: { name: string, backgroundClass: string }) => {
        const [hover, setHover] = useState<boolean>(false);
        return (
            <div
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                key={name}
                className={`card ${backgroundClass} p-4 text-center fw-bold user-select-none ${
                    selectedId === name ? "border-primary bg-dark text-primary" : "bg-dark text-light"
                }`}
                style={{
                    cursor: "pointer",
                    borderWidth: selectedId === name ? "3px" : "1px",
                    ...rackStyle, ...(hover ? rackHover : {})
                }}
                onClick={() => handleSelect({type: 'rack', name})}
            >
                {name}
            </div>
        );
    };


    const saveRacks = [{name: "Х1"}, {name: "Х2"}, {name: "Х3"}, {name: "Х4"}];
    const winterRacks = [{name: "З1"}, {name: "З2"}];
    const summerRacks = [{name: "Л1"}, {name: "Л2"}];
    const componentsRacks = [
        {name: "К1"}, {name: "К2"}, {name: "К3"},
        {name: "К4"}, {name: "К5"}, {name: "К6"}
    ];
    const [selectedId, setSelectedId] = useState<string | null>(null);


    const handleSelect = ({type, name}: WarehouseClickProps) => {
        setSelectedId(prev => (prev === name ? null : name));
        onSelect?.({type, name});
    };
    const ContainerHeader = ({name, title, backgroundClass}: {
        name: string,
        title: string,
        backgroundClass: string
    }) => {
        return (
            <div
                className={`mb-3 border-primary ${backgroundClass} ${selectedId === name ?
                    "border-primary" : "border-dark"}`}
                style={{
                    ...containerStyle,
                    opacity: 0.7,
                    border: "1px solid rgba(255,255,255,0.15)",
                }} onClick={() => handleSelect({type: 'section', name})}>
                <h3
                    className={`text-center ${selectedId === name ?
                        "border-primary text-dark" : "text-light"}`}
                    style={{cursor: "pointer"}}>
                    {title}
                </h3>
            </div>
        )
    }
    return (
        <Container fluid className="text-light mt-4">
            <Row className="g-4">
                <Col md={3}>
                    {ContainerHeader({name: "storage", title: 'Хранение', backgroundClass: 'bg-warning'})}
                    <div className={`mb-3 bg-warning border-primary ${selectedId === "storage" ?
                        "border-primary" : "border-dark"}`}
                         style={{
                             ...containerStyle,
                             opacity: 0.7,
                             border: "1px solid rgba(255,255,255,0.15)",
                         }}>
                        <div className="row g-2">
                            {saveRacks.map(x => (
                                <div key={x.name} className="col-6">
                                    <HoverableRack backgroundClass="bg-warning-subtle" name={x.name}/>
                                </div>
                            ))}
                        </div>
                    </div>
                </Col>
                <Col md={3}>
                    {ContainerHeader({name: "winter", title: 'Зима', backgroundClass: 'bg-primary'})}
                    <div className={`mb-3 bg-primary border-primary ${selectedId === "winter" ?
                        "border-primary" : "border-dark"}`}
                         style={{
                             ...containerStyle,
                             opacity: 0.7,
                             border: "1px solid rgba(255,255,255,0.15)",
                         }}>
                        <div className="row g-2">
                            {winterRacks.map(x => (
                                <div key={x.name} className="col-6">
                                    <HoverableRack backgroundClass="bg-primary-subtle" name={x.name}/>
                                </div>
                            ))}
                        </div>
                    </div>
                </Col>
                <Col md={3}>
                    {ContainerHeader({name: "summer", title: 'Лето', backgroundClass: 'bg-danger'})}
                    <div className={`mb-3 bg-danger border-primary ${selectedId === "summer" ?
                        "border-primary" : "border-dark"}`}
                         style={{
                             ...containerStyle,
                             opacity: 0.7,
                             border: "1px solid rgba(255,255,255,0.15)",
                         }}>
                        <div className="row g-2">
                            {summerRacks.map(x => (
                                <div key={x.name} className="col-6">
                                    <HoverableRack backgroundClass="bg-danger-subtle" name={x.name}/>
                                </div>
                            ))}
                        </div>
                    </div>
                </Col>
                <Col md={3}>
                    {ContainerHeader({name: "components", title: 'Комплектующие', backgroundClass: 'bg-success'})}
                    <div className={`mb-3 bg-success border-primary ${selectedId === "components" ?
                        "border-primary" : "border-dark"}`}
                         style={{
                             ...containerStyle,
                             opacity: 0.7,
                             border: "1px solid rgba(255,255,255,0.15)",
                         }}>
                        <div className="row g-2">
                            {componentsRacks.map(x => (
                                <div key={x.name} className="col-6">
                                    <HoverableRack backgroundClass=" bg-success-subtle" name={x.name}/>
                                </div>
                            ))}
                        </div>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};
