import { useState } from "react";
import { useBatches } from "../useBatches";
import toast from 'react-hot-toast';
import "../farmsense.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function CropCustomizationPage() {
    const { addBatch } = useBatches();
    
    const [cropName, setCropName] = useState("");
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    
    const [result, setResult] = useState(null);
    const [registerLocation, setRegisterLocation] = useState("");
    const [registering, setRegistering] = useState(false);

    const handleGenerate = async () => {
        if (!cropName.trim() || !prompt.trim()) {
            toast.error("Please enter a crop name and your customization goal.");
            return;
        }

        setLoading(true);
        setResult(null);
        toast.loading("AI is analyzing your request...", { id: "custom-gen" });

        try {
            const res = await fetch(`${API_BASE_URL}/api/crop-customization/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ crop_name: cropName, prompt: prompt })
            });
            const data = await res.json();
            
            if (!res.ok) {
                throw new Error("Failed to generate customization");
            }
            
            setResult(data);
            
            if (data.isValid && data.isPossible) {
                toast.success("Customization recipe generated!", { id: "custom-gen" });
            } else {
                toast.error("Request rejected by AI", { id: "custom-gen" });
            }
        } catch (err) {
            toast.error(err.message || "Something went wrong", { id: "custom-gen" });
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterBatch = async () => {
        if (!registerLocation) {
            toast.error("Please select a location block.");
            return;
        }

        setRegistering(true);
        toast.loading("Registering custom batch...", { id: "custom-reg" });

        const newBatch = {
            crop: cropName,
            location: registerLocation,
            notes: `Custom Goal: ${prompt}`,
            is_custom: true,
            custom_goal: prompt,
            custom_targets: result.recommendedRanges
        };

        try {
            await addBatch(newBatch);
            toast.success(`Custom batch for ${cropName} registered at ${registerLocation}!`, { id: "custom-reg" });
            
            // reset form after successful registration
            setCropName("");
            setPrompt("");
            setResult(null);
            setRegisterLocation("");
        } catch (err) {
            if (err.message && err.message.includes('occupied')) {
                toast.error("That location is already occupied!", { id: "custom-reg" });
            } else {
                toast.error("Failed to register batch.", { id: "custom-reg" });
            }
        } finally {
            setRegistering(false);
        }
    };

    const blocks = ["BLOCK A1", "BLOCK A2", "BLOCK A3", "BLOCK B1", "BLOCK B2", "BLOCK C1", "BLOCK C2", "BLOCK D1"];

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "100px" }}>
            <div className="fs-page-header">
                <div>
                    <div className="fs-page-eyebrow">Advanced AI Features</div>
                    <h1 className="fs-page-title">Crop <em>Customization</em></h1>
                    <p className="fs-page-sub">Tailor your crops for specific outcomes (e.g. highest possible spiciness)</p>
                </div>
            </div>

            <div className="fs-card" style={{ marginBottom: "24px" }}>
                <div className="fs-card__body">
                    <div className="fs-section-row2">
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', fontWeight: 'bold' }}>Crop Name</label>
                            <input 
                                type="text" 
                                className="fs-search-input" 
                                placeholder="e.g. Chilli" 
                                value={cropName} 
                                onChange={e => setCropName(e.target.value)} 
                            />
                        </div>
                    </div>
                    
                    <div style={{ marginTop: "16px" }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', fontWeight: 'bold' }}>Customization Goal</label>
                        <textarea 
                            rows="3" 
                            className="fs-search-input" 
                            placeholder="e.g. I want my chilli to achieve the highest possible spiciness" 
                            value={prompt} 
                            onChange={e => setPrompt(e.target.value)} 
                        />
                    </div>
                    
                    <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
                        <button 
                            className="fs-btn fs-btn--gold" 
                            onClick={handleGenerate} 
                            disabled={loading || !cropName.trim() || !prompt.trim()}
                        >
                            {loading ? "Analyzing..." : "Generate AI Custom Recipe"}
                        </button>
                    </div>
                </div>
            </div>

            {result && (
                <div className={`fs-card ${(!result.isValid || !result.isPossible) ? 'fs-batch-card--danger' : ''}`} style={{ border: (!result.isValid || !result.isPossible) ? "1px solid var(--red)" : "1px solid var(--gold)" }}>
                    <div className="fs-card__header">
                        <div className="fs-card__title">
                            {(!result.isValid || !result.isPossible) ? "❌ Customization Rejected" : "✨ AI Recommended Recipe"}
                        </div>
                    </div>
                    <div className="fs-card__body">
                        
                        {(!result.isValid || !result.isPossible) ? (
                            <div className="fs-suggestion" style={{ backgroundColor: "var(--red-light)", color: "var(--red)", border: "1px solid var(--red)" }}>
                                <strong>AI Feedback: </strong>
                                {result.feedbackMessage}
                            </div>
                        ) : (
                            <>
                                <div className="fs-batch-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr", marginBottom: "20px" }}>
                                    <div className="fs-sensor-mini" style={{ padding: "16px", border: "1px solid var(--border)", borderRadius: "8px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <span className="fs-sensor-mini__icon" style={{ fontSize: "1.5rem" }}>🌡️</span>
                                        <span className="fs-sensor-mini__name" style={{ marginTop: "8px" }}>Soil Temp</span>
                                        <span className="fs-sensor-mini__val" style={{ marginTop: "4px", color: "var(--gold)" }}>{result.recommendedRanges?.soilTemperature || "N/A"}</span>
                                    </div>
                                    <div className="fs-sensor-mini" style={{ padding: "16px", border: "1px solid var(--border)", borderRadius: "8px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <span className="fs-sensor-mini__icon" style={{ fontSize: "1.5rem" }}>💧</span>
                                        <span className="fs-sensor-mini__name" style={{ marginTop: "8px" }}>Soil Moisture</span>
                                        <span className="fs-sensor-mini__val" style={{ marginTop: "4px", color: "var(--gold)" }}>{result.recommendedRanges?.soilMoisture || "N/A"}</span>
                                    </div>
                                    <div className="fs-sensor-mini" style={{ padding: "16px", border: "1px solid var(--border)", borderRadius: "8px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <span className="fs-sensor-mini__icon" style={{ fontSize: "1.5rem" }}>⚡</span>
                                        <span className="fs-sensor-mini__name" style={{ marginTop: "8px" }}>Soil EC</span>
                                        <span className="fs-sensor-mini__val" style={{ marginTop: "4px", color: "var(--gold)" }}>{result.recommendedRanges?.soilEC || "N/A"}</span>
                                    </div>
                                    <div className="fs-sensor-mini" style={{ padding: "16px", border: "1px solid var(--border)", borderRadius: "8px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <span className="fs-sensor-mini__icon" style={{ fontSize: "1.5rem" }}>🌿</span>
                                        <span className="fs-sensor-mini__name" style={{ marginTop: "8px" }}>Soil NPK</span>
                                        <span className="fs-sensor-mini__val" style={{ marginTop: "4px", color: "var(--gold)", textAlign: "center", fontSize: "0.8rem" }}>{result.recommendedRanges?.soilNPK || "N/A"}</span>
                                    </div>
                                </div>
                                
                                <div className="fs-suggestion" style={{ marginBottom: "24px" }}>
                                    <div className="fs-suggestion__label" style={{ color: "var(--red)" }}>⚠️ AI Risk Warning</div>
                                    {result.feedbackMessage}
                                </div>

                                <div style={{ borderTop: "1px solid var(--border)", paddingTop: "20px" }}>
                                    <h3 style={{ margin: "0 0 12px 0", fontSize: "1.1rem" }}>Register Custom Batch</h3>
                                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                                        <select 
                                            className="fs-search-input" 
                                            style={{ flex: 1 }}
                                            value={registerLocation} 
                                            onChange={e => setRegisterLocation(e.target.value)} 
                                        >
                                            <option value="">Select a Block...</option>
                                            {blocks.map(b => (
                                                <option key={b} value={b}>{b}</option>
                                            ))}
                                        </select>
                                        <button 
                                            className="fs-btn fs-btn--green" 
                                            onClick={handleRegisterBatch}
                                            disabled={registering || !registerLocation}
                                        >
                                            {registering ? "Registering..." : `Register ${cropName} Batch`}
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
