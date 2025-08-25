class PatientService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'patient_c';
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
              Name: "age_c"
            }
          },
          {
            field: {
              Name: "gender_c"
            }
          },
          {
            field: {
              Name: "phone_c"
            }
          },
          {
            field: {
              Name: "emergency_contact_c"
            }
          },
          {
            field: {
              Name: "blood_group_c"
            }
          },
          {
            field: {
              Name: "allergies_c"
            }
          },
          {
            field: {
              Name: "current_department_c"
            }
          },
          {
            field: {
              Name: "status_c"
            }
          },
          {
            field: {
              Name: "admission_date_c"
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
        console.error("Error fetching patients:", error?.response?.data?.message);
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
              Name: "age_c"
            }
          },
          {
            field: {
              Name: "gender_c"
            }
          },
          {
            field: {
              Name: "phone_c"
            }
          },
          {
            field: {
              Name: "emergency_contact_c"
            }
          },
          {
            field: {
              Name: "blood_group_c"
            }
          },
          {
            field: {
              Name: "allergies_c"
            }
          },
          {
            field: {
              Name: "current_department_c"
            }
          },
          {
            field: {
              Name: "status_c"
            }
          },
          {
            field: {
              Name: "admission_date_c"
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
        console.error(`Error fetching patient with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(error);
      }
      return null;
    }
  }

  async create(patientData) {
    try {
      // Format allergies for multi-line text field
      const allergiesText = Array.isArray(patientData.allergies) 
        ? patientData.allergies.join('\n') 
        : patientData.allergies || '';

      const params = {
        records: [{
Name: patientData.name || patientData.Name,
          age_c: parseInt(patientData.age || patientData.age_c),
          gender_c: patientData.gender || patientData.gender_c,
          phone_c: patientData.phone || patientData.phone_c,
          emergency_contact_c: patientData.emergencyContact || patientData.emergency_contact_c,
          blood_group_c: patientData.bloodGroup || patientData.blood_group_c,
          allergies_c: allergiesText,
          current_department_c: parseInt(patientData.currentDepartment || patientData.current_department_c),
          status_c: patientData.status || patientData.status_c || 'waiting',
          admission_date_c: patientData.admissionDate || patientData.admission_date_c || new Date().toISOString()
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
          console.error(`Failed to create patients ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
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
        console.error("Error creating patient:", error?.response?.data?.message);
      } else {
        console.error(error);
      }
      throw error;
    }
  }

  async update(id, patientData) {
    try {
      // Format allergies for multi-line text field
      const allergiesText = Array.isArray(patientData.allergies) 
        ? patientData.allergies.join('\n') 
        : patientData.allergies || '';

      const params = {
records: [{
          Id: id,
          Name: patientData.name || patientData.Name,
          age_c: parseInt(patientData.age || patientData.age_c),
          gender_c: patientData.gender || patientData.gender_c,
          phone_c: patientData.phone || patientData.phone_c,
          emergency_contact_c: patientData.emergencyContact || patientData.emergency_contact_c,
          blood_group_c: patientData.bloodGroup || patientData.blood_group_c,
          allergies_c: allergiesText,
          current_department_c: parseInt(patientData.currentDepartment || patientData.current_department_c),
          status_c: patientData.status || patientData.status_c,
          admission_date_c: patientData.admissionDate || patientData.admission_date_c
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
          console.error(`Failed to update patients ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
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
        console.error("Error updating patient:", error?.response?.data?.message);
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
          console.error(`Failed to delete patients ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) console.error(record.message);
          });
        }
        
        return successfulDeletions.length > 0;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting patient:", error?.response?.data?.message);
      } else {
        console.error(error);
      }
      throw error;
    }
  }
}
export default new PatientService();