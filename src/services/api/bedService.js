class BedService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'bed_c';
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
              Name: "ward_name_c"
            }
          },
          {
            field: {
              Name: "bed_number_c"
            }
          },
          {
            field: {
              Name: "is_occupied_c"
            }
          },
          {
            field: {
              Name: "patient_id_c"
            }
          },
          {
            field: {
              Name: "admitted_date_c"
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
        console.error("Error fetching beds:", error?.response?.data?.message);
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
              Name: "ward_name_c"
            }
          },
          {
            field: {
              Name: "bed_number_c"
            }
          },
          {
            field: {
              Name: "is_occupied_c"
            }
          },
          {
            field: {
              Name: "patient_id_c"
            }
          },
          {
            field: {
              Name: "admitted_date_c"
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
        console.error(`Error fetching bed with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(error);
      }
      return null;
    }
  }

  async create(bedData) {
    try {
      const params = {
        records: [{
          Name: bedData.Name || bedData.bedNumber || bedData.bed_number_c,
          ward_name_c: bedData.wardName || bedData.ward_name_c,
          bed_number_c: bedData.bedNumber || bedData.bed_number_c,
          is_occupied_c: bedData.isOccupied || bedData.is_occupied_c || false,
          patient_id_c: bedData.patientId ? parseInt(bedData.patientId) : (bedData.patient_id_c ? parseInt(bedData.patient_id_c) : null),
          admitted_date_c: bedData.admittedDate || bedData.admitted_date_c || null
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
          console.error(`Failed to create beds ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
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
        console.error("Error creating bed:", error?.response?.data?.message);
      } else {
        console.error(error);
      }
      throw error;
    }
  }

  async update(id, bedData) {
    try {
      const params = {
        records: [{
          Id: id,
          Name: bedData.Name || bedData.bedNumber || bedData.bed_number_c,
          ward_name_c: bedData.wardName || bedData.ward_name_c,
          bed_number_c: bedData.bedNumber || bedData.bed_number_c,
          is_occupied_c: bedData.isOccupied !== undefined ? bedData.isOccupied : bedData.is_occupied_c,
          patient_id_c: bedData.patientId ? parseInt(bedData.patientId) : (bedData.patient_id_c ? parseInt(bedData.patient_id_c) : null),
          admitted_date_c: bedData.admittedDate || bedData.admitted_date_c
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
          console.error(`Failed to update beds ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
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
        console.error("Error updating bed:", error?.response?.data?.message);
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
          console.error(`Failed to delete beds ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) console.error(record.message);
          });
        }
        
        return successfulDeletions.length > 0;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting bed:", error?.response?.data?.message);
      } else {
        console.error(error);
      }
      throw error;
    }
  }
}
export default new BedService();