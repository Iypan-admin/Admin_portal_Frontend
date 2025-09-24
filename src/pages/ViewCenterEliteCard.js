import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { fetchEliteCards, addEliteCard, getStudentByRegisterNumber, getCardNameByNumber } from "../services/Api";

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

            if (!formData.student_name) {
                alert("Student name is required.");
                return;
            }

            if (!formData.card_type) {
                alert("Invalid card number. Please enter a valid one.");
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
                <div className="p-4 sm:p-6 lg:p-8">
                    <div className="mt-16 lg:mt-0">
                        <div className="max-w-7xl mx-auto">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
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
                                <div className="bg-white shadow-md rounded-lg overflow-hidden w-full">
                                    <div className="overflow-x-auto rounded-md border border-gray-200 max-w-full">
                                        <table className="w-full table-auto text-sm">
                                            <thead className="bg-gray-50 sticky top-0 z-10">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Student Name</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Register Number</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Card Number</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Card Type</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Created</th>
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
                                                            <td className="px-4 py-3 text-sm font-medium text-gray-900 hidden sm:table-cell">{card.student_name}</td>
                                                            <td className="px-4 py-3 text-sm text-gray-800">{card.register_number}</td>
                                                            <td className="px-4 py-3 text-sm text-gray-700">{card.card_number}</td>
                                                            <td className="px-4 py-3 text-sm">
                                                                <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                    {card.card_type}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-500 hidden sm:table-cell">{formatDate(card.created_at)}</td>
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
                    <div className="bg-white px-4 py-6 sm:px-6 sm:py-8 rounded-lg shadow-lg w-full max-w-sm sm:max-w-md mx-4 sm:mx-auto">
                        <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">Connect Elite Card</h2>
                        <form onSubmit={handleFormSubmit} className="space-y-5">

                            {/* Student Name */}
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

                            {/* Register Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Register Number</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    value={formData.register_number}
                                    onChange={async (e) => {
                                        const regNo = e.target.value;

                                        setFormData((prev) => ({
                                            ...prev,
                                            register_number: regNo,
                                            student_name: "",
                                        }));

                                        if (regNo.length >= 3) {
                                            try {
                                                const name = await getStudentByRegisterNumber(regNo);
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    student_name: name || "",
                                                }));
                                            } catch (err) {
                                                console.warn("Student not found:", regNo);
                                                setFormData((prev) => ({ ...prev, student_name: "" }));
                                            }
                                        }
                                    }}
                                />
                            </div>

                            {/* Card Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    value={formData.card_number}
                                    onChange={async (e) => {
                                        const cardNumber = e.target.value;

                                        setFormData((prev) => ({
                                            ...prev,
                                            card_number: cardNumber,
                                            card_type: "",
                                        }));

                                        if (cardNumber.length >= 3) {
                                            try {
                                                const cardName = await getCardNameByNumber(cardNumber);
                                                if (cardName) {
                                                    setFormData((prev) => ({ ...prev, card_type: cardName }));
                                                }
                                            } catch (err) {
                                                console.warn("Card not found:", cardNumber);
                                                setFormData((prev) => ({ ...prev, card_type: "" }));
                                            }
                                        }
                                    }}
                                />
                            </div>

                            {/* Card Type (read-only) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Card Type</label>
                                <input
                                    type="text"
                                    readOnly
                                    required
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm bg-gray-100 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    value={formData.card_type}
                                />
                            </div>

                            {/* Buttons */}
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
            )}
        </div>
    );
};

export default ViewCenterEliteCard;
