import { flexRender, getCoreRowModel, getFilteredRowModel, useReactTable } from "@tanstack/react-table"
import type { ColumnDef } from "@tanstack/react-table"
import { useMemo, useState } from "react"
import { CirclePlay, Download, Minus, Search } from "lucide-react"
import { CallDirectionBadge } from "@/components/pbx/CallDirectionBadge"
import { StatusBadge } from "@/components/pbx/StatusBadge"
import { Button } from "@/components/ui/button"
import { formatDuration, shortTime } from "@/lib/utils"
import type { PbxCall } from "@/types/pbx"

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

export function CdrTable({ calls, onOpen }: { calls: PbxCall[]; onOpen: (call: PbxCall) => void }) {
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState("all")
  const filtered = useMemo(() => calls.filter((call) => {
    const matchesStatus = status === "all" || call.status === status
    const q = query.trim().toLowerCase()
    const matchesQuery = !q || [call.id, call.caller, call.callerName, call.callee, call.agent, call.queue, call.extension].some((value) => value?.toLowerCase().includes(q))
    return matchesStatus && matchesQuery
  }), [calls, query, status])

  const columns = useMemo<ColumnDef<PbxCall>[]>(() => [
    { header: "Time", accessorKey: "startedAt", cell: (info) => <span className="mono">{shortTime(info.row.original.startedAt)}</span> },
    { header: "Direction", accessorKey: "direction", cell: (info) => <CallDirectionBadge direction={info.row.original.direction} /> },
    { header: "Caller", accessorKey: "caller", cell: (info) => <div><div className="mono">{info.row.original.caller}</div><div className="call-name">{info.row.original.callerName ?? "Unknown"}</div></div> },
    { header: "Destination", accessorKey: "callee", cell: (info) => <div><div>{info.row.original.queue ?? info.row.original.callee}</div><div className="call-name">{info.row.original.extension ? `Ext ${info.row.original.extension}` : info.row.original.callee}</div></div> },
    { header: "Agent", accessorKey: "agent", cell: (info) => info.row.original.agent ?? "—" },
    { header: "Status", accessorKey: "status", cell: (info) => <StatusBadge status={info.row.original.status} /> },
    { header: "Ring", accessorKey: "ringSeconds", cell: (info) => <span className="mono">{formatDuration(info.row.original.ringSeconds)}</span> },
    { header: "Talk", accessorKey: "talkSeconds", cell: (info) => <span className="mono">{formatDuration(info.row.original.talkSeconds)}</span> },
    { header: "Total", accessorKey: "totalSeconds", cell: (info) => <span className="mono">{formatDuration(info.row.original.totalSeconds)}</span> },
    { header: "Rec", accessorKey: "recordingAvailable", cell: (info) => info.row.original.recordingAvailable
      ? <span className="record-indicator available" title="Recording available" aria-label="Recording available"><CirclePlay /></span>
      : <span className="record-indicator unavailable" title="No recording" aria-label="No recording"><Minus /></span> },
  ], [])

  const table = useReactTable({ data: filtered, columns, getCoreRowModel: getCoreRowModel(), getFilteredRowModel: getFilteredRowModel() })

  return <div className="panel">
    <div className="panel-header"><div className="panel-title">Call Detail Records</div><Button variant="ghost" className="report-download" onClick={() => downloadCallReport(filtered)} disabled={filtered.length === 0}><Download />Download Call Report</Button></div>
    <div className="panel-body" style={{ paddingBottom: 8 }}><div className="toolbar"><div className="search-box"><Search /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search caller, agent, extension..." /></div><select className="select" value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">All statuses</option><option value="completed">Completed</option><option value="connected">Connected</option><option value="missed">Missed</option><option value="ringing">Ringing</option><option value="waiting">Waiting</option></select></div></div>
    <div className="table-wrap"><table className="data-table"><thead>{table.getHeaderGroups().map((group) => <tr key={group.id}>{group.headers.map((header) => <th key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</th>)}</tr>)}</thead><tbody>{table.getRowModel().rows.map((row) => <tr key={row.id} onClick={() => onOpen(row.original)}>{row.getVisibleCells().map((cell) => <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>)}</tbody></table>{table.getRowModel().rows.length === 0 && <div className="empty-state">No calls match the current filters.</div>}</div>
  </div>
}
