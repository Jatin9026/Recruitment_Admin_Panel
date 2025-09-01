import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import dummyApplicants from "../../data/dummyApplicants";
import toast, { Toaster } from "react-hot-toast";

export default function CheckIn({ role }) {
  const [query, setQuery] = useState("");
  const [branch, setBranch] = useState("");
  const [libraryId, setLibraryId] = useState("");
  const [results, setResults] = useState(dummyApplicants);

  const uniqueBranches = [...new Set(dummyApplicants.map((a) => a.department))];

  function searchApplicants(e) {
    if (e) e.preventDefault();
    let filtered = [...dummyApplicants];

    if (query.trim() !== "") {
      const q = query.toLowerCase();
      filtered = filtered.filter((a) => a.name.toLowerCase().includes(q));
    }

    if (libraryId.trim() !== "") {
      const q = libraryId.toLowerCase();
      filtered = filtered.filter((a) => a.libraryId.toLowerCase().includes(q));
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

  function checkInAndRemoveApplicant(applicantId) {
    const applicant = results.find((a) => a.id === applicantId);
    setResults((prev) => prev.filter((a) => a.id !== applicantId));
    toast.success(`${applicant.name} Present`);
  }

  // Access control
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
    <div className="space-y-6 w-full p-6">
      {/* Toast container */}
      <Toaster position="top-right" />

      {/* Search & Filter Section */}
      <Card className="w-full shadow-md border rounded-lg">
        <CardContent className="space-y-4">
          <div className="border-b pb-3">
            <h2 className="text-xl font-bold">Check-In Applicants</h2>
          </div>

          {/* Search Form */}
          <form
            className="grid grid-cols-1 md:grid-cols-3 gap-3"
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
              className="bg-blue-600 hover:bg-blue-800 w-full md:w-auto"
            >
              Search
            </Button>
          </form>

          {/* Branch Filters */}
          <div className="flex flex-wrap gap-2 pt-2">
            {uniqueBranches.map((b) => (
              <Badge
                key={b}
                onClick={() => toggleBranch(b)}
                className={`cursor-pointer px-3 py-1 rounded-full transition ${
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
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                Clear Filter
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Applicants Table Section */}
      <Card className="w-full shadow-md border rounded-lg">
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Applicants</h3>
            <span className="text-sm text-gray-500">
              Total: {results.length}
            </span>
          </div>
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto rounded-md border">
            <table className="min-w-full text-sm border-collapse">
              <thead className="bg-gray-100 sticky top-0 shadow-sm">
                <tr>
                  <th className="px-4 py-2 border text-left">Name</th>
                  <th className="px-4 py-2 border text-left">Library ID</th>
                  <th className="px-4 py-2 border text-left">Branch</th>
                  <th className="px-4 py-2 border text-left">Year</th>
                  <th className="px-4 py-2 border text-left">Domain</th>
                  <th className="px-4 py-2 border text-center">Attendance</th>
                </tr>
              </thead>
              <tbody>
                {results.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-gray-500 py-6">
                      No applicants found.
                    </td>
                  </tr>
                ) : (
                  results.map((a, idx) => (
                    <tr
                      key={a.id}
                      className={`${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-blue-50 transition`}
                    >
                      <td className="px-4 py-2 border">{a.name}</td>
                      <td className="px-4 py-2 border">{a.libraryId}</td>
                      <td className="px-4 py-2 border">{a.department}</td>
                      <td className="px-4 py-2 border">{a.year}</td>
                      <td className="px-4 py-2 border">{a.assignedDomain}</td>
                      <td className="px-4 py-2 border text-center">
                        <Button
                          onClick={() => checkInAndRemoveApplicant(a.id)}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-800 text-white w-28"
                        >
                          Mark Present
                        </Button>
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
