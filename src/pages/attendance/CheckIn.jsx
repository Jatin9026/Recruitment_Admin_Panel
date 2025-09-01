import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
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

  if (role < 1) {
    return (
      <Card className="max-w-lg mx-auto mt-12 mx-4">
        <CardContent className="p-4">
          <p className="text-red-600 text-center">Access Denied: Members or higher only.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6 w-full p-3 sm:p-4 lg:p-6">
      <Toaster position="top-right" />

      <Card className="w-full shadow-md border rounded-lg">
        <CardContent className="space-y-4 p-4 lg:p-6">
          <div className="border-b pb-3">
            <h2 className="text-lg sm:text-xl font-bold">Check-In Applicants</h2>
          </div>

          <form
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
            onSubmit={searchApplicants}
          >
            <Input
              type="text"
              placeholder="Search by name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="text-sm sm:text-base"
            />
            <Input
              type="text"
              placeholder="Search by Library ID..."
              value={libraryId}
              onChange={(e) => setLibraryId(e.target.value)}
              className="text-sm sm:text-base"
            />
            <Button
              type="submit"
              size="sm"
              className="bg-blue-600 hover:bg-blue-800 w-full sm:col-span-2 lg:col-span-1 text-sm sm:text-base h-9 sm:h-10"
            >
              Search
            </Button>
          </form>

          <div className="flex flex-wrap gap-2 pt-2">
            {uniqueBranches.map((b) => (
              <Badge
                key={b}
                onClick={() => toggleBranch(b)}
                className={`cursor-pointer px-2 sm:px-3 py-1 rounded-full transition text-xs sm:text-sm min-h-[32px] flex items-center ${
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
                className="border-blue-600 text-blue-600 hover:bg-blue-50 text-xs sm:text-sm h-8 px-2 sm:px-3"
              >
                Clear Filter
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="w-full shadow-md border rounded-lg">
        <CardContent className="p-2 sm:p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4 px-2 sm:px-0">
            <h3 className="font-semibold text-base sm:text-lg">Applicants</h3>
            <span className="text-xs sm:text-sm text-gray-500">
              Total: {results.length}
            </span>
          </div>
          
          <div className="hidden sm:block">
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
                            className="bg-blue-600 hover:bg-blue-800 text-white w-24 lg:w-28 text-xs lg:text-sm"
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
          </div>

          <div className="sm:hidden space-y-3">
            {results.length === 0 ? (
              <div className="text-center text-gray-500 py-6">
                No applicants found.
              </div>
            ) : (
              results.map((a) => (
                <Card key={a.id} className="border border-gray-200">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1 flex-1">
                        <h4 className="font-medium text-sm">{a.name}</h4>
                        <p className="text-xs text-gray-600">ID: {a.libraryId}</p>
                        <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                          <span className="bg-gray-100 px-2 py-1 rounded">{a.department}</span>
                          <span className="bg-gray-100 px-2 py-1 rounded">Year {a.year}</span>
                          <span className="bg-gray-100 px-2 py-1 rounded">{a.assignedDomain}</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => checkInAndRemoveApplicant(a.id)}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-800 text-white text-xs px-3 py-2 ml-2"
                      >
                        Present
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
