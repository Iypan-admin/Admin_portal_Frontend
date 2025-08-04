import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { fetchEliteCards, addEliteCard, getStudentByRegisterNumber } from "../services/Api";

const ViewCenterEliteCard = () => {
    const [eliteCards, setEliteCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        student_name: "",
        register_number: "",
        card_number: "",
        card_type: ""
    });

    const token = localStorage.getItem("token");

    const formatDate = (dateString) =>
        new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });

    const fetchEliteCardsHandler = async () => {
        try {
            setLoading(true);
            const data = await fetchEliteCards();
            setEliteCards(data);
        } catch (err) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!token) {
            setError("No token found. Please login.");
            return;
        }
        fetchEliteCardsHandler();
    }, [token]);



    const handleFormSubmit = async (e) => {
        e.preventDefault();

        try {
            // Fetch student name from register number if not already present
            if (!formData.student_name && formData.register_number) {
                const name = await getStudentByRegisterNumber(formData.register_number);
                if (!name) {
                    alert("Student not found for this register number.");
                    return;
                }
                setFormData((prev) => ({ ...prev, student_name: name }));
            }

            // Still check to be safe
            if (!formData.student_name) {
                alert("Student name is required.");
                return;
            }

            await addEliteCard(formData);
            await fetchEliteCardsHandler(); // refresh list
            alert("Elite card added successfully!");
            setShowModal(false);
            setFormData({
                student_name: "",
                register_number: "",
                card_number: "",
                card_type: ""
            });
        } catch (err) {
            console.error(err);
            alert(err.message || "Something went wrong. Please try again.");
        }
    };


    return (
        <div className="min-h-screen bg-gray-100 flex">
            <Navbar />
            <div className="flex-1 lg:ml-64">
                <div className="p-2 sm:p-4 lg:p-8">
                    <div className="mt-16 lg:mt-0">
                        <div className="max-w-7xl mx-auto">
                            <div className="flex justify-between items-center mb-4">
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Elite Card Members</h1>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                                        Total Cards: {eliteCards.length}
                                    </span>
                                    <button
                                        onClick={() => setShowModal(true)}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700"
                                    >
                                        + Connect Elite Card
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-100 text-red-700 border-l-4 border-red-500 p-4 rounded mb-4">
                                    {error}
                                </div>
                            )}

                            {loading ? (
                                <div className="flex justify-center items-center h-40">
                                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
                                </div>
                            ) : (
                                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                                    <div className="overflow-x-auto max-h-[calc(100vh-250px)] overflow-y-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50 sticky top-0 z-10">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Register Number</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Card Number</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Card Type</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {eliteCards.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={5} className="text-center py-6 text-gray-500">
                                                            No elite cards found
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    eliteCards.map((card) => (
                                                        <tr key={card.id} className="hover:bg-gray-50">
                                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{card.student_name}</td>
                                                            <td className="px-4 py-3 text-sm text-gray-800">{card.register_number}</td>
                                                            <td className="px-4 py-3 text-sm text-gray-700">{card.card_number}</td>
                                                            <td className="px-4 py-3 text-sm">
                                                                <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                    {card.card_type}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-500">{formatDate(card.created_at)}</td>
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
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
                    <div className="bg-white px-6 py-8 rounded-lg shadow-lg w-full max-w-md">
                        <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">Connect Elite Card</h2>
                        <form onSubmit={handleFormSubmit} className="space-y-5">

                            {/* Student Name (Read-only input) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
                                <input
                                    type="text"
                                    required
                                    readOnly
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm bg-gray-100 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    value={formData.student_name}
                                />
                            </div>

                            {/* Register Number (Auto-fetches student name) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Register Number</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    value={formData.register_number}
                                    onChange={async (e) => {
                                        const regNo = e.target.value;

                                        // Update register number immediately, clear student name while typing
                                        setFormData((prev) => ({
                                            ...prev,
                                            register_number: regNo,
                                            student_name: "",
                                        }));

                                        if (regNo.length >= 3) {
                                            try {
                                                const name = await getStudentByRegisterNumber(regNo); // expects just the name string
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    student_name: name || "",
                                                }));
                                            } catch (err) {
                                                console.warn("Student not found:", regNo);
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    student_name: "",
                                                }));
                                            }
                                        }
                                    }}
                                />
                            </div>




                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    value={formData.card_number}
                                    onChange={(e) => setFormData({ ...formData, card_number: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Card Type</label>
                                <select
                                    required
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    value={formData.card_type}
                                    onChange={(e) => setFormData({ ...formData, card_type: e.target.value })}
                                >
                                    <option value="">Select Type</option>
                                    <option value="Elite EduPass">Elite EduPass</option>
                                    <option value="Elite ScholarPass">Elite ScholarPass</option>
                                    <option value="Infinite Pass">Infinite Pass</option>
                                </select>
                            </div>

                            <div className="flex justify-end pt-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 text-sm rounded hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                >
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )
            }
        </div >
    );
};

export default ViewCenterEliteCard;
