import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import StatusIndicator from "@/components/molecules/StatusIndicator";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import departmentService from "@/services/api/departmentService";
import patientService from "@/services/api/patientService";

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    capacity: "",
    activeStaff: "",
    currentQueue: 0,
    averageWaitTime: 30
  });
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [departmentsData, patientsData] = await Promise.all([
        departmentService.getAll(),
        patientService.getAll()
      ]);
      setDepartments(departmentsData);
      setPatients(patientsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
}, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
const departmentData = {
        ...formData,
        capacity: parseInt(formData.capacity),
        active_staff_c: parseInt(formData.activeStaff),
        current_queue_c: 0,
        average_wait_time_c: 30
      };

      const newDepartment = await departmentService.create(departmentData);
      setDepartments(prev => [newDepartment, ...prev]);
      setShowAddForm(false);
      setFormData({
        name: "",
        description: "",
        capacity: "",
        activeStaff: "",
        currentQueue: 0,
        averageWaitTime: 30
      });
      toast.success("Department added successfully!");
    } catch (err) {
      toast.error("Failed to add department");
    }
  };

  const getDepartmentPatients = (departmentName) => {
return patients.filter(patient => {
      const dept = patient.current_department_c?.Name || patient.current_department_c || patient.currentDepartment;
      return dept && dept.toLowerCase() === departmentName.toLowerCase();
    });
  };

  const movePatientToNextStage = async (patientId, currentDepartment) => {
    try {
      const patient = patients.find(p => p.Id === patientId);
      if (!patient) return;

const currentStatus = patient.status_c || patient.status;
      const nextStatus = currentStatus === "waiting" ? "admitted" : "discharged";
      const updatedPatient = await patientService.update(patientId, {
        ...patient,
        status_c: nextStatus
      });

      setPatients(prev => prev.map(p => p.Id === patientId ? updatedPatient : p));
      toast.success(`Patient moved to ${nextStatus}`);
    } catch (err) {
      toast.error("Failed to update patient status");
    }
  };

const getDepartmentIcon = (departmentName) => {
    // Add null safety check to prevent TypeError
    if (!departmentName || typeof departmentName !== 'string') {
      return "Building2";
    }
    
    const icons = {
      emergency: "AlertTriangle",
      cardiology: "Heart",
      neurology: "Brain",
      orthopedics: "Bone",
      pediatrics: "Baby",
      general: "Stethoscope"
    };
    return icons[departmentName.toLowerCase()] || "Building2";
  };

  const getDepartmentColor = (departmentName) => {
    // Add null safety check to prevent TypeError
    if (!departmentName || typeof departmentName !== 'string') {
      return "primary";
    }
    
    const colors = {
      emergency: "error",
      cardiology: "danger",
      neurology: "info",
      orthopedics: "warning",
      pediatrics: "success",
      general: "primary"
    };
    return colors[departmentName.toLowerCase()] || "primary";
  };

  const getWaitTimeColor = (waitTime) => {
    if (waitTime > 60) return "danger";
    if (waitTime > 30) return "warning";
    return "success";
  };

  if (loading) return <Loading variant="skeleton" />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Department Management
          </h2>
          <p className="text-slate-600 mt-1">Monitor queues and workflow across departments</p>
        </div>
<div className="flex items-center space-x-2">
          <Button 
            onClick={() => setShowAddForm(true)}
            variant="primary"
            className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg"
          >
            <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
            Add Department
          </Button>
          <Button variant="ghost" size="sm" onClick={loadData}>
            <ApperIcon name="RefreshCw" className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="ghost" size="sm">
            <ApperIcon name="Settings" className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
</div>

      {/* Add Department Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
        >
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-slate-900">Add New Department</h3>
                <Button variant="ghost" onClick={() => setShowAddForm(false)}>
                  <ApperIcon name="X" className="w-5 h-5" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Department Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="e.g., Cardiology, Emergency"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Capacity</label>
                    <input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                      className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="50"
                      min="1"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Active Staff</label>
                    <input
                      type="number"
                      value={formData.activeStaff}
                      onChange={(e) => setFormData(prev => ({ ...prev, activeStaff: e.target.value }))}
                      className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="5"
                      min="1"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Average Wait Time (minutes)</label>
                    <input
                      type="number"
                      value={formData.averageWaitTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, averageWaitTime: parseInt(e.target.value) }))}
                      className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="30"
                      min="0"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the department's services and specialties..."
                    className="flex w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[100px]"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" variant="primary" className="flex-1">
                    Add Department
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Department Cards Grid */}
      {departments.length === 0 ? (
        <Empty
          icon="Building2"
          title="No departments found"
          description="No departments are currently configured in the system."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((department, index) => {
const departmentPatients = getDepartmentPatients(department.Name);
            const waitingPatients = departmentPatients.filter(p => (p.status_c || p.status) === "waiting");
            const admittedPatients = departmentPatients.filter(p => (p.status_c || p.status) === "admitted");
            
            return (
              <motion.div
                key={department.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                onClick={() => setSelectedDepartment(selectedDepartment === department.Id ? null : department.Id)}
                className="cursor-pointer"
              >
                <Card className={`p-6 transition-all duration-300 ${selectedDepartment === department.Id ? 'ring-2 ring-primary shadow-lg transform scale-[1.02]' : 'hover:shadow-lg hover:-translate-y-1'}`}>
                  <div className="flex items-center justify-between mb-4">
<div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 bg-gradient-to-br from-${getDepartmentColor(department.Name)}/20 to-${getDepartmentColor(department.Name)}/30 rounded-xl flex items-center justify-center`}>
                        <ApperIcon 
                          name={getDepartmentIcon(department.Name)} 
                          className={`w-6 h-6 text-${getDepartmentColor(department.Name)}`} 
                        />
                      </div>
                      <div>
                      <h3 className="font-semibold text-slate-900 capitalize">{department.Name}</h3>
                      <p className="text-sm text-slate-500">Department</p>
                    </div>
                    </div>
                    <Badge 
variant={getWaitTimeColor(department.average_wait_time_c || department.averageWaitTime)}
                      size="sm"
                    >
                      {department.average_wait_time_c || department.averageWaitTime} min
                    </Badge>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <p className="text-2xl font-bold text-warning">{waitingPatients.length}</p>
                      <p className="text-xs text-slate-600">Waiting</p>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <p className="text-2xl font-bold text-info">{admittedPatients.length}</p>
                      <p className="text-xs text-slate-600">Admitted</p>
                    </div>
                  </div>

                  {/* Current Queue */}
<div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-slate-600">Current Queue</span>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full bg-${getDepartmentColor(department.Name)}`}></div>
                      <span className="text-lg font-bold text-slate-900">{department.current_queue_c || department.currentQueue}</span>
                    </div>
                  </div>

                  {/* Staff */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Active Staff</span>
                    <div className="flex items-center space-x-1">
                      <ApperIcon name="Users" className="w-4 h-4 text-slate-400" />
<span className="font-medium text-slate-900">{department.active_staff_c || department.activeStaff}</span>
                    </div>
                  </div>

                  {/* Expand indicator */}
                  <div className="flex justify-center mt-4 pt-4 border-t border-slate-100">
                    <ApperIcon 
                      name={selectedDepartment === department.Id ? "ChevronUp" : "ChevronDown"} 
                      className="w-4 h-4 text-slate-400" 
                    />
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Detailed Department View */}
      {selectedDepartment && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-6">
            {(() => {
const department = departments.find(d => d.Id === selectedDepartment);
              const departmentPatients = getDepartmentPatients(department.Name);
              
              return (
                <>
                  <div className="flex items-center justify-between mb-6">
<h3 className="text-xl font-semibold text-slate-900 capitalize">
                      {department.Name} - Patient Queue
                    </h3>
                    <Button 
                      variant="ghost" 
                      onClick={() => setSelectedDepartment(null)}
                    >
                      <ApperIcon name="X" className="w-4 h-4" />
                    </Button>
                  </div>

                  {departmentPatients.length === 0 ? (
                    <Empty
                      icon="Users"
                      title="No patients in queue"
description={`No patients are currently in the ${department.Name} department.`}
                    />
                  ) : (
                    <div className="space-y-4">
                      {departmentPatients.map((patient, index) => (
                        <motion.div
                          key={patient.Id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors duration-200"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center text-primary font-bold text-sm">
                              {index + 1}
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center">
                                <ApperIcon name="User" className="w-5 h-5 text-slate-600" />
                              </div>
<div>
                                <p className="font-medium text-slate-900">{patient.Name}</p>
                                <p className="text-sm text-slate-500">ID: {patient.Id} • Age: {patient.age_c || patient.age}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4">
<StatusIndicator status={patient.status_c || patient.status} size="sm" />
                            <div className="flex items-center space-x-2">
{(patient.status_c || patient.status) === "waiting" && (
                                <Button
                                  variant="primary"
size="sm"
                                  onClick={() => movePatientToNextStage(patient.Id, department.Name)}
                                >
                                  <ApperIcon name="ArrowRight" className="w-4 h-4 mr-1" />
                                  Admit
                                </Button>
                              )}
{(patient.status_c || patient.status) === "admitted" && (
                                <Button
                                  variant="success"
size="sm"
                                  onClick={() => movePatientToNextStage(patient.Id, department.Name)}
                                >
                                  <ApperIcon name="Check" className="w-4 h-4 mr-1" />
                                  Discharge
                                </Button>
                              )}
                              <Button variant="ghost" size="sm">
                                <ApperIcon name="MoreVertical" className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default Departments;