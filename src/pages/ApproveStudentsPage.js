import React, { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import {
  getAllPayments,
  approvePayment,
  editPaymentDuration,
} from "../services/Api";
import EditTransactionModal from "../components/EditTransactionModal";

const ApproveStudentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPayment, setEditingPayment] = useState(null);

  // Search & filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all | approved | pending

  // Fetch payments
  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllPayments();

      if (response?.success && Array.isArray(response.data)) {
        const sortedPayments = response.data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setPayments(sortedPayments);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Error fetching payments:", err);
      setError("Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Approve payment
  const handleApprove = async (paymentId) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to approve this payment?"
    );
    if (!isConfirmed) return;

    try {
      await approvePayment(paymentId);
      alert("Payment approved successfully!");
      fetchPayments();
    } catch (err) {
      alert("Failed to approve payment: " + err.message);
    }
  };

  // Open edit modal
  const handleEdit = (payment) => {
    setEditingPayment(payment);
  };

  // Update payment
  const handleUpdatePayment = async (updatedFields) => {
    try {
      await editPaymentDuration(editingPayment.payment_id, updatedFields.course_duration);

      setPayments((prev) =>
        prev.map((payment) =>
          payment.payment_id === editingPayment.payment_id
            ? { ...payment, ...updatedFields }
            : payment
        )
      );

      setEditingPayment(null);
    } catch (err) {
      console.error("Failed to update payment:", err);
      alert("Failed to update payment: " + err.message);
    }
  };

  // Filter payments
  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.payment_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.registration_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.course_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all"
        ? true
        : filterStatus === "approved"
          ? p.status === true
          : p.status === false;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Navbar />
      <div className="flex-1 lg:ml-64 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header + Search & Filter */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Payment Transactions
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Review and manage student payment transactions
              </p>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search by ID, Register No, or Course"
                className="px-3 py-2 border rounded-md text-sm w-full sm:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                className="px-3 py-2 border rounded-md text-sm"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Loading / Empty / Data */}
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No payments
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  No payments match your search/filter.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto overflow-y-auto max-h-[calc(100vh-200px)]">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Payment ID</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reg No</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Payment Type</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">current_emi</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPayments.map((payment) => (
                      <tr key={payment.payment_id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-3 text-sm font-medium">{payment.payment_id}</td>
                        <td className="px-3 py-3 text-sm text-gray-600">{payment.student_name || "-"}</td>
                        <td className="px-3 py-3 text-sm text-gray-600">{payment.registration_number || "-"}</td>
                        <td className="px-3 py-3 text-sm text-gray-600">{payment.course_name || "-"}</td>
                        <td className="px-3 py-3 text-sm text-gray-600">{payment.payment_type || "-"}</td>
                        <td className="px-3 py-3 text-sm text-gray-600">{payment.current_emi || "-"}</td>
                        <td className="px-3 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${payment.status ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                            {payment.status ? "Approved" : "Pending"}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          {!payment.status && (
                            <div className="flex space-x-1">
                              <button className="inline-flex items-center justify-center p-1 sm:px-2 sm:py-1 text-xs font-medium rounded text-white bg-emerald-600 hover:bg-emerald-700"
                                onClick={() => handleApprove(payment.payment_id)}>✓ Approve</button>
                              <button className="inline-flex items-center justify-center p-1 sm:px-2 sm:py-1 text-xs font-medium rounded text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300"
                                onClick={() => handleEdit(payment)}>✎ Edit</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="block md:hidden divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <div key={payment.payment_id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{payment.payment_id}</span>
                      <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${payment.status ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                        {payment.status ? "Approved" : "Pending"}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-600 space-y-1">
                      <p><span className="font-medium">Name:</span> {payment.student_name || "-"}</p>
                      <p><span className="font-medium">Reg No:</span> {payment.registration_number || "-"}</p>
                      <p><span className="font-medium">Course:</span> {payment.course_name || "-"}</p>
                      <p><span className="font-medium">Payment Type:</span> {payment.payment_type || "-"}</p>
                      <p><span className="font-medium">EMI Duration:</span> {payment.current_emi || "-"}</p>
                    </div>
                    {!payment.status && (
                      <div className="mt-3 flex space-x-2">
                        <button className="flex-1 inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded text-white bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => handleApprove(payment.payment_id)}>✓ Approve</button>
                        <button className="flex-1 inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300"
                          onClick={() => handleEdit(payment)}>✎ Edit</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingPayment && (
        <EditTransactionModal
          payment={editingPayment}
          onClose={() => setEditingPayment(null)}
          onSubmit={handleUpdatePayment}
        />
      )}
    </div>
  );
};

export default ApproveStudentsPage;
