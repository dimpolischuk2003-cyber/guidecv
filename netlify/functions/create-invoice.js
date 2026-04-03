exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const token = process.env.MONO_TOKEN;
  const baseUrl = process.env.URL || 'https://jobready.biz.ua';

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { name, email } = body;

  if (!name || !email) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Name and email required' }) };
  }

  try {
    const response = await fetch('https://api.monobank.ua/api/merchant/invoice/create', {
      method: 'POST',
      headers: {
        'X-Token': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: 34900,
        ccy: 980,
        merchantPaymInfo: {
          reference: `order_${Date.now()}`,
          destination: 'Гайд «Резюме, яке читають» — JobReady',
          basketOrder: [
            {
              name: 'Резюме, яке читають — гайд',
              qty: 1,
              sum: 34900,
              total: 34900,
              unit: 'шт.',
            }
          ]
        },
        redirectUrl: `${baseUrl}/thank-you.html`,
        webHookUrl: `${baseUrl}/.netlify/functions/payment-webhook`,
        validity: 3600,
        paymentType: 'debit',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Mono API error:', data);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Payment creation failed', details: data }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageUrl: data.pageUrl }),
    };
  } catch (err) {
    console.error('Error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error' }),
    };
  }
};
