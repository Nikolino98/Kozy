
// Script temporal para actualizar la contraseña del admin
// Este archivo se puede eliminar después de ejecutar la función una vez

import bcrypt from 'bcryptjs';
import { supabase } from '@/integrations/supabase/client';

export const updateAdminPassword = async () => {
  try {
    // Generar el hash correcto para la contraseña "prz425s275"
    const saltRounds = 10;
    const correctHash = await bcrypt.hash('prz425s275', saltRounds);
    
    console.log('Hash generado:', correctHash);
    
    // Actualizar en la base de datos
    const { data, error } = await supabase
      .from('admins')
      .update({ password_hash: correctHash })
      .eq('username', 'Nikoperez');

    if (error) {
      console.error('Error actualizando contraseña:', error);
      return false;
    }
    
    console.log('Contraseña actualizada correctamente');
    return true;
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
};
