const { JWT } = require('google-auth-library');

module.exports = async (req, res) => {
  try {
    const SA_EMAIL = process.env.SA_EMAIL;
    const PRIVATE_KEY = process.env.PRIVATE_KEY?.replace(/\\n/g, '\n');
    const SHEET_ID = process.env.SHEET_ID;
    const SHEET_NAME = process.env.SHEET_NAME;

    if (!SA_EMAIL || !PRIVATE_KEY || !SHEET_ID || !SHEET_NAME) {
      return res.status(500).json({ error: 'Missing required environment variables' });
    }

    const client = new JWT({
      email: SA_EMAIL,
      key: PRIVATE_KEY,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const token = await client.authorize();
    const range = encodeURIComponent(`${SHEET_NAME}!A1:L45`);
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token.access_token}`,
      },
    });

    const data = await response.json();
    if (!data.values) {
      return res.status(500).json({ error: data.error?.message || 'No data from Sheets API' });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
};
