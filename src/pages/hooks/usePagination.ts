import { useState, useMemo, useEffect } from "react";


export function usePagination<T>(items: T[], defaultRowsPerPage = 5) {
    const [page, setPage]               = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);

    // Reset to page 0 whenever the source list changes
    useEffect(() => { setPage(0); }, [items.length]);

    const paginated = useMemo(() =>
            items.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
        [items, page, rowsPerPage]);

    return { paginated, page, setPage, rowsPerPage, setRowsPerPage, total: items.length };
}