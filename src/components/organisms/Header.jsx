import { useState, useContext } from "react";
import { useLocation } from "react-router-dom";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";
import { AuthContext } from "../../App";

const Header = ({ onMenuClick }) => {
  const location = useLocation();
  const { logout } = useContext(AuthContext);
  
  const pageConfig = {
    "/": { title: "Dashboard", subtitle: "Hospital Overview & Analytics" },
    "/patients": { title: "Patients", subtitle: "Patient Records & Management" },
    "/appointments": { title: "Appointments", subtitle: "Schedule & Booking Management" },
    "/departments": { title: "Departments", subtitle: "Queue & Workflow Management" },
    "/beds": { title: "Beds", subtitle: "Ward & Occupancy Management" }
  };

  const currentPage = pageConfig[location.pathname] || { title: "MediFlow", subtitle: "Hospital Management System" };

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-6 lg:px-8">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-slate-100"
          >
            <ApperIcon name="Menu" className="w-5 h-5" />
          </Button>
          
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-primary bg-clip-text text-transparent">
              {currentPage.title}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">{currentPage.subtitle}</p>
          </div>
        </div>

        {/* Right Section */}
<div className="flex items-center space-x-4">
          {/* Quick Actions */}
          <div className="hidden md:flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-slate-600 hover:text-primary">
              <ApperIcon name="Bell" className="w-4 h-4 mr-2" />
              <span className="hidden lg:inline">Alerts</span>
            </Button>
            <Button variant="ghost" size="sm" className="text-slate-600 hover:text-primary">
              <ApperIcon name="Settings" className="w-4 h-4 mr-2" />
              <span className="hidden lg:inline">Settings</span>
            </Button>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-success/10 to-success/20 border border-success/30 rounded-lg">
            <div className="w-2 h-2 bg-success rounded-full pulse-green"></div>
            <span className="text-sm font-medium text-success">Online</span>
          </div>

          {/* Logout Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={logout}
            className="text-slate-600 hover:text-error"
          >
            <ApperIcon name="LogOut" className="w-4 h-4 mr-2" />
            <span className="hidden lg:inline">Logout</span>
          </Button>

          {/* Emergency Button */}
          <Button 
            variant="danger"
            size="sm"
            className="bg-gradient-to-r from-error to-error/80 hover:from-error/90 hover:to-error/70 shadow-lg"
          >
            <ApperIcon name="AlertTriangle" className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Emergency</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;