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
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "admission_date_c" } },
          { field: { Name: "age_c" } },
          { field: { Name: "allergies_c" } },
          { field: { Name: "blood_group_c" } },
          { field: { Name: "emergency_contact_c" } },
          { field: { Name: "gender_c" } },
          { field: { Name: "phone_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "current_department_c" } }
        ],
        orderBy: [
          {
            fieldName: "CreatedOn",
            sorttype: "DESC"
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
      console.error("Error fetching patients:", error?.response?.data?.message || error.message);
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "admission_date_c" } },
          { field: { Name: "age_c" } },
          { field: { Name: "allergies_c" } },
          { field: { Name: "blood_group_c" } },
          { field: { Name: "emergency_contact_c" } },
          { field: { Name: "gender_c" } },
          { field: { Name: "phone_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "current_department_c" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, id, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching patient with ID ${id}:`, error?.response?.data?.message || error.message);
      throw error;
    }
  }

  async create(patientData) {
    try {
      // Only include Updateable fields
      const params = {
        records: [{
          Name: patientData.Name,
          admission_date_c: patientData.admission_date_c,
          age_c: patientData.age_c,
          allergies_c: patientData.allergies_c,
          blood_group_c: patientData.blood_group_c,
          current_department_c: patientData.current_department_c,
          emergency_contact_c: patientData.emergency_contact_c,
          gender_c: patientData.gender_c,
          phone_c: patientData.phone_c,
          status_c: patientData.status_c
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
          console.error(`Failed to create patient ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        
        return successfulRecords[0]?.data;
      }
    } catch (error) {
      console.error("Error creating patient:", error?.response?.data?.message || error.message);
      throw error;
    }
  }

  async update(id, patientData) {
    try {
      // Only include Updateable fields
      const params = {
        records: [{
          Id: id,
          Name: patientData.Name,
          admission_date_c: patientData.admission_date_c,
          age_c: patientData.age_c,
          allergies_c: patientData.allergies_c,
          blood_group_c: patientData.blood_group_c,
          current_department_c: patientData.current_department_c,
          emergency_contact_c: patientData.emergency_contact_c,
          gender_c: patientData.gender_c,
          phone_c: patientData.phone_c,
          status_c: patientData.status_c
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
          console.error(`Failed to update patient ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        
        return successfulUpdates[0]?.data;
      }
    } catch (error) {
      console.error("Error updating patient:", error?.response?.data?.message || error.message);
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
          console.error(`Failed to delete patient ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        
        return successfulDeletions.length > 0;
      }
    } catch (error) {
      console.error("Error deleting patient:", error?.response?.data?.message || error.message);
      throw error;
    }
  }
}

export default new PatientService();