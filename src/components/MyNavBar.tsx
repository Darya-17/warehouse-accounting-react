import {Container, Nav, Navbar} from "react-bootstrap";

export const MyNavBar = () => {
    return (
        <Navbar expand="lg" className="bg-body-tertiary">
            <Container>
                <Navbar.Brand href="#home">WheelStock</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link href="/stock">Склад</Nav.Link>
                        <Nav.Link href="/purchase">Закупка</Nav.Link>
                        <Nav.Link href="/orders">Заказы</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}