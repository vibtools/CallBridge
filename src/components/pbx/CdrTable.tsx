import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, useReactTable } from "@tanstack/react-table"
import type { ColumnDef } from "@tanstack/react-table"
import { useMemo, useState } from "react"
import { CirclePlay, Download, Minus, Search, Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { CallDirectionBadge } from "@/components/pbx/CallDirectionBadge"
import { Button } from "@/components/ui/button"
import { formatDuration, shortTime } from "@/lib/utils"
import type { PbxCall, CallStatus } from "@/types/pbx"

function csvCell(value: string | number | boolean | undefined | null) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`
}

function downloadCallReport(calls: PbxCall[]) {
  const headers = ["Call ID", "Started", "Direction", "Caller", "Caller Name", "Destination", "Agent", "Extension", "Queue", "Status", "Ring Seconds", "Talk Seconds", "Total Seconds", "Recording"]
  const rows = calls.map((call) => [
    call.id,
    call.startedAt,
    call.direction,
    call.caller,
    call.callerName ?? "",
    call.callee,
    call.agent ?? "",
    call.extension ?? "",
    call.queue ?? "",
    call.status,
    call.ringSeconds,
    call.talkSeconds,
    call.totalSeconds,
    call.recordingAvailable ? "Available" : "Unavailable",
  ])
  const csv = [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `cloud-pbx-phone-call-report-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function CdrDispositionBadge({ status }: { status: CallStatus }) {
  let label = "Answered"
  let colorClass = "completed"

  if (["missed", "abandoned"].includes(status)) {
    label = "Missed / Abandoned"
    colorClass = "missed"
  } else if (status === "voicemail") {
    label = "Voicemail"
    colorClass = "ringing"
  } else if (["failed", "busy"].includes(status)) {
    label = "Failed / Busy"
    colorClass = "hold"
  } else if (status === "transferred") {
    label = "Transferred"
    colorClass = "transferred"
  } else if (status === "completed") {
    label = "Answered"
    colorClass = "completed"
  } else {
    label = status.charAt(0).toUpperCase() + status.slice(1)
    colorClass = "voicemail"
  }

  return <span className={`badge ${colorClass}`}>{label}</span>
}

export function CdrTable({ calls, onOpen }: { calls: PbxCall[]; onOpen: (call: PbxCall) => void }) {
  const [query, setQuery] = useState("")
  const [dispositionFilter, setDispositionFilter] = useState("all")
  const [dateRange, setDateRange] = useState("today")

  const filtered = useMemo(() => calls.filter((call) => {
    let matchesStatus = true
    if (dispositionFilter === "answered") {
      matchesStatus = call.status === "completed"
    } else if (dispositionFilter === "missed") {
      matchesStatus = ["missed", "abandoned"].includes(call.status)
    } else if (dispositionFilter === "voicemail") {
      matchesStatus = call.status === "voicemail"
    } else if (dispositionFilter === "failed") {
      matchesStatus = ["failed", "busy"].includes(call.status)
    }

    // Date logic would go here if we had actual older data, for now we just pass through
    // as it's a mock frontend dashboard.

    const q = query.trim().toLowerCase()
    const matchesQuery = !q || [call.id, call.caller, call.callerName, call.callee, call.agent, call.queue, call.extension].some((value) => value?.toLowerCase().includes(q))
    return matchesStatus && matchesQuery
  }), [calls, query, dispositionFilter, dateRange])

  const columns = useMemo<ColumnDef<PbxCall>[]>(() => [
    { header: "Time", accessorKey: "startedAt", cell: (info) => <span className="mono">{shortTime(info.row.original.startedAt)}</span> },
    { header: "Direction", accessorKey: "direction", cell: (info) => <CallDirectionBadge direction={info.row.original.direction} /> },
    { header: "Caller", accessorKey: "caller", cell: (info) => <div><div className="cdr-primary">{info.row.original.callerName ?? "Unknown"}</div><div className="cdr-secondary mono">{info.row.original.caller}</div></div> },
    { header: "Destination", accessorKey: "callee", cell: (info) => <div><div className="cdr-primary">{info.row.original.agent ?? info.row.original.queue ?? info.row.original.callee}</div><div className="cdr-secondary">{info.row.original.extension ? `Ext ${info.row.original.extension}` : info.row.original.callee}</div></div> },
    { header: "Disposition", accessorKey: "status", cell: (info) => <CdrDispositionBadge status={info.row.original.status} /> },
    { header: "Ring Time", accessorKey: "ringSeconds", cell: (info) => <span className="mono">{formatDuration(info.row.original.ringSeconds)}</span> },
    { header: "Talk Time", accessorKey: "talkSeconds", cell: (info) => <span className="mono">{formatDuration(info.row.original.talkSeconds)}</span> },
    { header: "Actions", accessorKey: "recordingAvailable", cell: (info) => <div style={{ display: "flex", justifyContent: "flex-end" }}>{info.row.original.recordingAvailable
      ? <span className="record-indicator available" style={{ cursor: "pointer", color: "var(--primary)" }} title="Play Recording"><CirclePlay size={16} strokeWidth={1.5} /></span>
      : <span className="record-indicator unavailable" style={{ color: "var(--muted-2)" }} title="No recording"><Minus size={16} strokeWidth={1.5} /></span>}</div> },
  ], [])

  const table = useReactTable({
    data: filtered,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  })

  return <div className="panel">
    <div className="panel-header"><div className="panel-title">Call Detail Records</div><Button variant="ghost" className="report-download" onClick={() => downloadCallReport(filtered)} disabled={filtered.length === 0}><Download />Download Call Report</Button></div>
    
    <div className="panel-body" style={{ paddingBottom: 8 }}>
      <div className="toolbar" style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <div className="search-box" style={{ flex: 1, minWidth: 200 }}>
          <Search size={16} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search caller, agent, extension..." />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--surface-raised)", padding: "2px 8px", borderRadius: 8, border: "1px solid var(--border)" }}>
          <Calendar size={14} color="var(--muted)" />
          <select style={{ border: "none", background: "transparent", fontSize: 13, color: "var(--text)", outline: "none", padding: "4px" }} value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
          </select>
        </div>
        <select className="select" style={{ fontSize: 13, height: 32 }} value={dispositionFilter} onChange={(e) => setDispositionFilter(e.target.value)}>
          <option value="all">All Dispositions</option>
          <option value="answered">Answered</option>
          <option value="missed">Missed / Abandoned</option>
          <option value="voicemail">Voicemail</option>
          <option value="failed">Failed / Busy</option>
        </select>
      </div>
    </div>
    
    <div className="table-wrap">
      <table className="data-table cdr-table">
        <thead>
          {table.getHeaderGroups().map((group) => <tr key={group.id}>{group.headers.map((header) => <th key={header.id} style={{ minWidth: (header.column.id === "caller" || header.column.id === "callee") ? 140 : "auto", textAlign: header.column.id === "recordingAvailable" ? "right" : "left" }}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</th>)}</tr>)}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => <tr key={row.id} onClick={() => onOpen(row.original)}>{row.getVisibleCells().map((cell) => <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>)}
        </tbody>
      </table>
      {table.getRowModel().rows.length === 0 && <div className="empty-state">No calls match the current filters.</div>}
    </div>
    
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderTop: "1px solid var(--table-divider)", fontSize: 13, flexWrap: "wrap", gap: 12 }}>
      <div style={{ color: "var(--muted)" }}>
        Showing {table.getRowModel().rows.length} of {table.getFilteredRowModel().rows.length} records
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "var(--muted)" }}>Rows per page:</span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={e => table.setPageSize(Number(e.target.value))}
            style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: 4, padding: "2px 4px", fontSize: 13, color: "var(--text)" }}
          >
            {[10, 20, 50, 100].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
        </div>
        <span style={{ color: "var(--text)" }}>
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
        </span>
        <div style={{ display: "flex", gap: 4 }}>
          <Button variant="ghost" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} style={{ padding: "4px 8px", height: "auto", minWidth: "auto" }}>
            <ChevronLeft size={16} />
          </Button>
          <Button variant="ghost" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} style={{ padding: "4px 8px", height: "auto", minWidth: "auto" }}>
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  </div>
}
