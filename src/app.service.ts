import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as https from 'https';

@Injectable()
export class AppService {
  private readonly clientId = process.env.AMOCRM_CLIENT_ID; // Your amoCRM client ID
  private readonly clientSecret = process.env.AMOCRM_CLIENT_SECRET; // Your amoCRM client secret
  private readonly refreshToken = process.env.AMOCRM_REFRESH_TOKEN; // Initial refresh token
  private readonly baseUrl = 'https://yugstroiinvestplyus.ru.amocrm.ru'; // Your amoCRM base URL
  private accessToken: string | null = null;

  private async refreshAccessToken(): Promise<string> {
    const httpsAgent = new https.Agent({ rejectUnauthorized: false });

    try {
      const response = await axios.post(
        `${this.baseUrl}/oauth2/access_token`,
        {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken,
        },
        { httpsAgent },
      );

      const { access_token, refresh_token } = response.data;

      // Log or securely update the environment variables
      console.log('New Access Token:', access_token);
      console.log('New Refresh Token:', refresh_token);

      // Update the tokens for use in the application
      this.accessToken = access_token;

      // Ideally, persist the new refresh_token in your database or environment
      // process.env.AMOCRM_REFRESH_TOKEN = refresh_token;

      return access_token;
    } catch (error) {
      console.error(
        'Error refreshing access token:',
        error.response?.data || error.message,
      );
      throw new Error('Failed to refresh access token');
    }
  }

  private async getAccessToken(): Promise<string> {
    // Check if access token exists, otherwise refresh it
    if (!this.accessToken) {
      this.accessToken = await this.refreshAccessToken();
    }
    return this.accessToken;
  }

  async sendToCrm(data: { name: string; phoneNumber: string }): Promise<any> {
    const httpsAgent = new https.Agent({ rejectUnauthorized: false });

    try {
      const accessToken = await this.getAccessToken();

      const response = await axios.post(
        `${this.baseUrl}/api/v4/leads`,
        {
          name: ['Заявка от формы'],
          custom_fields_values: [
            {
              field_id: 12345, // Replace with the actual field ID for "Name"
              values: [{ value: data.name }],
            },
            {
              field_id: 67890, // Replace with the actual field ID for "Phone"
              values: [{ value: data.phoneNumber }],
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          httpsAgent,
        },
      );

      return { success: true, data: response.data };
    } catch (error) {
      if (error.response?.status === 401) {
        // If unauthorized, try refreshing the token and retrying
        console.warn('Access token expired, refreshing...');
        this.accessToken = await this.refreshAccessToken();

        return this.sendToCrm(data); // Retry after refreshing the token
      }

      console.error(
        'Error sending data to amoCRM:',
        error.response?.data || error.message,
      );
      throw new Error('Failed to send data to amoCRM');
    }
  }
}
