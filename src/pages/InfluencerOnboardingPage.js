import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { getInfluencerCount, getAllInfluencers, submitInfluencer } from "../services/Api";


const InfluencerOnboardingPage = () => {
    const [totalInfluencers, setTotalInfluencers] = useState(0);
    const [influencers, setInfluencers] = useState([]);
    const [loading, setLoading] = useState(false);

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: "", email: "", phone: "", role: "" });
    const [step, setStep] = useState("form"); // "form" | "confirm"

    useEffect(() => {
        fetchInfluencerData();
    }, []);

    const fetchInfluencerData = async () => {
        try {
            const countRes = await getInfluencerCount();
            setTotalInfluencers(countRes?.count || 0);

            const allRes = await getAllInfluencers();
            setInfluencers(Array.isArray(allRes) ? allRes : []);
        } catch (err) {
            console.error("Error fetching data:", err);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleConfirm = () => {
        const { name, email, phone, role } = formData;
        if (!name || !email || !phone || !role) {
            alert("⚠️ Please fill all the fields");
            return;
        }
        setStep("confirm");
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            await submitInfluencer(formData);
            alert("✅ Mail sent to " + formData.email);
            setFormData({ name: "", email: "", phone: "", role: "" });
            setStep("form");
            setShowModal(false);
            fetchInfluencerData();
        } catch (err) {
            alert("❌ Error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col lg:flex-row">
            <Navbar />
            <div className="flex-1 lg:ml-64">
                <div className="p-2 sm:p-4 lg:p-8">
                    <div className="mt-20 lg:mt-0">
                        <div className="max-w-7xl mx-auto space-y-6">

                            {/* Stats Card */}
                            <div className="bg-indigo-50 rounded-xl border border-indigo-200 p-6 flex items-center hover:shadow-md transition-transform hover:scale-105">
                                <div>
                                    <p className="text-indigo-700 text-sm font-medium">Total Influencers</p>
                                    <h3 className="text-2xl font-bold text-gray-800">{totalInfluencers}</h3>
                                </div>
                            </div>

                            {/* Table Header with Button */}
                            <div className="flex justify-between items-center my-4">
                                <h2 className="text-xl font-bold">Influencers</h2>
                                <button
                                    onClick={() => setShowModal(true)}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                                >
                                    + Add Influencer
                                </button>
                            </div>


                            {/* Table Section Full Width */}
                            <div className="w-full bg-white rounded-xl shadow border p-6">

                                {influencers.length > 0 ? (
                                    <div className="overflow-y-auto" style={{ maxHeight: "300px" }}>
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-gray-100 sticky top-0">
                                                    <th className="p-2 border-b text-sm text-gray-600">Name</th>
                                                    <th className="p-2 border-b text-sm text-gray-600">Email</th>
                                                    <th className="p-2 border-b text-sm text-gray-600">Phone</th>
                                                    <th className="p-2 border-b text-sm text-gray-600">Role</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {influencers.map((inf) => (
                                                    <tr key={inf.influencer_id} className="hover:bg-gray-50">
                                                        <td className="p-2 border-b text-gray-800">{inf.name}</td>
                                                        <td className="p-2 border-b text-gray-800">{inf.email}</td>
                                                        <td className="p-2 border-b text-gray-800">{inf.phone}</td>
                                                        <td className="p-2 border-b text-gray-800">{inf.role}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-gray-500">No influencer data yet.</p>
                                )}
                            </div>


                            {/* Modal */}
                            {showModal && (
                                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 space-y-4 relative">
                                        <button
                                            onClick={() => { setShowModal(false); setStep("form"); }}
                                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                                        >
                                            ✕
                                        </button>

                                        {step === "form" && (
                                            <>
                                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Influencer</h3>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    placeholder="Name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 border rounded-lg mb-3"
                                                />
                                                <input
                                                    type="email"
                                                    name="email"
                                                    placeholder="Email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 border rounded-lg mb-3"
                                                />
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    placeholder="Phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 border rounded-lg mb-3"
                                                />

                                                <div className="flex flex-col space-y-2 mb-3">
                                                    <label className="font-medium">Select Role *</label>
                                                    <div className="flex gap-6">
                                                        <label className="flex items-center gap-2">
                                                            <input
                                                                type="radio"
                                                                name="role"
                                                                value="Moms"
                                                                checked={formData.role === "Moms"}
                                                                onChange={handleChange}
                                                            />
                                                            Moms
                                                        </label>
                                                        <label className="flex items-center gap-2">
                                                            <input
                                                                type="radio"
                                                                name="role"
                                                                value="Ambassador"
                                                                checked={formData.role === "Ambassador"}
                                                                onChange={handleChange}
                                                            />
                                                            Ambassador
                                                        </label>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={handleConfirm}
                                                    className="w-full bg-blue-800 hover:bg-blue-900 text-white px-4 py-2 rounded-lg"
                                                >
                                                    Confirm Details
                                                </button>
                                            </>
                                        )}

                                        {step === "confirm" && (
                                            <>
                                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Details</h3>
                                                <div className="space-y-2 text-gray-800 mb-4">
                                                    <p><strong>Name:</strong> {formData.name}</p>
                                                    <p><strong>Email:</strong> {formData.email}</p>
                                                    <p><strong>Phone:</strong> {formData.phone}</p>
                                                    <p><strong>Role:</strong> {formData.role}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={handleSubmit}
                                                        disabled={loading}
                                                        className={`flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                                                    >
                                                        {loading ? "Submitting..." : "Submit & Send Mail"}
                                                    </button>
                                                    <button
                                                        onClick={() => setStep("form")}
                                                        className="flex-1 bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"
                                                    >
                                                        Edit
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InfluencerOnboardingPage;
