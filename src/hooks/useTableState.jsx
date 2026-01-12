import { useState, useCallback } from "react";

export const useTableState = ({ initialPageSize = 50 } = {}) => {
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: initialPageSize });
  const [rowSelectionModel, setRowSelectionModel] = useState([]); 
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSelectionModelChange = useCallback((newModel) => {
    setRowSelectionModel(newModel);
  }, []);

  const handleToggleRowSelection = useCallback((rowId) => {
    setRowSelectionModel((prev) => {
      const exists = prev.includes(rowId);
      if (exists) return prev.filter((id) => id !== rowId);
      return [...prev, rowId];
    });
  }, []);

  const handleToggleAllRows = useCallback((allIds) => {
    setRowSelectionModel((prev) => {
      const allSelected = allIds.length > 0 && allIds.every((id) => prev.includes(id));
      return allSelected ? [] : allIds;
    });
  }, []);

  const resetSelection = useCallback(() => {
    setRowSelectionModel([]);
  }, []);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
    resetSelection();
  }, [resetSelection]);

  const resetPagination = useCallback(() => {
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
    resetSelection();
  }, [resetSelection]);

  
  return {
    paginationModel,
    setPaginationModel,
    rowSelectionModel,
    setRowSelectionModel,
    refreshTrigger,
    handleToggleRowSelection,
    handleSelectionModelChange,
    handleToggleAllRows,
    resetSelection,
    triggerRefresh,
    resetPagination,
  };
};
