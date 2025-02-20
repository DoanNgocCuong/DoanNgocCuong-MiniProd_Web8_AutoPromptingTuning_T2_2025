const API_BASE_URL = 'http://103.253.20.13:25043/api';

export const apiService = {
  async post<T>(endpoint: string, data: any): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Xử lý chi tiết error message từ API
        const errorMessage = responseData.detail || 
                           (typeof responseData === 'object' ? JSON.stringify(responseData) : responseData) ||
                           'API request failed';
        throw new Error(errorMessage);
      }

      return responseData;
    } catch (error) {
      // Log chi tiết error để debug
      console.error('API Error details:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        endpoint,
        requestData: data
      });
      throw error;
    }
  }
}; 