import React from "react";
import PropTypes from "prop-types";
import { TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const SearchBar = ({ 
    value, 
    onChange, 
    placeholder = "Buscar...", 
    className = "",
    fullWidth = true
}) => {
    return (
        <TextField
            fullWidth={fullWidth}
            size="small"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            autoComplete="off"
            className={className}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <SearchIcon className="text-slate-400" fontSize="small" />
                    </InputAdornment>
                ),
                className: "rounded-xl bg-white border-slate-200 text-sm shadow-sm",
            }}
            sx={{ 
                '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#e2e8f0' },
                    '&:hover fieldset': { borderColor: '#cbd5e1' },
                    '&.Mui-focused fieldset': { borderColor: '#6366f1' },
                }
            }}
        />
    );
};

SearchBar.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    className: PropTypes.string,
    fullWidth: PropTypes.bool,
};

export default SearchBar;



