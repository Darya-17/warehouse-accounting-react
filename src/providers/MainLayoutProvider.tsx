import {createContext, type PropsWithChildren} from "react";

type MainLayoutContextType = object
const MainLayoutContext = createContext(
    {} as MainLayoutContextType
);
const MainLayoutProvider = ({ children }: PropsWithChildren) => {

    return (
        <MainLayoutContext.Provider value={{}}
        >
            {children}
        </MainLayoutContext.Provider>
    );
};
export default MainLayoutProvider;
