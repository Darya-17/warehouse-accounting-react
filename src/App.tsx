import './App.css'
import 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import {Outlet} from "react-router-dom";
import {MyNavBar} from "./components/MyNavBar.tsx";
import {usePageTitle} from "./utils.ts";
import {routes} from "./Routes.tsx";
const PageTitleListener = () => {
    usePageTitle(routes);
    return null;
}
function App() {
    return (
        <>
            <PageTitleListener/>
            <MyNavBar/>
            <Outlet/>
        </>
    )
}

export default App
