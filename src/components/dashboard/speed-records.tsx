"use client";

import React, {useState, useMemo, useRef, useCallback} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {SpeedData, Lane} from "@/types/speed-data";
import {format} from "date-fns";
import {Trophy, ArrowUpDown, ArrowUp, ArrowDown, Search, X, GripVertical} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface SpeedRecordsProps {
    data: SpeedData[];
}

type SortConfig = {
    key: keyof SpeedData | null;
    direction: "asc" | "desc";
};

type ColumnFilters = {
    id: string;
    sensor_name: string;
    speed: string;
    lane: string;
    created_at: string;
};

type ColumnWidths = {
    id: number;
    sensor_name: number;
    speed: number;
    lane: number;
    created_at: number;
};

export function SpeedRecords({data}: SpeedRecordsProps) {
    const [sortConfig, setSortConfig] = useState<SortConfig>({key: null, direction: "asc"});
    const [filters, setFilters] = useState<ColumnFilters>({
        id: "",
        sensor_name: "",
        speed: "",
        lane: "",
        created_at: "",
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);

    // Column widths state
    const [columnWidths, setColumnWidths] = useState<ColumnWidths>({
        id: 40,
        sensor_name: 200,
        speed: 120,
        lane: 100,
        created_at: 180,
    });

    // Resizing state
    const [isResizing, setIsResizing] = useState(false);
    const [resizingColumn, setResizingColumn] = useState<keyof ColumnWidths | null>(null);
    const startXRef = useRef<number>(0);
    const startWidthRef = useRef<number>(0);

    // Handle column resize
    const handleResizeStart = useCallback((e: React.MouseEvent, column: keyof ColumnWidths) => {
        e.preventDefault();
        e.stopPropagation();
        setIsResizing(true);
        setResizingColumn(column);
        startXRef.current = e.clientX;
        startWidthRef.current = columnWidths[column];
    }, [columnWidths]);

    const handleResizeMove = useCallback((e: MouseEvent) => {
        if (!isResizing || !resizingColumn) return;

        const diff = e.clientX - startXRef.current;
        const newWidth = Math.max(50, startWidthRef.current + diff); // Min width of 50px

        setColumnWidths((prev) => ({
            ...prev,
            [resizingColumn]: newWidth,
        }));
    }, [isResizing, resizingColumn]);

    const handleResizeEnd = useCallback(() => {
        setIsResizing(false);
        setResizingColumn(null);
    }, []);

    // Add event listeners for resize
    React.useEffect(() => {
        if (isResizing) {
            document.addEventListener("mousemove", handleResizeMove);
            document.addEventListener("mouseup", handleResizeEnd);
            return () => {
                document.removeEventListener("mousemove", handleResizeMove);
                document.removeEventListener("mouseup", handleResizeEnd);
            };
        }
    }, [isResizing, handleResizeMove, handleResizeEnd]);

    // Handle sort
    const handleSort = (key: keyof SpeedData) => {
        setSortConfig((current) => ({
            key,
            direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
        }));
    };

    // Handle filter change
    const handleFilterChange = (column: keyof ColumnFilters, value: string) => {
        setFilters((prev) => ({...prev, [column]: value}));
        setCurrentPage(1); // Reset to first page when filtering
    };

    // Clear all filters
    const clearFilters = () => {
        setFilters({
            id: "",
            sensor_name: "",
            speed: "",
            lane: "",
            created_at: "",
        });
        setCurrentPage(1);
    };

    // Filter and sort data
    const filteredAndSortedData = useMemo(() => {
        let filtered = [...data];

        // Apply filters
        if (filters.id) {
            filtered = filtered.filter((item) =>
                item.id.toString().includes(filters.id)
            );
        }
        if (filters.sensor_name) {
            filtered = filtered.filter((item) =>
                (item.sensor_name || "").toLowerCase().includes(filters.sensor_name.toLowerCase())
            );
        }
        if (filters.speed) {
            filtered = filtered.filter((item) =>
                item.speed.toString().includes(filters.speed)
            );
        }
        if (filters.lane) {
            filtered = filtered.filter((item) =>
                item.lane.toLowerCase().includes(filters.lane.toLowerCase())
            );
        }
        if (filters.created_at) {
            filtered = filtered.filter((item) =>
                format(new Date(item.created_at), "dd/MM/yyyy HH:mm:ss")
                    .toLowerCase()
                    .includes(filters.created_at.toLowerCase())
            );
        }

        // Apply sort
        if (sortConfig.key) {
            filtered.sort((a, b) => {
                const aValue = a[sortConfig.key!];
                const bValue = b[sortConfig.key!];

                if (aValue === null || aValue === undefined) return 1;
                if (bValue === null || bValue === undefined) return -1;

                let comparison = 0;
                if (typeof aValue === "string" && typeof bValue === "string") {
                    comparison = aValue.localeCompare(bValue);
                } else if (typeof aValue === "number" && typeof bValue === "number") {
                    comparison = aValue - bValue;
                } else {
                    comparison = String(aValue).localeCompare(String(bValue));
                }

                return sortConfig.direction === "asc" ? comparison : -comparison;
            });
        }

        return filtered;
    }, [data, filters, sortConfig]);

    // Pagination
    const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
    const paginatedData = filteredAndSortedData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Check if any filter is active
    const hasActiveFilters = Object.values(filters).some((filter) => filter !== "");

    // Render sort icon
    const renderSortIcon = (column: keyof SpeedData) => {
        if (sortConfig.key !== column) {
            return <ArrowUpDown className="h-4 w-4"/>;
        }
        return sortConfig.direction === "asc" ? (
            <ArrowUp className="h-4 w-4"/>
        ) : (
            <ArrowDown className="h-4 w-4"/>
        );
    };

    // Don't render if no data available
    if (data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-500"/>
                        Enregistrements de vitesse
                    </CardTitle>
                    <CardDescription>Tableau complet des vitesses enregistrées</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-[300px] text-muted-foreground">
                    Aucune donnée disponible
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-yellow-500"/>
                            Enregistrements de vitesse
                        </CardTitle>
                        <CardDescription>
                            {filteredAndSortedData.length} enregistrement{filteredAndSortedData.length > 1 ? "s" : ""} trouvé{filteredAndSortedData.length > 1 ? "s" : ""}
                        </CardDescription>
                    </div>
                    {hasActiveFilters && (
                        <Button variant="outline" size="sm" onClick={clearFilters}>
                            <X className="h-4 w-4 mr-2"/>
                            Effacer les filtres
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead style={{width: `${columnWidths.id}px`}} className="relative">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-full justify-start"
                                        onClick={() => handleSort("id")}
                                    >
                                        ID
                                        {renderSortIcon("id")}
                                    </Button>
                                    <div
                                        className="absolute right-0 top-0 h-full w-2 cursor-col-resize hover:bg-primary/50 active:bg-primary flex items-center justify-center group"
                                        onMouseDown={(e) => handleResizeStart(e, "id")}
                                    >
                                        <GripVertical
                                            className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"/>
                                    </div>
                                </TableHead>
                                <TableHead style={{width: `${columnWidths.sensor_name}px`}} className="relative">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-full justify-start"
                                        onClick={() => handleSort("sensor_name")}
                                    >
                                        Capteur
                                        {renderSortIcon("sensor_name")}
                                    </Button>
                                    <div
                                        className="absolute right-0 top-0 h-full w-2 cursor-col-resize hover:bg-primary/50 active:bg-primary flex items-center justify-center group"
                                        onMouseDown={(e) => handleResizeStart(e, "sensor_name")}
                                    >
                                        <GripVertical
                                            className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"/>
                                    </div>
                                </TableHead>
                                <TableHead style={{width: `${columnWidths.speed}px`}} className="relative">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-full justify-start"
                                        onClick={() => handleSort("speed")}
                                    >
                                        Vitesse
                                        {renderSortIcon("speed")}
                                    </Button>
                                    <div
                                        className="absolute right-0 top-0 h-full w-2 cursor-col-resize hover:bg-primary/50 active:bg-primary flex items-center justify-center group"
                                        onMouseDown={(e) => handleResizeStart(e, "speed")}
                                    >
                                        <GripVertical
                                            className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"/>
                                    </div>
                                </TableHead>
                                <TableHead style={{width: `${columnWidths.lane}px`}} className="relative">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-full justify-start"
                                        onClick={() => handleSort("lane")}
                                    >
                                        Voie
                                        {renderSortIcon("lane")}
                                    </Button>
                                    <div
                                        className="absolute right-0 top-0 h-full w-2 cursor-col-resize hover:bg-primary/50 active:bg-primary flex items-center justify-center group"
                                        onMouseDown={(e) => handleResizeStart(e, "lane")}
                                    >
                                        <GripVertical
                                            className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"/>
                                    </div>
                                </TableHead>
                                <TableHead style={{width: `${columnWidths.created_at}px`}} className="relative">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-full justify-start"
                                        onClick={() => handleSort("created_at")}
                                    >
                                        Date & Heure
                                        {renderSortIcon("created_at")}
                                    </Button>
                                    <div
                                        className="absolute right-0 top-0 h-full w-2 cursor-col-resize hover:bg-primary/50 active:bg-primary flex items-center justify-center group"
                                        onMouseDown={(e) => handleResizeStart(e, "created_at")}
                                    >
                                        <GripVertical
                                            className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"/>
                                    </div>
                                </TableHead>
                            </TableRow>
                            <TableRow>
                                <TableHead style={{width: `${columnWidths.id}px`}}>
                                    <div className="relative">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"/>
                                        <Input
                                            placeholder="ID..."
                                            className="h-8 pl-8"
                                            value={filters.id}
                                            onChange={(e) => handleFilterChange("id", e.target.value)}
                                        />
                                    </div>
                                </TableHead>
                                <TableHead style={{width: `${columnWidths.sensor_name}px`}}>
                                    <div className="relative">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"/>
                                        <Input
                                            placeholder="Rechercher..."
                                            className="h-8 pl-8"
                                            value={filters.sensor_name}
                                            onChange={(e) => handleFilterChange("sensor_name", e.target.value)}
                                        />
                                    </div>
                                </TableHead>
                                <TableHead style={{width: `${columnWidths.speed}px`}}>
                                    <div className="relative">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"/>
                                        <Input
                                            placeholder="Vitesse..."
                                            className="h-8 pl-8"
                                            value={filters.speed}
                                            onChange={(e) => handleFilterChange("speed", e.target.value)}
                                        />
                                    </div>
                                </TableHead>
                                <TableHead style={{width: `${columnWidths.lane}px`}}>
                                    <div className="relative">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"/>
                                        <Input
                                            placeholder="Voie..."
                                            className="h-8 pl-8"
                                            value={filters.lane}
                                            onChange={(e) => handleFilterChange("lane", e.target.value)}
                                        />
                                    </div>
                                </TableHead>
                                <TableHead style={{width: `${columnWidths.created_at}px`}}>
                                    <div className="relative">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"/>
                                        <Input
                                            placeholder="Date..."
                                            className="h-8 pl-8"
                                            value={filters.created_at}
                                            onChange={(e) => handleFilterChange("created_at", e.target.value)}
                                        />
                                    </div>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                        Aucun résultat trouvé
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedData.map((record) => (
                                    <TableRow key={record.id}>
                                        <TableCell style={{width: `${columnWidths.id}px`}}
                                                   className="font-mono text-sm">{record.id}</TableCell>
                                        <TableCell
                                            style={{width: `${columnWidths.sensor_name}px`}}>{record.sensor_name || "Unknown"}</TableCell>
                                        <TableCell style={{width: `${columnWidths.speed}px`}}>
                                            <span className="font-semibold">{record.speed} km/h</span>
                                        </TableCell>
                                        <TableCell style={{width: `${columnWidths.lane}px`}}>
                                            <Badge variant={record.lane === Lane.Left ? "default" : "secondary"}>
                                                {record.lane === Lane.Left ? "Gauche" : "Droite"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell style={{width: `${columnWidths.created_at}px`}}
                                                   className="text-sm text-muted-foreground">
                                            {format(new Date(record.created_at), "dd/MM/yyyy HH:mm:ss")}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Lignes par page:</span>
                            <Select
                                value={itemsPerPage.toString()}
                                onValueChange={(value) => {
                                    setItemsPerPage(Number(value));
                                    setCurrentPage(1); // Reset to first page when changing items per page
                                }}
                            >
                                <SelectTrigger size="sm" className="w-[70px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="20">20</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                    <SelectItem value="100">100</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {totalPages > 0 ? `Page ${currentPage} sur ${totalPages}` : 'Aucune page'}
                        </div>
                    </div>
                    {totalPages > 1 && (
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                            >
                                Précédent
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Suivant
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
