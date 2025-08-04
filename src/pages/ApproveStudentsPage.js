import React, { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import { getAllTransactions, approvePayment, editTransactionDuration } from "../services/Api";
import EditTransactionModal from "../components/EditTransactionModal";

const ApproveStudentsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Update the fetchTransactions function to handle the new response format
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllTransactions();
      console.log("API Response:", response);

      if (response?.success && Array.isArray(response.data)) {
        // Sort transactions by date (newest first)
        const sortedTransactions = response.data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setTransactions(sortedTransactions);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setError("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleApprove = async (paymentId) => {
    const isConfirmed = window.confirm("Are you sure you want to approve this payment?");
    if (isConfirmed) {
      try {
        await approvePayment(paymentId);
        alert("Payment approved successfully!");
        fetchTransactions(); // Refetch transactions to reflect the changes
      } catch (error) {
        alert("Failed to approve payment: " + error.message);
      }
    }
  };

  const handleEdit = async (paymentId, currentDuration) => {
    setEditingTransaction({ paymentId, currentDuration });
  };

  const handleUpdateDuration = async (newDuration) => {
    try {
      await editTransactionDuration(editingTransaction.paymentId, newDuration);

      // Update the specific transaction in the state
      setTransactions((prevTransactions) =>
        prevTransactions.map((transaction) =>
          transaction.payment_id === editingTransaction.paymentId
            ? { ...transaction, duration: newDuration }
            : transaction
        )
      );

      setEditingTransaction(null); // Close the modal
    } catch (error) {
      console.error("Failed to update duration:", error);
      alert("Failed to update duration: " + error.message);
    }
  };

  if (error) {
    return (
      <div className="flex">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Navbar />
      <div className="flex-1 lg:ml-64">
        <div className="p-2 sm:p-4 lg:p-8"> {/* Reduced padding on small screens */}
          <div className="mt-16 lg:mt-0"> {/* Extra margin for mobile nav */}
            <div className="max-w-7xl mx-auto">
              {/* Header Section */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Payment Transactions</h1>
                  <p className="mt-1 text-sm text-gray-600">
                    Review and manage student payment transactions
                  </p>
                </div>
              </div>

              {error && (
                <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Table Container */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                <div className="overflow-x-auto"> {/* Removed negative margin that was causing issues */}
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20 sm:w-auto">
                          ID
                        </th>
                        <th scope="col" className="hidden sm:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reg Number
                        </th>
                        <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th scope="col" className="hidden md:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Course
                        </th>
                        <th scope="col" className="hidden lg:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Duration
                        </th>
                        <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24 sm:w-auto">
                          Status
                        </th>
                        {/* <th scope="col" className="hidden xl:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th> */}
                        <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactions.map((transaction) => (
                        <tr key={transaction.payment_id} className="hover:bg-gray-50 transition-colors duration-200">
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-900 truncate max-w-[80px] sm:max-w-none">
                            {transaction.transaction_id}
                          </td>
                          <td className="hidden sm:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-600">
                            {transaction.registration_number}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-600 truncate max-w-[120px] sm:max-w-[180px] md:max-w-none">
                            {transaction.student_email}
                          </td>
                          <td className="hidden md:table-cell px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {transaction.course_name}
                          </td>
                          <td className="hidden lg:table-cell px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {transaction.duration} months
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${transaction.status
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                                }`}
                            >
                              {transaction.status ? "Approved" : "Pending"}
                            </span>
                          </td>
                          {/* <td className="hidden xl:table-cell px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(transaction.created_at).toLocaleString()}
                          </td> */}
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            {!transaction.status && (
                              <div className="flex space-x-1">
                                <button
                                  className="inline-flex items-center justify-center p-1 sm:px-2 sm:py-1 text-xs font-medium rounded 
                                    text-white bg-emerald-600 hover:bg-emerald-700"
                                  onClick={() => handleApprove(transaction.payment_id)}
                                  title="Approve"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                  <span className="hidden sm:inline sm:ml-1">Approve</span>
                                </button>
                                <button
                                  className="inline-flex items-center justify-center p-1 sm:px-2 sm:py-1 text-xs font-medium rounded
                                    text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300"
                                  onClick={() => handleEdit(transaction.payment_id, transaction.duration)}
                                  title="Edit"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                  </svg>
                                  <span className="hidden sm:inline sm:ml-1">Edit</span>
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Loading & Empty States */}
              {loading && (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
                </div>
              )}

              {!loading && transactions.length === 0 && (
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
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions</h3>
                    <p className="mt-1 text-sm text-gray-500">No transactions are available at the moment.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
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