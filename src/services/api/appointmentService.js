class AppointmentService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'appointment_c';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          {
            field: {
              Name: "Name"
            }
          },
          {
            field: {
              Name: "patient_id_c"
            }
          },
          {
            field: {
              Name: "doctor_id_c"
            }
          },
          {
            field: {
              Name: "department_c"
            }
          },
          {
            field: {
              Name: "date_c"
            }
          },
          {
            field: {
              Name: "time_slot_c"
            }
          },
          {
            field: {
              Name: "status_c"
            }
          },
          {
            field: {
              Name: "notes_c"
            }
          }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching appointments:", error?.response?.data?.message);
      } else {
        console.error(error);
      }
      return [];
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          {
            field: {
              Name: "Name"
            }
          },
          {
            field: {
              Name: "patient_id_c"
            }
          },
          {
            field: {
              Name: "doctor_id_c"
            }
          },
          {
            field: {
              Name: "department_c"
            }
          },
          {
            field: {
              Name: "date_c"
            }
          },
          {
            field: {
              Name: "time_slot_c"
            }
          },
          {
            field: {
              Name: "status_c"
            }
          },
          {
            field: {
              Name: "notes_c"
            }
          }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, id, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching appointment with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(error);
      }
      return null;
    }
  }

  async create(appointmentData) {
    try {
      const params = {
        records: [{
          Name: appointmentData.Name || appointmentData.id,
          patient_id_c: parseInt(appointmentData.patientId || appointmentData.patient_id_c),
          doctor_id_c: appointmentData.doctorId || appointmentData.doctor_id_c,
          department_c: appointmentData.department || appointmentData.department_c,
          date_c: appointmentData.date || appointmentData.date_c,
          time_slot_c: appointmentData.timeSlot || appointmentData.time_slot_c,
          status_c: appointmentData.status || appointmentData.status_c || 'scheduled',
          notes_c: appointmentData.notes || appointmentData.notes_c
        }]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create appointments ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              console.error(`${error.fieldLabel}: ${error}`);
            });
          });
        }
        
        return successfulRecords.length > 0 ? successfulRecords[0].data : null;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating appointment:", error?.response?.data?.message);
      } else {
        console.error(error);
      }
      throw error;
    }
  }

  async update(id, appointmentData) {
    try {
      const params = {
        records: [{
          Id: id,
          Name: appointmentData.Name || appointmentData.id,
          patient_id_c: parseInt(appointmentData.patientId || appointmentData.patient_id_c),
          doctor_id_c: appointmentData.doctorId || appointmentData.doctor_id_c,
          department_c: appointmentData.department || appointmentData.department_c,
          date_c: appointmentData.date || appointmentData.date_c,
          time_slot_c: appointmentData.timeSlot || appointmentData.time_slot_c,
          status_c: appointmentData.status || appointmentData.status_c,
          notes_c: appointmentData.notes || appointmentData.notes_c
        }]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update appointments ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              console.error(`${error.fieldLabel}: ${error}`);
            });
          });
        }
        
        return successfulUpdates.length > 0 ? successfulUpdates[0].data : null;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating appointment:", error?.response?.data?.message);
      } else {
        console.error(error);
      }
      throw error;
    }
  }

  async delete(id) {
    try {
      const params = {
        RecordIds: [id]
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete appointments ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) console.error(record.message);
          });
        }
        
        return successfulDeletions.length > 0;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting appointment:", error?.response?.data?.message);
      } else {
        console.error(error);
      }
      throw error;
    }
  }
}
export default new AppointmentService();