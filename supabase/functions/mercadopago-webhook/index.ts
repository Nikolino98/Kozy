
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  console.log('MercadoPago webhook called');

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('Webhook data received:', JSON.stringify(body, null, 2));

    const accessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
    
    if (!accessToken) {
      console.error('MERCADO_PAGO_ACCESS_TOKEN not found');
      return new Response('OK', { status: 200 });
    }

    // Si es una notificación de pago
    if (body.type === 'payment') {
      const paymentId = body.data.id;
      
      // Obtener detalles del pago
      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (paymentResponse.ok) {
        const paymentData = await paymentResponse.json();
        console.log('Payment status:', paymentData.status);
        console.log('External reference:', paymentData.external_reference);

        // Aquí puedes agregar lógica para actualizar el estado del pedido
        // Por ejemplo, guardar en base de datos, enviar emails, etc.
        
        if (paymentData.status === 'approved') {
          console.log('Payment approved for order:', paymentData.external_reference);
          // Lógica para pedido aprobado
        }
      }
    }

    return new Response('OK', { 
      status: 200,
      headers: corsHeaders 
    });

  } catch (error) {
    console.error('Error in mercadopago-webhook:', error);
    return new Response('OK', { 
      status: 200,
      headers: corsHeaders 
    });
  }
};

serve(handler);
