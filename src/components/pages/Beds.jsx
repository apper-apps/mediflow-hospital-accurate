import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import StatusIndicator from "@/components/molecules/StatusIndicator";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";
import patientService from "@/services/api/patientService";
import bedService from "@/services/api/bedService";
const Beds = () => {
  const [beds, setBeds] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWard, setSelectedWard] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // grid, list

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [bedsData, patientsData] = await Promise.all([
        bedService.getAll(),
        patientService.getAll()
      ]);
      setBeds(bedsData);
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

  const getPatientByBed = (bedId) => {
const bed = beds.find(b => b.Id === bedId);
    if (!bed || !(bed.patient_id_c || bed.patientId)) return null;
    const patientId = bed.patient_id_c?.Id || bed.patient_id_c || bed.patientId;
    return patients.find(p => p.Id === patientId);
  };

  const getWards = () => {
const wardSet = new Set(beds.map(bed => bed.ward_name_c || bed.wardName));
    return Array.from(wardSet);
  };

  const getFilteredBeds = () => {
if (selectedWard === "all") return beds;
    return beds.filter(bed => (bed.ward_name_c || bed.wardName) === selectedWard);
  };

  const getWardStats = (wardName) => {
const wardBeds = beds.filter(bed => (bed.ward_name_c || bed.wardName) === wardName);
    const occupied = wardBeds.filter(bed => bed.is_occupied_c || bed.isOccupied).length;
    const total = wardBeds.length;
    const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;
    
    return { occupied, total, available: total - occupied, occupancyRate };
  };

const [showAddModal, setShowAddModal] = useState(false);
  const [addingBed, setAddingBed] = useState(false);

  const handleBedAction = async (bedId, action) => {
    try {
      const bed = beds.find(b => b.Id === bedId);
      if (!bed) return;

      let updatedBed;
      if (action === "occupy") {
        // In a real app, you'd have a patient selection modal
updatedBed = await bedService.update(bedId, {
          ...bed,
          is_occupied_c: true,
          patient_id_c: patients[0]?.Id || null, // Using first available patient for demo
          admitted_date_c: new Date().toISOString()
        });
        toast.success("Bed assigned to patient");
      } else if (action === "discharge") {
updatedBed = await bedService.update(bedId, {
          ...bed,
          is_occupied_c: false,
          patient_id_c: null,
          admitted_date_c: null
        });
        toast.success("Bed is now available");
      }

      setBeds(prev => prev.map(b => b.Id === bedId ? updatedBed : b));
    } catch (err) {
      toast.error("Failed to update bed status");
    }
  };

  const handleAddBed = async (bedData) => {
    try {
      setAddingBed(true);
const newBed = await bedService.create({
        bed_number_c: bedData.bedNumber,
        ward_name_c: bedData.wardName,
        bedType: bedData.bedType || "Standard",
        is_occupied_c: false,
        patient_id_c: null,
        admitted_date_c: null,
        isClean: true,
        maintenanceStatus: "operational"
      });
      
      setBeds(prev => [newBed, ...prev]);
      setShowAddModal(false);
      toast.success("New bed added successfully");
    } catch (err) {
      toast.error("Failed to add new bed");
    } finally {
      setAddingBed(false);
    }
  };

  const wards = getWards();
  const filteredBeds = getFilteredBeds();

  if (loading) return <Loading variant="skeleton" />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Bed Management
          </h2>
          <p className="text-slate-600 mt-1">Monitor bed occupancy and ward capacity</p>
        </div>
<div className="flex items-center space-x-3">
          <Button
            variant="primary"
            size="md"
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
          >
            <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
            Add Bed
          </Button>
          
          <div className="flex bg-slate-100 rounded-lg p-1">
            <Button
              variant={viewMode === "grid" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="px-4"
            >
              <ApperIcon name="Grid3X3" className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="px-4"
            >
              <ApperIcon name="List" className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Ward Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {wards.map((wardName, index) => {
          const stats = getWardStats(wardName);
          return (
            <motion.div
              key={wardName}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer"
                    onClick={() => setSelectedWard(selectedWard === wardName ? "all" : wardName)}>
                <div className="flex items-center justify-between mb-4">
                  <div>
<h3 className="font-semibold text-slate-900">{wardName}</h3>
                    <p className="text-sm text-slate-500">Ward</p>
                  </div>
                  <Badge 
                    variant={stats.occupancyRate > 80 ? "danger" : stats.occupancyRate > 60 ? "warning" : "success"}
                    size="sm"
                  >
                    {stats.occupancyRate}%
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Occupied:</span>
                    <span className="font-medium text-error">{stats.occupied}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Available:</span>
                    <span className="font-medium text-success">{stats.available}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Total:</span>
                    <span className="font-medium text-slate-900">{stats.total}</span>
                  </div>
                  
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        stats.occupancyRate > 80 ? 'bg-gradient-to-r from-error to-error/80' :
                        stats.occupancyRate > 60 ? 'bg-gradient-to-r from-warning to-warning/80' :
                        'bg-gradient-to-r from-success to-success/80'
                      }`}
                      style={{ width: `${stats.occupancyRate}%` }}
                    ></div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Ward Filter */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={selectedWard === "all" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setSelectedWard("all")}
          >
            All Wards
          </Button>
          {wards.map((wardName) => (
            <Button
              key={wardName}
              variant={selectedWard === wardName ? "primary" : "ghost"}
              size="sm"
              onClick={() => setSelectedWard(wardName)}
            >
              {wardName}
            </Button>
          ))}
        </div>
      </Card>

      {/* Beds Display */}
      {filteredBeds.length === 0 ? (
        <Empty
          icon="Bed"
          title="No beds found"
          description="No beds match your current filter criteria."
        />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {filteredBeds.map((bed, index) => {
            const patient = getPatientByBed(bed.Id);
            return (
              <motion.div
                key={bed.Id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group"
              >
                <Card className={`p-4 aspect-square flex flex-col items-center justify-center transition-all duration-200 cursor-pointer ${
(bed.is_occupied_c || bed.isOccupied) 
                    ? 'bg-gradient-to-br from-error/5 to-error/10 border-error/20 hover:border-error/40' 
                    : 'bg-gradient-to-br from-success/5 to-success/10 border-success/20 hover:border-success/40'
                } hover:shadow-lg hover:scale-105`}>
                  
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
(bed.is_occupied_c || bed.isOccupied) 
                      ? 'bg-gradient-to-br from-error/20 to-error/30' 
                      : 'bg-gradient-to-br from-success/20 to-success/30'
                  }`}>
                    <ApperIcon 
                      name="Bed" 
                      className={`w-4 h-4 ${(bed.is_occupied_c || bed.isOccupied) ? 'text-error' : 'text-success'}`} 
                    />
                  </div>
                  
<div className="text-center">
                    <p className="font-semibold text-slate-900 text-sm">{bed.bed_number_c || bed.bedNumber}</p>
                    <p className="text-xs text-slate-500 mb-1">{bed.ward_name_c || bed.wardName}</p>
                    <StatusIndicator 
                      status={(bed.is_occupied_c || bed.isOccupied) ? "occupied" : "available"} 
                      size="sm" 
                      showDot={false}
                    />
                  </div>

                  {patient && (
                    <div className="mt-2 text-center">
<p className="text-xs font-medium text-slate-700 truncate max-w-full">
                        {patient.Name}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons - Show on Hover */}
<div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl flex items-center justify-center">
{(bed.is_occupied_c || bed.isOccupied) ? (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBedAction(bed.Id, "discharge");
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <ApperIcon name="UserMinus" className="w-3 h-3" />
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBedAction(bed.Id, "occupy");
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <ApperIcon name="UserPlus" className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBeds.map((bed, index) => {
            const patient = getPatientByBed(bed.Id);
            return (
              <motion.div
                key={bed.Id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        bed.isOccupied 
                          ? 'bg-gradient-to-br from-error/20 to-error/30' 
                          : 'bg-gradient-to-br from-success/20 to-success/30'
                      }`}>
                        <ApperIcon 
                          name="Bed" 
                          className={`w-6 h-6 ${bed.isOccupied ? 'text-error' : 'text-success'}`} 
                        />
                      </div>
                      <div>
<h3 className="font-semibold text-slate-900">Bed {bed.bed_number_c || bed.bedNumber}</h3>
                        <p className="text-slate-500">{bed.ward_name_c || bed.wardName} Ward</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
<StatusIndicator status={(bed.is_occupied_c || bed.isOccupied) ? "occupied" : "available"} />
                      
{(bed.is_occupied_c || bed.isOccupied) ? (
                        <div className="text-right mr-4">
                          {patient && (
                            <>
<p className="font-medium text-slate-900">{patient.Name}</p>
                              <p className="text-sm text-slate-500">ID: {patient.Id}</p>
                            </>
                          )}
{(bed.admitted_date_c || bed.admittedDate) && (
                            <p className="text-xs text-slate-400">
                              Admitted: {new Date(bed.admitted_date_c || bed.admittedDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="text-right mr-4">
                          <p className="text-slate-500">Available for admission</p>
                        </div>
                      )}

                      <div className="flex space-x-2">
{(bed.is_occupied_c || bed.isOccupied) ? (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleBedAction(bed.Id, "discharge")}
                          >
                            <ApperIcon name="UserMinus" className="w-4 h-4 mr-2" />
                            Discharge
                          </Button>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleBedAction(bed.Id, "occupy")}
                          >
                            <ApperIcon name="UserPlus" className="w-4 h-4 mr-2" />
                            Admit Patient
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <ApperIcon name="MoreVertical" className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
</div>
      )}
    </div>
  );
};
const AddBedModal = ({ showAddModal, setShowAddModal, handleAddBed, addingBed, wards }) => {
  if (!showAddModal) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md"
      >
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Add New Bed</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddModal(false)}
              className="p-2"
            >
              <ApperIcon name="X" className="w-4 h-4" />
            </Button>
          </div>

          <AddBedForm
            onSubmit={handleAddBed}
            onCancel={() => setShowAddModal(false)}
            isLoading={addingBed}
            existingWards={wards}
          />
        </Card>
      </motion.div>
    </div>
  );
};

// Add Bed Form Component
const AddBedForm = ({ onSubmit, onCancel, isLoading, existingWards }) => {
  const [formData, setFormData] = useState({
    bedNumber: '',
    wardName: '',
    bedType: 'Standard'
  });
  const [errors, setErrors] = useState({});

  const bedTypes = ['Standard', 'ICU', 'Emergency', 'Pediatric', 'Maternity', 'Surgical'];

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.bedNumber.trim()) {
      newErrors.bedNumber = 'Bed number is required';
    }
    
    if (!formData.wardName.trim()) {
      newErrors.wardName = 'Ward name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Bed Number *
        </label>
        <input
          type="text"
          value={formData.bedNumber}
          onChange={(e) => handleChange('bedNumber', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${
            errors.bedNumber ? 'border-error' : 'border-slate-300'
          }`}
          placeholder="e.g., A101, B205"
        />
        {errors.bedNumber && (
          <p className="text-sm text-error mt-1">{errors.bedNumber}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Ward Name *
        </label>
        <div className="relative">
          <input
            type="text"
            value={formData.wardName}
            onChange={(e) => handleChange('wardName', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${
              errors.wardName ? 'border-error' : 'border-slate-300'
            }`}
            placeholder="Enter ward name"
            list="ward-suggestions"
          />
          <datalist id="ward-suggestions">
            {existingWards.map(ward => (
              <option key={ward} value={ward} />
            ))}
          </datalist>
        </div>
        {errors.wardName && (
          <p className="text-sm text-error mt-1">{errors.wardName}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Bed Type
        </label>
        <select
          value={formData.bedType}
          onChange={(e) => handleChange('bedType', e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
        >
          {bedTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div className="flex space-x-3 pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Adding...
            </>
          ) : (
            <>
              <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
              Add Bed
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default Beds;