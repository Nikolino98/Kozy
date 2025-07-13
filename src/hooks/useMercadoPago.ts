
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CustomerData {
  fullName: string;
  phone: string;
  address: string;
  details: string;
}

export const useMercadoPago = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPayment = async (cartItems: CartItem[], customerData: CustomerData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Generar ID único para la orden
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Preparar datos del pago
      const paymentData = {
        items: cartItems.map(item => ({
          id: item.id,
          title: item.name,
          quantity: item.quantity,
          unit_price: Number(item.price),
        })),
        payer: {
          name: customerData.fullName.split(' ')[0] || customerData.fullName,
          surname: customerData.fullName.split(' ').slice(1).join(' ') || '',
          email: `cliente_${Date.now()}@tiendakozy.com`, // Email temporal
          phone: {
            number: customerData.phone,
          },
          address: {
            street_name: customerData.address,
          },
        },
        back_urls: {
          success: `${window.location.origin}/?payment=success`,
          failure: `${window.location.origin}/?payment=failure`,
          pending: `${window.location.origin}/?payment=pending`,
        },
        auto_return: 'approved',
        external_reference: orderId,
      };

      console.log('Creating payment with data:', paymentData);

      // Llamar a la función edge
      const { data, error: functionError } = await supabase.functions.invoke(
        'create-mercadopago-payment',
        {
          body: paymentData,
        }
      );

      if (functionError) {
        console.error('Function error:', functionError);
        throw new Error(functionError.message || 'Error al crear el pago');
      }

      if (!data || !data.init_point) {
        console.error('Invalid response:', data);
        throw new Error('Respuesta inválida del servidor');
      }

      console.log('Payment created successfully:', data);

      // Redirigir a MercadoPago
      window.open(data.init_point, '_blank');

      return data;

    } catch (err) {
      console.error('Error creating payment:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createPayment,
    isLoading,
    error,
  };
};
