import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as https from 'https';

@Injectable()
export class AppService {
  private readonly baseUrl = 'https://yugstroiinvestplyus.ru.amocrm.ru'; // Your amoCRM base URL
  private accessToken: string = process.env.ACCESS_TOKEN;

  async sendToCrm(data: { name: string; phoneNumber: string }): Promise<any> {
    const httpsAgent = new https.Agent({ rejectUnauthorized: false });

    try {
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
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          httpsAgent,
        },
      );

      return { success: true, data: response.data };
    } catch (error) {
      console.error(
        'Error sending data to amoCRM:',
        error.response?.data || error.message,
      );
      throw new Error('Failed to send data to amoCRM');
    }
  }
}
