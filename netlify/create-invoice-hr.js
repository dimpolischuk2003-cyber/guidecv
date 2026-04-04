exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const token = process.env.MONO_TOKEN;
  const baseUrl = process.env.URL || 'https://jobready.biz.ua';

  try {
    const response = await fetch('https://api.monobank.ua/api/merchant/invoice/create', {
      method: 'POST',
      headers: {
        'X-Token': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: 9900,
        ccy: 980,
        merchantPaymInfo: {
          reference: `hr_order_${Date.now()}`,
          destination: 'Гайд «HR-скринінг: 20 питань» — JobReady',
          basketOrder: [
            {
              name: 'HR-скринінг: 20 питань — гайд',
              qty: 1,
              sum: 9900,
              total: 9900,
              unit: 'шт.',
            }
          ]
        },
        redirectUrl: `${baseUrl}/thank-you-hr.html`,
        webHookUrl: `${baseUrl}/.netlify/functions/payment-webhook`,
        validity: 3600,
        paymentType: 'debit',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Payment failed', details: data }) };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageUrl: data.pageUrl }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server error' }) };
  }
};
