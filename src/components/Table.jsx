
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";


export default function Table({
  title,
  headers = [],
  rows = [],
  actions = [],
  pagination = { page: 1, size: 10, total: 0 },
  filters = [],
  role,
}) {
  return (
    <Card className="w-full rounded-2xl shadow-md border">
      <CardContent className="p-4">

        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{title}</h2>

          <form method="GET" className="flex gap-2">
            {filters.map((f) => (
              <select
                key={f.name}
                name={f.name}
                defaultValue={f.value}
                className="border rounded-lg px-2 py-1"
              >
                {f.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ))}
            <Button type="submit" size="sm">Filter</Button>
          </form>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                {headers.map((h) => (
                  <th key={h} className="px-4 py-2 border-b font-medium">
                    {h}
                  </th>
                ))}
                {actions.length > 0 && <th className="px-4 py-2 border-b">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={headers.length + 1} className="text-center py-6 text-gray-500">
                    No records found
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    {row.map((cell, i) => (
                      <td key={i} className="px-4 py-2 border-b">
                        {cell}
                      </td>
                    ))}
                    {actions.length > 0 && (
                      <td className="px-4 py-2 border-b flex gap-2">
                        {actions
                          .filter((a) => !a.minRole || role >= a.minRole)
                          .map((a, i) => (
                            <form key={i} method={a.method || "POST"} action={a.href(row)}>
                              <Button size="sm" variant={a.variant || "outline"}>
                                {a.label}
                              </Button>
                            </form>
                          ))}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4 text-sm">
          <span>
            Page {pagination.page} of {Math.ceil(pagination.total / pagination.size)}
          </span>
          <div className="flex gap-2">
            {pagination.page > 1 && (
              <a href={`?page=${pagination.page - 1}&size=${pagination.size}`}>
                <Button size="sm" variant="outline">Prev</Button>
              </a>
            )}
            {pagination.page < Math.ceil(pagination.total / pagination.size) && (
              <a href={`?page=${pagination.page + 1}&size=${pagination.size}`}>
                <Button size="sm" variant="outline">Next</Button>
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
