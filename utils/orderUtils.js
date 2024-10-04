import { supabase } from '../supabase';

export const generateOrderId = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 7);
  return `OP-${timestamp}-${randomStr}`.toUpperCase();
};

export const createOrder = async (orderData) => {
  const orderId = generateOrderId();
  const { data, error } = await supabase
    .from('orders')
    .insert({
      id: orderId,
      ...orderData,
      status: 'pending'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};