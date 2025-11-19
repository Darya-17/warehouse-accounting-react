import Select, {type Props} from "react-select";

export const DarkSelect = <Option, IsMulti extends boolean = false>(
    props: Props<Option, IsMulti>
) => {
    return (
        <Select
            {...props}

            theme={(theme) => ({
                ...theme,
                colors: {
                    ...theme.colors,
                    primary: "#0d6efd",
                    primary25: "#2a2a2a",
                    neutral0: "#1e1e1e",
                    neutral5: "#2a2a2a",
                    neutral10: "#3a3a3a",
                    neutral20: "#555",
                    neutral30: "#666",
                    neutral40: "#aaa",
                    neutral50: "#aaa",
                    neutral80: "#f1f1f1",
                },
            })}
            styles={{
                control: (base) => ({
                    ...base,
                    backgroundColor: "#1e1e1e",
                    borderColor: "#444",
                    color: "#f1f1f1",
                }),
                singleValue: (base) => ({
                    ...base,
                    color: "#f1f1f1",
                }),
                input: (base) => ({
                    ...base,
                    color: "#f1f1f1",
                }),
                menu: (base) => ({
                    ...base,
                    backgroundColor: "#1e1e1e",
                    color: "#f1f1f1",
                }),
                option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isFocused ? "#2a2a2a" : "#1e1e1e",
                    color: "#f1f1f1",
                    cursor: "pointer",
                }),
            }}
        />
    );
};
