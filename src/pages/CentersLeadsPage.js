import React, { useEffect, useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import { getAllLeads, createLead, updateLeadStatus } from "../services/Api";

const CentersLeadsPage = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        source: "Website",
        remark: "",
        course: "French",
    });

    const token = localStorage.getItem("token");

    const formatDate = (dateString) =>
        new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });

    // ✅ Wrap fetchLeadsHandler with useCallback
    const fetchLeadsHandler = useCallback(async () => {
        try {
            setLoading(true);
            const result = await getAllLeads(token);
            setLeads(result || []);
        } catch (err) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (!token) {
            setError("No token found. Please login.");
            return;
        }
        fetchLeadsHandler();
    }, [fetchLeadsHandler, token]);


    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            await createLead(formData, token);
            await fetchLeadsHandler();
            alert("Lead created successfully!");
            setShowModal(false);
            setFormData({
                name: "",
                email: "",
                phone: "",
                source: "Website",
                remark: "",
                course: "French",
            });
        } catch (err) {
            console.error(err);
            alert(err.message || "Something went wrong. Please try again.");
        }
    };

    const handleStatusChange = async (id, status) => {
        try {
            await updateLeadStatus(id, status, token);
            await fetchLeadsHandler();
        } catch (err) {
            alert("Failed to update status");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row">
            <Navbar />
            <div className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8">
                <div className="max-w-full lg:max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                            Center Leads
                        </h1>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                                Total Leads: {leads.length}
                            </span>
                            <button
                                onClick={() => setShowModal(true)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700"
                            >
                                + Add Lead
                            </button>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-100 text-red-700 border-l-4 border-red-500 p-4 rounded mb-4">
                            {error}
                        </div>
                    )}

                    {/* Loading */}
                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
                        </div>
                    ) : (
                        <div className="bg-white shadow-md rounded-lg overflow-hidden w-full">
                            {/* Horizontal Scroll Wrapper */}
                            <div className="overflow-x-auto rounded-md border border-gray-200 w-full">
                                <table className="w-full min-w-[800px] table-auto text-sm">
                                    <thead className="bg-gray-50 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-4 py-3 text-left">Name</th>
                                            <th className="px-4 py-3 text-left">Email</th>
                                            <th className="px-4 py-3 text-left">Phone</th>
                                            <th className="px-4 py-3 text-left">Course</th>
                                            <th className="px-4 py-3 text-left">Source</th>
                                            <th className="px-4 py-3 text-left">Remarks</th>
                                            <th className="px-4 py-3 text-left">Created</th>
                                            <th className="px-4 py-3 text-left">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {leads.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="text-center py-6 text-gray-500">
                                                    No leads found
                                                </td>
                                            </tr>
                                        ) : (
                                            leads.map((lead) => (
                                                <tr key={lead.lead_id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3">{lead.name}</td>
                                                    <td className="px-4 py-3">{lead.email}</td>
                                                    <td className="px-4 py-3">{lead.phone}</td>
                                                    <td className="px-4 py-3">{lead.course}</td>
                                                    <td className="px-4 py-3">{lead.source}</td>
                                                    <td className="px-4 py-3">{lead.remark || "-"}</td>
                                                    <td className="px-4 py-3">
                                                        {lead.created_at ? formatDate(lead.created_at) : "-"}
                                                    </td>
                                                    <td className="px-4 py-3 flex flex-col sm:flex-row gap-2 items-start">
                                                        <select
                                                            value={lead.status}
                                                            onChange={(e) => handleStatusChange(lead.lead_id, e.target.value)}
                                                            className={`px-2 py-1 rounded text-xs font-semibold w-full
              ${lead.status === "enrolled"
                                                                    ? "bg-green-100 text-green-700"
                                                                    : lead.status === "lost_lead"
                                                                        ? "bg-red-100 text-red-700"
                                                                        : lead.status === "demo_schedule"
                                                                            ? "bg-blue-100 text-blue-700"
                                                                            : lead.status === "interested"
                                                                                ? "bg-yellow-100 text-yellow-700"
                                                                                : lead.status === "closed_lead"
                                                                                    ? "bg-gray-300 text-gray-800"
                                                                                    : "bg-gray-100 text-gray-700"
                                                                }`}
                                                        >
                                                            <option value="data_entry">Data Entry</option>
                                                            <option value="not_connected_1">Not Connected 1</option>
                                                            <option value="not_connected_2">Not Connected 2</option>
                                                            <option value="not_connected_3">Not Connected 3</option>
                                                            <option value="interested">Interested</option>
                                                            <option value="need_follow">Need Follow-up</option>
                                                            <option value="demo_schedule">Demo Schedule</option>
                                                            <option value="junk_lead">Junk Lead</option>
                                                            <option value="lost_lead">Lost Lead</option>
                                                            <option value="enrolled">Enrolled</option>
                                                            <option value="closed_lead">Closed Lead</option>
                                                        </select>

                                                        {/* ✅ Show extra button only if status is closed_lead */}
                                                        {lead.status === "closed_lead" && (
                                                            <button
                                                                onClick={() => window.open("https://studentportal.iypan.com/register", "_blank")}
                                                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 mt-1 sm:mt-0"
                                                            >
                                                                Convert to Student
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50 px-4">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h2 className="text-xl font-semibold mb-6 text-center">Add New Lead</h2>
                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            <input
                                type="text"
                                required
                                placeholder="Name"
                                className="w-full border px-3 py-2 rounded"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                            <input
                                type="email"
                                required
                                placeholder="Email"
                                className="w-full border px-3 py-2 rounded"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                            <input
                                type="text"
                                required
                                placeholder="Phone"
                                className="w-full border px-3 py-2 rounded"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />

                            <select
                                className="w-full border px-3 py-2 rounded"
                                value={formData.course}
                                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                            >
                                <option value="French">French</option>
                                <option value="German">German</option>
                                <option value="Japanese">Japanese</option>
                            </select>

                            <select
                                className="w-full border px-3 py-2 rounded"
                                value={formData.source}
                                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                            >
                                <option value="Facebook">Facebook</option>
                                <option value="Website">Website</option>
                                <option value="Google">Google</option>
                                <option value="Justdial">Justdial</option>
                                <option value="Associate Reference">Associate Reference</option>
                                <option value="Student Reference">Student Reference</option>
                                <option value="Walk-in">Walk-in</option>
                                <option value="ISML Leads">ISML Leads</option>
                            </select>

                            <textarea
                                rows={3}
                                placeholder="Remarks"
                                className="w-full border px-3 py-2 rounded"
                                value={formData.remark}
                                onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                            />

                            <div className="flex flex-col sm:flex-row justify-end gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-200 rounded">
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CentersLeadsPage;
