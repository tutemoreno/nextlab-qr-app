import { useState } from "react";

export function useFormInput(initialState) {
    const [value, setValue] = useState(initialState);

    function handleChange(e) {
        setValue(e.target.value);
    }

    return {
        value,
        setValue,
        onChange: handleChange,
    };
}

