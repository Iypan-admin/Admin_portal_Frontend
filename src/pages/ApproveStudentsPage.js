import React, { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import {
  getAllTransactions,
  approvePayment,
  editTransactionDuration,
} from "../services/Api";
import EditTransactionModal from "../components/EditTransactionModal";

const ApproveStudentsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Search & filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all | approved | pending

  // Fetch transactions
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllTransactions();

      if (response?.success && Array.isArray(response.data)) {
        const sortedTransactions = response.data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setTransactions(sortedTransactions);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Approve payment
  const handleApprove = async (paymentId) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to approve this payment?"
    );
    if (!isConfirmed) return;

    try {
      await approvePayment(paymentId);
      alert("Payment approved successfully!");
      fetchTransactions();
    } catch (err) {
      alert("Failed to approve payment: " + err.message);
    }
  };

  // Open edit modal
  const handleEdit = (paymentId, currentDuration) => {
    setEditingTransaction({ paymentId, currentDuration });
  };

  // Update duration
  const handleUpdateDuration = async (newDuration) => {
    try {
      await editTransactionDuration(editingTransaction.paymentId, newDuration);

      setTransactions((prev) =>
        prev.map((transaction) =>
          transaction.payment_id === editingTransaction.paymentId
            ? { ...transaction, duration: newDuration }
            : transaction
        )
      );

      setEditingTransaction(null);
    } catch (err) {
      console.error("Failed to update duration:", err);
      alert("Failed to update duration: " + err.message);
    }
  };

  // Filter transactions
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.registration_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.course_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all"
        ? true
        : filterStatus === "approved"
          ? t.status === true
          : t.status === false;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Navbar />
      <div className="flex-1 lg:ml-64">
        <div className="p-2 sm:p-4 lg:p-8">
          <div className="mt-16 lg:mt-0">
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
              ) : filteredTransactions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No transactions
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      No transactions match your search/filter.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                  {/* Desktop / Tablet Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          <th className="px-3 sm:px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Payment ID
                          </th>
                          <th className="px-3 sm:px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Register No
                          </th>
                          <th className="px-3 sm:px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Course
                          </th>
                          <th className="px-3 sm:px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Duration
                          </th>
                          <th className="px-3 sm:px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Status
                          </th>
                          <th className="px-3 sm:px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredTransactions.map((transaction) => (
                          <tr
                            key={transaction.payment_id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-3 sm:px-6 py-3 text-sm font-medium text-gray-900">
                              {transaction.transaction_id}
                            </td>
                            <td className="px-3 sm:px-6 py-3 text-sm text-gray-600">
                              {transaction.registration_number || "-"}
                            </td>
                            <td className="px-3 sm:px-6 py-3 text-sm text-gray-600">
                              {transaction.course_name || "-"}
                            </td>
                            <td className="px-3 sm:px-6 py-3 text-sm text-gray-600">
                              {transaction.duration || "-"}
                            </td>
                            <td className="px-3 sm:px-6 py-3">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${transaction.status
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                                  }`}
                              >
                                {transaction.status ? "Approved" : "Pending"}
                              </span>
                            </td>
                            <td className="px-3 sm:px-6 py-3">
                              {!transaction.status && (
                                <div className="flex space-x-1">
                                  <button
                                    className="inline-flex items-center justify-center p-1 sm:px-2 sm:py-1 text-xs font-medium rounded text-white bg-emerald-600 hover:bg-emerald-700"
                                    onClick={() =>
                                      handleApprove(transaction.payment_id)
                                    }
                                  >
                                    ✓
                                    <span className="hidden sm:inline sm:ml-1">
                                      Approve
                                    </span>
                                  </button>
                                  <button
                                    className="inline-flex items-center justify-center p-1 sm:px-2 sm:py-1 text-xs font-medium rounded text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300"
                                    onClick={() =>
                                      handleEdit(
                                        transaction.payment_id,
                                        transaction.duration
                                      )
                                    }
                                  >
                                    ✎
                                    <span className="hidden sm:inline sm:ml-1">
                                      Edit
                                    </span>
                                  </button>
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
                    {filteredTransactions.map((transaction) => (
                      <div
                        key={transaction.payment_id}
                        className="p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-900">
                            {transaction.transaction_id}
                          </span>
                          <span
                            className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${transaction.status
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                              }`}
                          >
                            {transaction.status ? "Approved" : "Pending"}
                          </span>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                          <p>
                            <span className="font-medium">Reg No:</span>{" "}
                            {transaction.registration_number || "-"}
                          </p>
                          <p>
                            <span className="font-medium">Course:</span>{" "}
                            {transaction.course_name || "-"}
                          </p>
                          <p>
                            <span className="font-medium">Duration:</span>{" "}
                            {transaction.duration || "-"}
                          </p>
                        </div>
                        {!transaction.status && (
                          <div className="mt-3 flex space-x-2">
                            <button
                              className="flex-1 inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded text-white bg-emerald-600 hover:bg-emerald-700"
                              onClick={() =>
                                handleApprove(transaction.payment_id)
                              }
                            >
                              ✓ Approve
                            </button>
                            <button
                              className="flex-1 inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300"
                              onClick={() =>
                                handleEdit(
                                  transaction.payment_id,
                                  transaction.duration
                                )
                              }
                            >
                              ✎ Edit
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingTransaction && (
        <EditTransactionModal
          currentDuration={editingTransaction.currentDuration}
          onClose={() => setEditingTransaction(null)}
          onSubmit={handleUpdateDuration}
        />
      )}
    </div>
  );
};

export default ApproveStudentsPage;
