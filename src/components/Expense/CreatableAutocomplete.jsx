import { Autocomplete, createFilterOptions, TextField } from "@mui/material";
import { useState } from "react";


const filter = createFilterOptions();

export default function CreateableAutocomplete({ options, disabled, defaultValue, onChange }) {
    const [value, setValue] = useState(defaultValue);

    return (
        <Autocomplete
            disabled={disabled}
            fullWidth
            value={value}
            sx={{ width: "100%", marginBottom: 1 }}
            onChange={(event, newValue) => {
                setValue(newValue);
                onChange(newValue)
            }}
            filterOptions={(options, params) => {
                const filtered = filter(options, params)

                const { inputValue } = params;
                // Suggest the creation of a new value
                const isExisting = options.some((option) => inputValue === option);
                if (inputValue !== '' && !isExisting) {
                    filtered.push(inputValue);
                }

                return filtered;
            }}
            selectOnFocus
            clearOnBlur
            handleHomeEndKeys
            options={options}
            getOptionLabel={(option) => option}
            renderOption={(props, option) => {
                const { key, ...optionProps } = props;
                return (
                    <li key={key} {...optionProps}>
                        {option}
                    </li>
                );
            }}
            freeSolo
            resetHighlightOnMouseLeave
            renderInput={(params) => (
                <TextField {...params} label="Category" />
            )}
        />
    );
}