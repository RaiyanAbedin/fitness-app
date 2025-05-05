import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Check, Info } from 'lucide-react';

const PrivacyConsentForm = () => {
    const [consented, setConsented] = useState(false);
    const [notAdvice, setNotAdvice] = useState(false);
    const [fullName, setFullName] = useState('');
    const [guardianName, setGuardianName] = useState('');
    const [email, setEmail] = useState('');
    const [date, setDate] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        // This would handle form submission in a real app
        alert('Privacy consent form submitted successfully!');
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Back button */}
                <button
                    onClick={() => navigate('/dashboard')}
                    className="mb-6 flex items-center gap-2 px-4 py-2 bg-gray-800/70 text-white rounded backdrop-blur-sm border border-gray-700 hover:border-[#0ff]/50"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </button>
                
                <div className="bg-gray-800/70 backdrop-blur-sm rounded-lg shadow-md p-6 border border-gray-700">
                    <div className="flex items-center gap-3 mb-6">
                        <Shield className="w-8 h-8 text-[#0ff]" />
                        <h1 className="text-2xl font-bold text-white">Data Privacy Consent</h1>
                    </div>
                    
                    <div className="space-y-6 text-gray-300">
                        <div>
                            <p className="text-white font-medium mb-2">Dear User,</p>
                            <p>Welcome to <span className="text-[#0ff] font-bold">NuroFit</span> – your second-brain for personalised fitness and nutrition, where we provide tailored recommendations and support your fitness journey. Before we proceed, we require your <span className="text-[#0ff] font-bold">explicit consent</span> to collect and process specific personal data, including for secure authentication. Note: Our policy requires those under the age of 16 to have parental consent before proceeding, see end of form.</p>
                        </div>
                        
                        <div>
                            <h2 className="text-white text-lg font-medium mb-2">1. Why We Need Your Data</h2>
                            <p>We only collect the <span className="text-[#0ff] font-bold">essential information</span> required to:</p>
                            <ul className="list-disc pl-6 mt-2 space-y-1">
                                <li><span className="text-white font-medium">Register and authenticate</span> your account (login/signup).</li>
                                <li><span className="text-white font-medium">Generate personalised</span> workouts and meal plans using AI.</li>
                                <li><span className="text-white font-medium">Store and track</span> your progress securely over time.</li>
                                <li><span className="text-white font-medium">Adapt recommendations</span> to your fitness goals and dietary needs.</li>
                            </ul>
                        </div>
                        
                        <div>
                            <h2 className="text-white text-lg font-medium mb-2">2. What Data We Collect</h2>
                            <p>We collect the <span className="text-[#0ff] font-bold">minimum amount of personal information</span>, strictly for functionality and personalisation:</p>
                            
                            <h3 className="text-white font-medium mt-3 mb-1">a) Authentication Data:</h3>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Name</li>
                                <li>Email address</li>
                                <li>Encrypted password</li>
                            </ul>
                            
                            <h3 className="text-white font-medium mt-3 mb-1">b) Fitness and Nutrition Data:</h3>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Height, weight, age, gender</li>
                                <li>Workout goals (e.g., muscle gain, fat loss)</li>
                                <li>Fitness experience level</li>
                                <li>Dietary preferences (e.g., Vegan, Halal, Gluten-Free)</li>
                                <li>Logged workouts and meals and shopping lists (optional)</li>
                            </ul>
                            <p className="mt-2">We do <span className="text-white font-bold">not</span> collect or store financial information, medical diagnoses, or contact lists.</p>
                        </div>
                        
                        <div>
                            <h2 className="text-white text-lg font-medium mb-2">3. How Your Data Will Be Used</h2>
                            <p>Your data is:</p>
                            <ul className="list-disc pl-6 mt-2 space-y-1">
                                <li>Used <span className="text-white font-medium">only for the specific purpose</span> of delivering tailored fitness and nutrition support. Body-metrics are only used for personalised recommendations and user motivation via displays on dashboard.</li>
                                <li>Stored securely and processed in compliance with <span className="text-white font-medium">UK GDPR (2018)</span>.</li>
                                <li><span className="text-white font-medium">Not accessible to any third-party apps or services</span> under any circumstances, whether shared, sold or disclosed.</li>
                            </ul>
                        </div>
                        
                        <div>
                            <h2 className="text-white text-lg font-medium mb-2">4. Your Rights Under GDPR</h2>
                            <p>As a user, you have the right to:</p>
                            <ul className="list-disc pl-6 mt-2 space-y-1">
                                <li>Access and review your personal data.</li>
                                <li>Ask for corrections to be made if your data is inaccurate.</li>
                                <li>Withdraw your consent at any time and request data deletion.</li>
                                <li>Understand how your data is processed through transparent documentation.</li>
                            </ul>
                        </div>
                        
                        <div>
                            <h2 className="text-white text-lg font-medium mb-2">5. How We Protect Your Data</h2>
                            <p>We are committed to protecting your data in compliance with the UK GDPR (2018), our measures include:</p>
                            <ul className="list-disc pl-6 mt-2 space-y-1">
                                <li>All passwords are hashed and stored <span className="text-white font-medium">securely.</span></li>
                                <li><span className="text-white font-medium">Data Minimisation:</span> only the minimum amount of data required will be retrieved and not used without explicit purpose.</li>
                                <li><span className="text-white font-medium">Access is restricted</span> only to authorised components of the system.</li>
                                <li>We adopt the <span className="text-white font-medium">Privacy by Design</span> framework and perform regular internal audits.</li>
                            </ul>
                        </div>
                        
                        <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-600">
                            <h2 className="text-white text-lg font-medium mb-4">Your Consent</h2>
                            <p className="mb-4">Please confirm your understanding and agreement to the use of your data as outlined above:</p>
                            
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1">
                                        <input 
                                            type="checkbox" 
                                            id="consent" 
                                            checked={consented} 
                                            onChange={() => setConsented(!consented)}
                                            className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-[#0ff] focus:ring-[#0ff]"
                                            required
                                        />
                                    </div>
                                    <label htmlFor="consent" className="text-white">
                                        I <span className="font-medium">consent</span> to the collection, storage, and use of my data (including login/signup and personal metrics) by NuroFit solely for personalised fitness and nutrition services.
                                    </label>
                                </div>
                                
                                <div className="flex items-start gap-3">
                                    <div className="mt-1">
                                        <input 
                                            type="checkbox" 
                                            id="notAdvice" 
                                            checked={notAdvice} 
                                            onChange={() => setNotAdvice(!notAdvice)}
                                            className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-[#0ff] focus:ring-[#0ff]"
                                            required
                                        />
                                    </div>
                                    <label htmlFor="notAdvice" className="text-white">
                                        I understand that NuroFit is <span className="font-medium">not</span> a source of fitness or nutritional advice and <span className="font-medium">should not</span> be used as a substitute for professional guidance and advice.
                                    </label>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Full Name (if 16 or older)</label>
                                        <input 
                                            type="text" 
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="w-full p-2 bg-gray-700/50 border border-gray-600 text-white rounded focus:ring-2 focus:ring-[#0ff] focus:border-transparent"
                                            required
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Parent/Guardian Name (if under 16)</label>
                                        <input 
                                            type="text" 
                                            value={guardianName}
                                            onChange={(e) => setGuardianName(e.target.value)}
                                            className="w-full p-2 bg-gray-700/50 border border-gray-600 text-white rounded focus:ring-2 focus:ring-[#0ff] focus:border-transparent"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Email Address (used for login)</label>
                                        <input 
                                            type="email" 
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full p-2 bg-gray-700/50 border border-gray-600 text-white rounded focus:ring-2 focus:ring-[#0ff] focus:border-transparent"
                                            required
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Date</label>
                                        <input 
                                            type="date" 
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            className="w-full p-2 bg-gray-700/50 border border-gray-600 text-white rounded focus:ring-2 focus:ring-[#0ff] focus:border-transparent"
                                            required
                                        />
                                    </div>
                                </div>
                                
                                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-gradient-to-r from-[#0ff] to-[#f0f] text-black font-bold px-6 py-3 rounded hover:opacity-90 flex items-center justify-center gap-2"
                                        disabled={!consented || !notAdvice}
                                    >
                                        <Check className="w-5 h-5" /> I Consent
                                    </button>
                                    
                                    <button
                                        type="button"
                                        onClick={() => navigate('/')}
                                        className="flex-1 bg-gray-700 text-white px-6 py-3 rounded hover:bg-gray-600 flex items-center justify-center gap-2"
                                    >
                                        I Do Not Consent
                                    </button>
                                </div>
                                
                                <p className="text-gray-400 text-sm mt-4">
                                    If you have any questions or concerns about your privacy, please contact NuroFit.
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyConsentForm;