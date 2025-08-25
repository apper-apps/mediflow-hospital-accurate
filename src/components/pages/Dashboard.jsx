import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import StatusIndicator from "@/components/molecules/StatusIndicator";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Beds from "@/components/pages/Beds";
import Patients from "@/components/pages/Patients";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import appointmentService from "@/services/api/appointmentService";
import patientService from "@/services/api/patientService";
import bedService from "@/services/api/bedService";
import departmentService from "@/services/api/departmentService";

const Dashboard = () => {
const [dashboardData, setDashboardData] = useState({
    stats: {},
    recentPatients: [],
    todayAppointments: [],
    departmentStatus: [],
    bedOccupancy: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [patients, appointments, beds, departments] = await Promise.all([
        patientService.getAll(),
        appointmentService.getAll(),
        bedService.getAll(),
        departmentService.getAll()
      ]);

      // Calculate stats
      const today = new Date().toDateString();
      const todayAppointments = appointments.filter(apt => 
        new Date(apt.date_c || apt.date).toDateString() === today
      );
      
      const occupiedBeds = beds.filter(bed => bed.is_occupied_c || bed.isOccupied);
      const admittedPatients = patients.filter(patient => (patient.status_c || patient.status) === "admitted");

      const stats = {
        totalPatients: patients.length,
        admittedPatients: admittedPatients.length,
        todayAppointments: todayAppointments.length,
        availableBeds: beds.length - occupiedBeds.length,
        bedOccupancyRate: beds.length > 0 ? Math.round((occupiedBeds.length / beds.length) * 100) : 0
      };

      // Recent patients (last 5)
      const recentPatients = patients
        .sort((a, b) => new Date(b.admission_date_c || b.admissionDate || 0) - new Date(a.admission_date_c || a.admissionDate || 0))
        .slice(0, 5);

      // Bed occupancy by ward
      const bedOccupancy = beds.reduce((acc, bed) => {
        const wardName = bed.ward_name_c || bed.wardName;
        if (!acc[wardName]) {
          acc[wardName] = { total: 0, occupied: 0 };
        }
        acc[wardName].total++;
        if (bed.is_occupied_c || bed.isOccupied) {
          acc[wardName].occupied++;
        }
        return acc;
      }, {});

      setDashboardData({
        stats,
        recentPatients,
        todayAppointments,
        departmentStatus: departments,
        bedOccupancy
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);
  if (loading) return <Loading variant="skeleton" />;
  if (error) return <Error message={error} onRetry={loadDashboardData} />;

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Total Patients</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {dashboardData.stats.totalPatients}
                </p>
                <p className="text-xs text-slate-500 mt-1">Registered patients</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                <ApperIcon name="Users" className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="p-6 bg-gradient-to-br from-info/5 to-info/10 border-info/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Admitted</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-info to-info/80 bg-clip-text text-transparent">
                  {dashboardData.stats.admittedPatients}
                </p>
                <p className="text-xs text-slate-500 mt-1">Currently admitted</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-info to-info/80 rounded-xl flex items-center justify-center">
                <ApperIcon name="UserCheck" className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="p-6 bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Today's Appointments</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
                  {dashboardData.stats.todayAppointments}
                </p>
                <p className="text-xs text-slate-500 mt-1">Scheduled today</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-accent to-secondary rounded-xl flex items-center justify-center">
                <ApperIcon name="Calendar" className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="p-6 bg-gradient-to-br from-success/5 to-success/10 border-success/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Available Beds</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-success to-success/80 bg-clip-text text-transparent">
                  {dashboardData.stats.availableBeds}
                </p>
                <p className="text-xs text-slate-500 mt-1">{dashboardData.stats.bedOccupancyRate}% occupancy</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-success to-success/80 rounded-xl flex items-center justify-center">
                <ApperIcon name="Bed" className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Patients */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Recent Patients</h3>
              <Button variant="ghost" size="sm">
                <ApperIcon name="MoreHorizontal" className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              {dashboardData.recentPatients.map((patient) => (
                <div key={patient.Id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center">
                      <ApperIcon name="User" className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
<p className="font-medium text-slate-900">{patient.Name}</p>
                      <p className="text-sm text-slate-500">ID: {patient.Id}</p>
                    </div>
                  </div>
                  <div className="text-right">
<StatusIndicator status={patient.status_c} size="sm" />
                    <p className="text-xs text-slate-500 mt-1">{patient.current_department_c?.Name || patient.current_department_c || patient.currentDepartment}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Today's Appointments */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Today's Appointments</h3>
              <Button variant="ghost" size="sm">
                <ApperIcon name="Calendar" className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              {dashboardData.todayAppointments.slice(0, 5).map((appointment) => (
                <div key={appointment.Id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-accent/20 to-secondary/20 rounded-full flex items-center justify-center">
                      <ApperIcon name="Clock" className="w-5 h-5 text-accent" />
                    </div>
                    <div>
<p className="font-medium text-slate-900">{appointment.time_slot_c}</p>
                      <p className="text-sm text-slate-500">{appointment.department_c?.Name || appointment.department_c || appointment.department}</p>
                    </div>
                  </div>
                  <div className="text-right">
<StatusIndicator status={appointment.status_c} size="sm" />
<p className="text-xs text-slate-500 mt-1">Dr. {appointment.doctor_id_c}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Department Status & Bed Occupancy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Department Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Department Status</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {dashboardData.departmentStatus.map((dept) => (
                <div key={dept.Id} className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
<h4 className="font-medium text-slate-900">{dept.Name}</h4>
<Badge variant="primary" size="sm">{dept.active_staff_c} staff</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Queue:</span>
<span className="font-medium text-slate-900">{dept.current_queue_c} patients</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Wait time:</span>
<span className="font-medium text-warning">{dept.average_wait_time_c} min</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Bed Occupancy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Ward Occupancy</h3>
            <div className="space-y-4">
              {Object.entries(dashboardData.bedOccupancy).map(([wardName, data]) => {
                const occupancyPercent = Math.round((data.occupied / data.total) * 100);
                return (
                  <div key={wardName} className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-slate-900">{wardName}</h4>
                      <Badge 
                        variant={occupancyPercent > 80 ? "danger" : occupancyPercent > 60 ? "warning" : "success"}
                        size="sm"
                      >
                        {occupancyPercent}%
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-slate-600">Occupied:</span>
                      <span className="font-medium text-slate-900">{data.occupied} / {data.total}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          occupancyPercent > 80 ? 'bg-gradient-to-r from-error to-error/80' :
                          occupancyPercent > 60 ? 'bg-gradient-to-r from-warning to-warning/80' :
                          'bg-gradient-to-r from-success to-success/80'
                        }`}
                        style={{ width: `${occupancyPercent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;