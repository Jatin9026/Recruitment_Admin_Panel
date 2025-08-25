import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import dummyApplicants from "../../data/dummyApplicants";

export default function CheckIn({ role }) {
  const [query, setQuery] = useState("");
  const [branch, setBranch] = useState("");
  const [libraryId, setLibraryId] = useState("");
  const [results, setResults] = useState(dummyApplicants);

  const uniqueBranches = [...new Set(dummyApplicants.map((a) => a.department))];

  // 🔹 Advanced Search Logic (sort by relevance)
  function searchApplicants(e) {
    if (e) e.preventDefault();

    let filtered = [...dummyApplicants];

    if (query.trim() !== "") {
      const q = query.toLowerCase();
      filtered.sort((a, b) => {
        const aMatch = a.name.toLowerCase().includes(q) ? 1 : 0;
        const bMatch = b.name.toLowerCase().includes(q) ? 1 : 0;
        return bMatch - aMatch;
      });
    }

    if (libraryId.trim() !== "") {
      const q = libraryId.toLowerCase();
      filtered.sort((a, b) => {
        const aMatch = a.libraryId.toLowerCase().includes(q) ? 1 : 0;
        const bMatch = b.libraryId.toLowerCase().includes(q) ? 1 : 0;
        return bMatch - aMatch;
      });
    }

    if (branch.trim() !== "") {
      filtered = filtered.filter(
        (a) => a.department.toLowerCase() === branch.toLowerCase()
      );
    }

    setResults(filtered);
  }

  function toggleBranch(selectedBranch) {
    if (branch === selectedBranch) {
      setBranch("");
      setResults(dummyApplicants);
    } else {
      setBranch(selectedBranch);
      setResults(
        dummyApplicants.filter(
          (a) => a.department.toLowerCase() === selectedBranch.toLowerCase()
        )
      );
    }
  }

  function markAttendance(applicantId) {
    setResults((prev) =>
      prev.map((a) =>
        a.id === applicantId ? { ...a, checkIn: true, status: "Present" } : a
      )
    );
  }

  if (role < 1) {
    return (
      <Card className="max-w-lg mx-auto mt-12">
        <CardContent>
          <p className="text-red-600">Access Denied: Members or higher only.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="p-6 space-y-6 w-full">
      {/* 🔹 Search & Filter Section */}
      <Card className="w-full">
        <CardContent className="space-y-2">
          <h2 className="text-xl font-bold mb-2">Check-In Applicants</h2>

          {/* Search Form */}
          <form
            className="grid grid-cols-1 md:grid-cols-3 gap-2"
            onSubmit={searchApplicants}
          >
            <Input
              type="text"
              placeholder="Search by name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Input
              type="text"
              placeholder="Search by Library ID..."
              value={libraryId}
              onChange={(e) => setLibraryId(e.target.value)}
            />
            <Button
              type="submit"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Search
            </Button>
          </form>

          {/* Branch Filters */}
          <div className="flex flex-wrap gap-2 pt-1">
            {uniqueBranches.map((b) => (
              <Badge
                key={b}
                onClick={() => toggleBranch(b)}
                className={`cursor-pointer px-3 py-1 rounded-full ${
                  branch === b
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {b}
              </Badge>
            ))}
            {branch && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setBranch("");
                  setResults(dummyApplicants);
                }}
              >
                Clear Filter
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 🔹 Applicants Table Section */}
      <Card className="w-full shadow-md">
        <CardContent>
          <h3 className="font-semibold text-lg mb-4">Applicants</h3>
          <div className="overflow-x-auto h-[600px] overflow-y-auto">
            <table className="min-w-full text-sm border">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="px-4 py-2 border">Name</th>
                  <th className="px-4 py-2 border">Email</th>
                  <th className="px-4 py-2 border">Branch</th>
                  <th className="px-4 py-2 border">Library ID</th>
                  <th className="px-4 py-2 border">Attendance</th>
                </tr>
              </thead>
              <tbody>
                {results.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center text-gray-500 py-4">
                      No applicants found.
                    </td>
                  </tr>
                ) : (
                  results.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border">{a.name}</td>
                      <td className="px-4 py-2 border">{a.email}</td>
                      <td className="px-4 py-2 border">{a.department}</td>
                      <td className="px-4 py-2 border">{a.libraryId}</td>
                      <td className="px-4 py-2 border text-center">
                        {!a.checkIn ? (
                          <Button
                            onClick={() => markAttendance(a.id)}
                            size="sm"
                            disabled={a.checkIn}
                            className="bg-green-600 hover:bg-green-700 text-white w-24"
                          >
                            Mark Present
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            disabled
                            className="bg-green-600 text-white w-24"
                          >
                            Present
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
