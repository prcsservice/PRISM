import { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface Column<T> {
    header: string;
    accessorKey: keyof T;
    cell?: (item: T) => ReactNode;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    onRowClick?: (item: T) => void;
    rowHref?: (item: T) => string;
    emptyMessage?: string;
}

export default function DataTable<T>({
    data,
    columns,
    onRowClick,
    rowHref,
    emptyMessage = "No data available.",
}: DataTableProps<T>) {
    if (data.length === 0) {
        return (
            <div className="w-full flex items-center justify-center p-12 border border-border-primary rounded-xl bg-bg-secondary">
                <span className="text-text-muted">{emptyMessage}</span>
            </div>
        );
    }

    return (
        <div className="w-full overflow-x-auto border border-border-primary rounded-xl bg-bg-secondary">
            <table className="w-full text-left text-sm text-text-secondary">
                <thead className="text-xs uppercase bg-bg-hover text-text-muted">
                    <tr>
                        {columns.map((col, i) => (
                            <th key={i} scope="col" className="px-3 py-3 md:px-6 md:py-4 font-semibold">
                                {col.header}
                            </th>
                        ))}
                        {(onRowClick || rowHref) && (
                            <th scope="col" className="px-3 py-3 md:px-6 md:py-4">
                                <span className="sr-only">Actions</span>
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, rowIndex) => {
                        const isClickable = !!onRowClick || !!rowHref;

                        const tr = (
                            <tr
                                key={rowIndex}
                                className={`border-b border-border-primary transition-colors ${isClickable ? 'cursor-pointer hover:bg-bg-hover' : ''}`}
                                onClick={() => onRowClick && onRowClick(item)}
                            >
                                {columns.map((col, colIndex) => (
                                    <td key={colIndex} className="px-3 py-3 md:px-6 md:py-4 whitespace-nowrap">
                                        {col.cell ? col.cell(item) : String(item[col.accessorKey])}
                                    </td>
                                ))}

                                {isClickable && (
                                    <td className="px-3 py-3 md:px-6 md:py-4 whitespace-nowrap text-right">
                                        <div className="text-text-secondary group-hover:text-text-primary transition-colors flex justify-end">
                                            <ChevronRight size={18} />
                                        </div>
                                    </td>
                                )}
                            </tr>
                        );

                        if (rowHref) {
                            return (
                                <tr key={rowIndex} className="group hover:bg-bg-hover transition-colors border-b border-border-primary">
                                    <td colSpan={columns.length + 1} className="p-0">
                                        <Link href={rowHref(item)} className="flex w-full items-center">
                                            <div className="flex w-full items-center">
                                                {columns.map((col, colIndex) => (
                                                    <div key={colIndex} className="px-3 py-3 md:px-6 md:py-4 whitespace-nowrap flex-1">
                                                        {col.cell ? col.cell(item) : String(item[col.accessorKey])}
                                                    </div>
                                                ))}
                                                <div className="px-3 py-3 md:px-6 md:py-4 whitespace-nowrap text-right text-text-secondary group-hover:text-text-primary transition-colors">
                                                    <ChevronRight size={18} />
                                                </div>
                                            </div>
                                        </Link>
                                    </td>
                                </tr>
                            );
                        }

                        return tr;
                    })}
                </tbody>
            </table>
        </div>
    );
}
