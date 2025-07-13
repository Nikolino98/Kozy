
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface CartValidationProps {
  onValidSubmit: (data: { nombre: string; telefono: string; direccion: string }) => void;
}

const CartValidation = ({ onValidSubmit }: CartValidationProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    direccion: ''
  });
  const [errors, setErrors] = useState({
    nombre: '',
    telefono: '',
    direccion: ''
  });

  const validateNombre = (nombre: string) => {
    const textOnlyRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!nombre.trim()) {
      return 'El nombre es requerido';
    }
    if (!textOnlyRegex.test(nombre)) {
      return 'El nombre solo puede contener letras y espacios';
    }
    if (nombre.length < 2) {
      return 'El nombre debe tener al menos 2 caracteres';
    }
    return '';
  };

  const validateTelefono = (telefono: string) => {
    const numbersOnlyRegex = /^\d+$/;
    if (!telefono.trim()) {
      return 'El teléfono es requerido';
    }
    if (!numbersOnlyRegex.test(telefono)) {
      return 'El teléfono solo puede contener números';
    }
    if (telefono.length < 8) {
      return 'El teléfono debe tener al menos 9 dígitos';
    }
    return '';
  };

  const validateDireccion = (direccion: string) => {
    if (!direccion.trim()) {
      return 'La dirección es requerida';
    }
    if (direccion.length < 10) {
      return 'La dirección debe ser más específica';
    }
    return '';
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validar en tiempo real
    let error = '';
    switch (field) {
      case 'nombre':
        error = validateNombre(value);
        break;
      case 'telefono':
        error = validateTelefono(value);
        break;
      case 'direccion':
        error = validateDireccion(value);
        break;
    }
    
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const nombreError = validateNombre(formData.nombre);
    const telefonoError = validateTelefono(formData.telefono);
    const direccionError = validateDireccion(formData.direccion);
    
    setErrors({
      nombre: nombreError,
      telefono: telefonoError,
      direccion: direccionError
    });
    
    if (!nombreError && !telefonoError && !direccionError) {
      onValidSubmit(formData);
      toast({
        title: "Datos validados",
        description: "Información de contacto correcta",
      });
    } else {
      toast({
        title: "Error en los datos",
        description: "Por favor corrige los errores en el formulario",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="nombre">Nombre completo</Label>
        <Input
          id="nombre"
          type="text"
          value={formData.nombre}
          onChange={(e) => handleInputChange('nombre', e.target.value)}
          placeholder="Ingresa tu nombre completo"
          className={errors.nombre ? 'border-red-500' : ''}
        />
        {errors.nombre && (
          <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="telefono">Número de teléfono</Label>
        <Input
          id="telefono"
          type="text"
          value={formData.telefono}
          onChange={(e) => handleInputChange('telefono', e.target.value)}
          placeholder="Ingresa tu número de teléfono"
          className={errors.telefono ? 'border-red-500' : ''}
        />
        {errors.telefono && (
          <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="direccion">Dirección de entrega</Label>
        <Input
          id="direccion"
          type="text"
          value={formData.direccion}
          onChange={(e) => handleInputChange('direccion', e.target.value)}
          placeholder="Ingresa tu dirección completa"
          className={errors.direccion ? 'border-red-500' : ''}
        />
        {errors.direccion && (
          <p className="text-red-500 text-sm mt-1">{errors.direccion}</p>
        )}
      </div>
      
      <Button 
        type="submit" 
        className="w-full kozy-gradient text-white"
      >
        Confirmar Datos
      </Button>
    </form>
  );
};

export default CartValidation;
