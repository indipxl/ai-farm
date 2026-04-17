import { Link, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

const NAV_ITEMS = [
    { path: "/dashboard", icon: "🏠", label: "Dashboard", section: "Main" },
    { path: "/soil-health", icon: "🪱", label: "Soil Health", section: "Monitoring" },
    { path: "/disease-map", icon: "🗺️", label: "Disease Map", section: "Monitoring" },
    { path: "/batch-profiles", icon: "🌱", label: "Batch Profiles", section: "Configuration" },
    { path: "/crop-profiles", icon: "🌱", label: "Crop Profiles", section: "Configuration" },
    { path: "/customization", icon: "✨", label: "AI Customization", section: "Configuration" },
];

export default function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate("/login");
        } catch (err) {
            console.error("Logout failed", err);
        }
    };

    const groupedNav = NAV_ITEMS.reduce((acc, item) => {
        if (!acc[item.section]) acc[item.section] = [];
        acc[item.section].push(item);
        return acc;
    }, {});

    return (
        <aside className={`fs-sidebar${isCollapsed ? " fs-sidebar--collapsed" : ""}`}>
            <button
                className="fs-sidebar__toggle"
                onClick={() => setIsCollapsed(!isCollapsed)}
                title="Toggle Sidebar"
            >
                {isCollapsed ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="3" x2="21" y1="6" y2="6" />
                        <line x1="3" x2="21" y2="12" />
                        <line x1="3" x2="21" y3="18" />
                    </svg>
                )}
            </button>
            <div className="fs-sidebar__brand">
                <div className="fs-sidebar__logo">🌿</div>
                <div className="fs-sidebar__name"><span>Ai</span> Farm</div>
            </div>
            <div className="fs-sidebar__farm">
                <div className="fs-sidebar__farm-label">Active Farm</div>
                <div className="fs-sidebar__farm-name">Kota Kinabalu · KK-001</div>
            </div>
            <nav className="fs-sidebar__nav">
                {Object.entries(groupedNav).map(([section, items]) => (
                    <div key={section}>
                        <div className="fs-sidebar__section-label">{section}</div>
                        {items.map(item => (
                            <Link key={item.path} to={item.path} className={`fs-nav-item${location.pathname === item.path ? " fs-nav-item--active" : ""}`} title={isCollapsed ? item.label : ""}>
                                <span className="fs-nav-item__icon">{item.icon}</span>
                                <span className="fs-nav-item__label">{item.label}</span>
                            </Link>
                        ))}
                    </div>
                ))}
            </nav>
            <button className="fs-nav-item fs-sidebar__logout" onClick={handleLogout}>
                <span className="fs-nav-item__icon">🚪</span>
                <span className="fs-nav-item__label">Logout</span>
            </button>
            <div className="fs-sidebar__footer">
                <div className="fs-sidebar__avatar">JD</div>
                <div>
                    <div className="fs-sidebar__user-name">John Doe</div>
                    <div className="fs-sidebar__user-role">Farm Manager</div>
                </div>
            </div>
        </aside>
    );
}