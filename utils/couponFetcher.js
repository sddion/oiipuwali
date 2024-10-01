import { supabase } from '../supabase';

export const fetchCoupons = async () => {
  try {
    const { data, error } = await supabase
      .from('coupons')
      .select('*');
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return [];
  }
};