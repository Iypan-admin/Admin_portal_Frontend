import React, { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import { getInfluencerCount, getAllInfluencers, submitInfluencer } from "../services/Api";

const InfluencerOnboardingPage = () => {
    const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
    const [confirmed, setConfirmed] = useState(false);
    const [totalInfluencers, setTotalInfluencers] = useState(0);
    const [influencers, setInfluencers] = useState([]);
    const [loading, setLoading] = useState(false);
    const confirmRef = useRef(null);

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
        const { name, email, phone } = formData;
        if (!name || !email || !phone) {
            alert("Please fill all the fields");
            return;
        }
        setConfirmed(true);
        setTimeout(() => {
            confirmRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            await submitInfluencer(formData);
            alert("✅ Mail sent to " + formData.email);
            setFormData({ name: "", email: "", phone: "" });
            setConfirmed(false);
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
                        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-8">

                            {/* Header */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-8 hover:shadow-md transition-all">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                    <div className="p-3 bg-blue-50 rounded-full self-start sm:self-center">
                                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                d="M12 11c0 1.104-.896 2-2 2s-2-.896-2-2 .896-2 2-2 2 .896 2 2zm0 0c0 2.21 1.79 4 4 4s4-1.79 4-4-1.79-4-4-4-4 1.79-4 4zm-4 4c-2.21 0-4 1.79-4 4v1h16v-1c0-2.21-1.79-4-4-4H8z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold text-gray-800">
                                            Influencer Onboarding
                                        </h1>
                                    </div>
                                </div>
                            </div>


                            {/* Influencer Stats Card - Full Width */}
                            <div className="bg-indigo-50 rounded-xl border border-indigo-200 p-6 flex justify-between items-center hover:shadow-md transition-transform hover:scale-105">
                                <div>
                                    <p className="text-indigo-700 text-sm font-medium">Total Influencers</p>
                                    <h3 className="text-2xl font-bold text-gray-800">{totalInfluencers}</h3>
                                </div>
                                <div className="p-2 rounded-full bg-indigo-100">
                                    <svg className="w-5 h-5 text-indigo-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path d="M17 20h5v-2a3 3 0 00-3-3h-2M9 20H4v-2a3 3 0 013-3h2m3-4a4 4 0 100-8 4 4 0 000 8zm6 0a4 4 0 100-8 4 4 0 000 8z" />
                                    </svg>
                                </div>
                            </div>



                            {/* Main Section */}
                            <div className="flex flex-col lg:flex-row gap-6">

                                {/* Form Section */}
                                <div className="w-full lg:w-1/2 bg-white rounded-xl shadow border p-6 space-y-4">
                                    {!confirmed ? (
                                        <>
                                            <input
                                                type="text"
                                                name="name"
                                                placeholder="Name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border rounded-lg"
                                            />
                                            <input
                                                type="email"
                                                name="email"
                                                placeholder="Email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border rounded-lg"
                                            />
                                            <input
                                                type="tel"
                                                name="phone"
                                                placeholder="Phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border rounded-lg"
                                            />
                                            <button
                                                onClick={handleConfirm}
                                                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg"
                                            >
                                                Confirm Details
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <div ref={confirmRef} className="space-y-2 text-gray-800">
                                                <p><strong>Name:</strong> {formData.name}</p>
                                                <p><strong>Email:</strong> {formData.email}</p>
                                                <p><strong>Phone:</strong> {formData.phone}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleSubmit}
                                                    disabled={loading}
                                                    className={`bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                                                >
                                                    {loading ? "Submitting..." : "Submit & Send Mail"}
                                                </button>
                                                <button
                                                    onClick={() => setConfirmed(false)}
                                                    className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"
                                                >
                                                    Edit
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Influencer Table Section */}
                                <div className="w-full lg:w-1/2 bg-white rounded-xl shadow border p-6">
                                    <h2 className="text-lg font-semibold mb-4 text-gray-800">All Influencers</h2>
                                    {influencers.length > 0 ? (
                                        <div className="max-h-56 overflow-y-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-gray-100 sticky top-0">
                                                        <th className="p-2 border-b text-sm text-gray-600">Name</th>
                                                        <th className="p-2 border-b text-sm text-gray-600">Email</th>
                                                        <th className="p-2 border-b text-sm text-gray-600">Phone</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {influencers.map((inf) => (
                                                        <tr key={inf.influencer_id} className="hover:bg-gray-50">
                                                            <td className="p-2 border-b text-gray-800">{inf.name}</td>
                                                            <td className="p-2 border-b text-gray-800">{inf.email}</td>
                                                            <td className="p-2 border-b text-gray-800">{inf.phone}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500">No influencer data yet.</p>
                                    )}
                                </div>


                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InfluencerOnboardingPage;
