import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { addDays, format, startOfWeek } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import StatusIndicator from "@/components/molecules/StatusIndicator";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Input from "@/components/atoms/Input";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";
import appointmentService from "@/services/api/appointmentService";
import patientService from "@/services/api/patientService";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("day"); // day, week
  const [formData, setFormData] = useState({
    patientId: "",
    doctorId: "",
    department: "",
    date: format(new Date(), "yyyy-MM-dd"),
    timeSlot: "",
    notes: ""
  });

  const departmentOptions = [
    { value: "emergency", label: "Emergency" },
    { value: "cardiology", label: "Cardiology" },
    { value: "neurology", label: "Neurology" },
    { value: "orthopedics", label: "Orthopedics" },
    { value: "pediatrics", label: "Pediatrics" },
    { value: "general", label: "General Medicine" }
  ];

  const timeSlots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
    "05:00 PM", "05:30 PM"
  ];

  const doctorOptions = [
    { value: "dr-smith", label: "Dr. Smith" },
    { value: "dr-johnson", label: "Dr. Johnson" },
    { value: "dr-williams", label: "Dr. Williams" },
    { value: "dr-brown", label: "Dr. Brown" },
    { value: "dr-davis", label: "Dr. Davis" }
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [appointmentsData, patientsData] = await Promise.all([
        appointmentService.getAll(),
        patientService.getAll()
      ]);
      setAppointments(appointmentsData);
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
      const appointmentData = {
        ...formData,
        id: `APT-${Date.now()}`,
        Name: `APT-${Date.now()}`,
        status: "scheduled",
        status_c: "scheduled"
      };

      const newAppointment = await appointmentService.create(appointmentData);
      setAppointments(prev => [newAppointment, ...prev]);
      setShowAddForm(false);
      setFormData({
        patientId: "",
        doctorId: "",
        department: "",
        date: format(new Date(), "yyyy-MM-dd"),
        timeSlot: "",
        notes: ""
      });
      toast.success("Appointment scheduled successfully!");
    } catch (err) {
      toast.error("Failed to schedule appointment");
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      const appointment = appointments.find(a => a.Id === appointmentId);
const updatedAppointment = await appointmentService.update(appointmentId, { 
        ...appointment, 
        status_c: newStatus 
      });
      
      const updatedAppointments = appointments.map(a => 
        a.Id === appointmentId ? updatedAppointment : a
      );
      setAppointments(updatedAppointments);
      toast.success(`Appointment ${newStatus}`);
    } catch (err) {
      toast.error("Failed to update appointment");
    }
  };

  const getFilteredAppointments = () => {
    const selectedDateString = format(selectedDate, "yyyy-MM-dd");
return appointments.filter(apt => 
      format(new Date(apt.date_c || apt.date), "yyyy-MM-dd") === selectedDateString
    );
  };

  const getWeekAppointments = () => {
    const weekStart = startOfWeek(selectedDate);
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    
    return weekDays.map(day => ({
      date: day,
appointments: appointments.filter(apt => 
        format(new Date(apt.date_c || apt.date), "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
      )
    }));
  };

  const getPatientName = (patientId) => {
const patient = patients.find(p => p.Id === patientId);
    return patient ? patient.Name : "Unknown Patient";
  };

  if (loading) return <Loading variant="skeleton" />;
  if (error) return <Error message={error} onRetry={loadData} />;

  const filteredAppointments = getFilteredAppointments();
  const weekAppointments = getWeekAppointments();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Appointment Management
          </h2>
          <p className="text-slate-600 mt-1">Schedule and manage patient appointments</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)}
          variant="primary"
          className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg"
        >
          <ApperIcon name="CalendarPlus" className="w-4 h-4 mr-2" />
          New Appointment
        </Button>
      </div>

      {/* Controls */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Input
              type="date"
              value={format(selectedDate, "yyyy-MM-dd")}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="w-auto"
            />
            <div className="flex bg-slate-100 rounded-lg p-1">
              <Button
                variant={viewMode === "day" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("day")}
                className="px-4"
              >
                Day
              </Button>
              <Button
                variant={viewMode === "week" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("week")}
                className="px-4"
              >
                Week
              </Button>
            </div>
          </div>
          <div className="text-sm text-slate-600">
            {format(selectedDate, "EEEE, MMMM d, yyyy")}
          </div>
        </div>
      </Card>

      {/* Add Appointment Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
        >
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-slate-900">Schedule Appointment</h3>
                <Button variant="ghost" onClick={() => setShowAddForm(false)}>
                  <ApperIcon name="X" className="w-5 h-5" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Patient</label>
                  <select
                    value={formData.patientId}
                    onChange={(e) => setFormData(prev => ({ ...prev, patientId: e.target.value }))}
                    className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    required
                  >
<option value="">Select Patient</option>
                    {patients.map(patient => (
                      <option key={patient.Id} value={patient.Id}>
                        {patient.Name} (ID: {patient.Id})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Doctor</label>
                  <select
                    value={formData.doctorId}
                    onChange={(e) => setFormData(prev => ({ ...prev, doctorId: e.target.value }))}
                    className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    required
                  >
                    <option value="">Select Doctor</option>
                    {doctorOptions.map(doctor => (
                      <option key={doctor.value} value={doctor.value}>{doctor.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    required
                  >
                    <option value="">Select Department</option>
                    {departmentOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Time Slot</label>
                    <select
                      value={formData.timeSlot}
                      onChange={(e) => setFormData(prev => ({ ...prev, timeSlot: e.target.value }))}
                      className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      required
                    >
                      <option value="">Select Time</option>
                      {timeSlots.map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes or special instructions..."
                    className="flex w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[80px]"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" variant="primary" className="flex-1">
                    Schedule Appointment
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

      {/* Appointments View */}
      {viewMode === "day" ? (
        <div>
          {filteredAppointments.length === 0 ? (
            <Empty
              icon="Calendar"
              title="No appointments today"
              description={`No appointments scheduled for ${format(selectedDate, "MMMM d, yyyy")}.`}
              actionLabel="Schedule Appointment"
              onAction={() => setShowAddForm(true)}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredAppointments.map((appointment, index) => (
                <motion.div
                  key={appointment.Id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="p-6 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-accent/20 to-secondary/20 rounded-xl flex items-center justify-center">
                          <ApperIcon name="Clock" className="w-6 h-6 text-accent" />
                        </div>
                        <div>
<h3 className="font-semibold text-slate-900">{appointment.time_slot_c || appointment.timeSlot}</h3>
                        <p className="text-sm text-slate-500">ID: {appointment.Name || appointment.Id}</p>
                        </div>
                      </div>
<StatusIndicator status={appointment.status_c || appointment.status} size="sm" />
                    </div>

                    <div className="space-y-3">
                      <div>
<span className="text-slate-500 text-sm">Patient:</span>
                        <p className="font-medium text-slate-900">{getPatientName(appointment.patient_id_c?.Id || appointment.patient_id_c || appointment.patientId)}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
<span className="text-slate-500">Doctor:</span>
                          <p className="font-medium text-slate-900 capitalize">{appointment.doctor_id_c || appointment.doctorId}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Department:</span>
                          <Badge variant="primary" size="sm" className="capitalize">
                            {appointment.department_c?.Name || appointment.department_c || appointment.department}
                          </Badge>
                        </div>
                      </div>

                      {appointment.notes && (
<div>
                          <span className="text-slate-500 text-sm">Notes:</span>
                          <p className="text-sm text-slate-700 mt-1 bg-slate-50 p-2 rounded-lg">
                            {appointment.notes_c || appointment.notes}
                          </p>
                        </div>
                      )}

<div className="flex gap-2 pt-4">
                        <Button 
                          variant="success" 
                          size="sm" 
                          onClick={() => handleStatusUpdate(appointment.Id, "completed")}
                          disabled={(appointment.status_c || appointment.status) === "completed"}
                          className="flex-1"
                        >
                          Complete
                        </Button>
                        <Button 
                          variant="danger" 
                          size="sm" 
                          onClick={() => handleStatusUpdate(appointment.Id, "cancelled")}
                          disabled={(appointment.status_c || appointment.status) === "cancelled"}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {weekAppointments.map((day, index) => (
            <motion.div
              key={format(day.date, "yyyy-MM-dd")}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {format(day.date, "EEEE, MMM d")}
                  </h3>
                  <Badge variant="primary" size="sm">
                    {day.appointments.length} appointments
                  </Badge>
                </div>
                
                {day.appointments.length === 0 ? (
                  <p className="text-slate-500 text-center py-4">No appointments</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {day.appointments.map((appointment) => (
                      <div key={appointment.Id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
<div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-slate-900">{appointment.time_slot_c || appointment.timeSlot}</span>
                          <StatusIndicator status={appointment.status_c || appointment.status} size="sm" />
                        </div>
                        <p className="text-sm text-slate-600">{getPatientName(appointment.patient_id_c?.Id || appointment.patient_id_c || appointment.patientId)}</p>
                        <p className="text-xs text-slate-500 capitalize">{appointment.department_c?.Name || appointment.department_c || appointment.department}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Appointments;