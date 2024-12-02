import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as https from 'https';

@Injectable()
export class AppService {
  async sendToCrm(data: { name: string; phoneNumber: string }): Promise<any> {
    const accessToken = process.env.AMOCRM_ACCESS_TOKEN;
    console.log(accessToken);

    // Create an HTTPS agent to bypass SSL validation
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false, // Disable SSL validation
    });

    try {
      const response = await axios.post(
        'https://yugstroiinvestplyus.ru.amocrm.ru/api/v4/leads',
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
          httpsAgent, // Use the custom HTTPS agent
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
