import {Container} from "react-bootstrap";
import {Outlet} from "react-router-dom";


const MainLayout = () => {
    return (
        <Container fluid id="main-layout" className="px-0">
            <div
                id="main-layout-content">
                <Outlet/>
            </div>
        </Container>
    );
};

export default MainLayout;
