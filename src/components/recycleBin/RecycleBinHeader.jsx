import PropTypes from "prop-types";
import { Tabs, Tab, Box } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

const RecycleBinHeader = ({ activeTab, onTabChange, ordersCount, productsCount }) => {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-red-100 p-2">
                        <DeleteOutlineIcon className="text-red-600" sx={{ fontSize: 28 }} />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-slate-800">
                            Papelera de Reciclaje
                        </h1>
                        <p className="text-xs text-slate-500">
                            Elementos eliminados que pueden ser restaurados
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-slate-100 px-3 py-1.5">
                        <span className="text-xs font-medium text-slate-600">
                            <span className="font-semibold text-slate-800">
                                {ordersCount + productsCount}
                            </span>{" "}
                            elementos eliminados
                        </span>
                    </div>
                </div>
            </div>

            <Box sx={{ borderBottom: 1, borderColor: "divider", mt: 3 }}>
                <Tabs
                    value={activeTab}
                    onChange={(_, newValue) => onTabChange(newValue)}
                    aria-label="Papelera de reciclaje tabs"
                    sx={{
                        "& .MuiTab-root": {
                            textTransform: "none",
                            fontWeight: 600,
                            fontSize: "0.875rem",
                            minHeight: "40px",
                        },
                        "& .Mui-selected": {
                            color: "#dc2626",
                        },
                        "& .MuiTabs-indicator": {
                            backgroundColor: "#dc2626",
                        },
                    }}
                >
                    <Tab
                        label={
                            <span className="flex items-center gap-2">
                                Órdenes
                                {ordersCount > 0 && (
                                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                                        {ordersCount}
                                    </span>
                                )}
                            </span>
                        }
                        value="orders"
                    />
                    <Tab
                        label={
                            <span className="flex items-center gap-2">
                                Productos
                                {productsCount > 0 && (
                                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                                        {productsCount}
                                    </span>
                                )}
                            </span>
                        }
                        value="products"
                    />
                </Tabs>
            </Box>
        </div>
    );
};

RecycleBinHeader.propTypes = {
    activeTab: PropTypes.oneOf(["orders", "products"]).isRequired,
    onTabChange: PropTypes.func.isRequired,
    ordersCount: PropTypes.number,
    productsCount: PropTypes.number,
};

RecycleBinHeader.defaultProps = {
    ordersCount: 0,
    productsCount: 0,
};

export default RecycleBinHeader;

