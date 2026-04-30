import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const webhookUrl = req.headers.get('x-webhook-url');
    
    if (!webhookUrl) {
      return NextResponse.json({ error: 'URL del Webhook de n8n no suministrada' }, { status: 400 });
    }

    // Capture the FormData perfectly from the incoming NextJS request
    const formData = await req.formData();

    // Tunnel it natively from the Node server (Bypasses Browser CORS completely)
    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: formData, 
    });

    if (!response.ok) {
      return NextResponse.json({ error: `El webhook en n8n respondió con estado: ${response.status}` }, { status: response.status });
    }

    // Attempt to stringify/parse the raw response from n8n 
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (err: any) {
    console.error('Error Proxy n8n Bypass: ', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
