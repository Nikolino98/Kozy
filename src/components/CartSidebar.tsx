
import { useState } from 'react';
import { X, Minus, Plus, ShoppingCart, Trash2, CreditCard, Send, User, Phone, MapPin, MessageSquare, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useShoppingCart } from '@/contexts/ShoppingContext';
import { useMercadoPago } from '@/hooks/useMercadoPago';
import { toast } from '@/components/ui/use-toast';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CustomerData {
  fullName: string;
  phone: string;
  address: string;
  details: string;
}

const CartSidebar = ({ isOpen, onClose }: CartSidebarProps) => {
  const [showForm, setShowForm] = useState(false);
  const [showTransferInfo, setShowTransferInfo] = useState(false);
  const [customerData, setCustomerData] = useState<CustomerData>({
    fullName: '',
    phone: '',
    address: '',
    details: ''
  });

  const { cartItems, updateQuantity, removeFromCart, clearCart, getCartTotal, getCartItemsCount } = useShoppingCart();
  const { createPayment, isLoading: mercadoPagoLoading } = useMercadoPago();

  const handleInputChange = (field: keyof CustomerData, value: string) => {
    setCustomerData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateName = (name: string) => {
    const textOnlyRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    return name.trim() && textOnlyRegex.test(name) && name.length >= 2;
  };

  const validatePhone = (phone: string) => {
    const numbersOnlyRegex = /^\d+$/;
    return phone.trim() && numbersOnlyRegex.test(phone) && phone.length >= 9;
  };

  const validateAddress = (address: string) => {
    return address.trim() && address.length >= 10;
  };

  const isFormValid = () => {
    return validateName(customerData.fullName) && 
           validatePhone(customerData.phone) && 
           validateAddress(customerData.address);
  };

  const handleMercadoPagoPayment = async () => {
    if (!showForm) {
      setShowForm(true);
      return;
    }

    if (!isFormValid()) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos correctamente",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "Procesando pago",
        description: "Redirigiendo a Mercado Pago...",
      });

      await createPayment(cartItems, customerData);
      
      // Enviar pedido por WhatsApp después de crear el pago
      sendWhatsAppOrder();
      
      // Limpiar carrito y cerrar modal
      clearCart();
      setShowForm(false);
      setCustomerData({ fullName: '', phone: '', address: '', details: '' });
      onClose();

    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: "Error en el pago",
        description: "No se pudo procesar el pago. Intenta nuevamente.",
        variant: "destructive",
      });
    }
  };

  const handleTransferPayment = () => {
    if (!showForm) {
      setShowForm(true);
      return;
    }

    if (!isFormValid()) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos correctamente",
        variant: "destructive",
      });
      return;
    }

    setShowTransferInfo(true);
  };

  const handleTransferConfirm = () => {
    sendWhatsAppOrder();
    setShowTransferInfo(false);
    clearCart();
    setShowForm(false);
    setCustomerData({ fullName: '', phone: '', address: '', details: '' });
    onClose();
  };

  const sendWhatsAppOrder = () => {
    const orderDetails = cartItems.map(item => 
      `• ${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');
    
    const total = getCartTotal();
    const customerInfo = `
*Datos del Cliente:*
👤 Nombre: ${customerData.fullName}
📱 Teléfono: ${customerData.phone}
📍 Dirección: ${customerData.address}
${customerData.details ? `📝 Detalles: ${customerData.details}` : ''}
    `;
    
    const message = `🛒 *Nuevo Pedido - Tienda Kozy*\n\n*Productos:*\n${orderDetails}\n\n*Total: $${total.toFixed(2)}*\n${customerInfo}\n¡Gracias por tu compra! 🎉`;
    
    const whatsappUrl = `https://wa.me/5493517716373?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (!isOpen) return null;

  // Modal de información de transferencia
  if (showTransferInfo) {
    return (
      <>
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
        <div className="fixed right-0 top-0 h-full w-full max-w-md bg-background shadow-2xl z-50 flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-xl font-bold text-foreground">Información de Transferencia</h2>
            <Button variant="ghost" size="icon" onClick={() => setShowTransferInfo(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex-1 p-6 flex flex-col justify-center">
            <div className="text-center mb-8">
              <CheckCircle className="w-16 h-16 text-kozy-green mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-foreground mb-2">Datos para Transferencia</h3>
            </div>

            <div className="bg-muted rounded-2xl p-6 space-y-4 mb-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">CBU</p>
                <p className="text-lg font-mono font-bold">1430001713003138210015</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Alias</p>
                <p className="text-lg font-bold">kozy.tienda</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Titular</p>
                <p className="text-lg font-bold">Nicolas Alejandro Perez Medraano</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monto a transferir</p>
                <p className="text-2xl font-bold text-kozy-warm">${getCartTotal().toFixed(2)}</p>
              </div>
            </div>

            <div className="bg-kozy-warm/10 border border-kozy-warm/20 rounded-2xl p-4 mb-6">
              <p className="text-sm text-kozy-warm font-medium">
                📄 <strong>Importante:</strong> Una vez realizada la transferencia, 
                envía el comprobante por WhatsApp para confirmar tu pedido.
              </p>
            </div>

            <Button
              onClick={handleTransferConfirm}
              className="w-full kozy-gradient text-white py-4 text-lg font-semibold"
            >
              <Send className="w-5 h-5 mr-2" />
              Enviar Pedido por WhatsApp
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />
      
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-background shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5 text-kozy-warm" />
            <h2 className="text-xl font-bold text-foreground">
              Carrito ({getCartItemsCount()})
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6">
              <ShoppingCart className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Tu carrito está vacío</p>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              {!showForm && (
                <div className="p-6 space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex space-x-4 p-4 bg-card rounded-2xl border border-border">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-xl"
                      />
                      <div className="flex-1 space-y-2">
                        <h3 className="font-semibold text-foreground text-sm line-clamp-2">
                          {item.name}
                        </h3>
                        <p className="text-kozy-warm font-bold">
                          ${item.price.toFixed(2)}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 rounded-full"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="text-sm font-medium w-8 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 rounded-full"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFromCart(item.id)}
                            className="w-8 h-8 text-red-500 hover:bg-red-50 rounded-full"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Customer Form */}
              {showForm && (
                <div className="p-6 space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-foreground mb-2">Datos de Entrega</h3>
                    <p className="text-sm text-muted-foreground">Completa tus datos para procesar el pedido</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Nombre Completo *
                      </label>
                      <Input
                        placeholder="Tu nombre completo"
                        value={customerData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        className={`rounded-xl ${!validateName(customerData.fullName) && customerData.fullName ? 'border-red-500' : ''}`}
                      />
                      {!validateName(customerData.fullName) && customerData.fullName && (
                        <p className="text-red-500 text-xs">Solo se permiten letras y espacios</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground flex items-center">
                        <Phone className="w-4 h-4 mr-2" />
                        Número de Teléfono *
                      </label>
                      <Input
                        placeholder="+54 9 11 1234-5678"
                        value={customerData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className={`rounded-xl ${!validatePhone(customerData.phone) && customerData.phone ? 'border-red-500' : ''}`}
                      />
                      {!validatePhone(customerData.phone) && customerData.phone && (
                        <p className="text-red-500 text-xs">Solo se permiten números</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        Dirección de Entrega *
                      </label>
                      <Input
                        placeholder="Calle, número, ciudad, código postal"
                        value={customerData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className={`rounded-xl ${!validateAddress(customerData.address) && customerData.address ? 'border-red-500' : ''}`}
                      />
                      {!validateAddress(customerData.address) && customerData.address && (
                        <p className="text-red-500 text-xs">La dirección es requerida</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground flex items-center">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Detalles Adicionales
                      </label>
                      <Textarea
                        placeholder="Aclaraciones, referencias, horarios preferidos..."
                        value={customerData.details}
                        onChange={(e) => handleInputChange('details', e.target.value)}
                        className="rounded-xl min-h-[80px]"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={() => setShowForm(false)}
                    variant="outline"
                    className="w-full"
                  >
                    ← Volver al Carrito
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t border-border p-6 space-y-4">
            <div className="flex justify-between items-center text-xl font-bold">
              <span>Total:</span>
              <span className="text-kozy-warm">${getCartTotal().toFixed(2)}</span>
            </div>

            {!showForm ? (
              <Button
                onClick={() => setShowForm(true)}
                className="w-full kozy-gradient text-white py-3 font-semibold"
              >
                Continuar con la Compra
              </Button>
            ) : (
              <div className="space-y-3">
                <Button
                  onClick={handleMercadoPagoPayment}
                  disabled={mercadoPagoLoading || !isFormValid()}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 font-semibold"
                >
                  {mercadoPagoLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Procesando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-5 h-5" />
                      <span>Pagar con Mercado Pago</span>
                    </div>
                  )}
                </Button>

                <Button
                  onClick={handleTransferPayment}
                  disabled={mercadoPagoLoading || !isFormValid()}
                  variant="outline"
                  className="w-full py-3 font-semibold border-kozy-warm text-kozy-warm hover:bg-kozy-warm/10"
                >
                  <div className="flex items-center space-x-2">
                    <Send className="w-5 h-5" />
                    <span>Pagar por Transferencia</span>
                  </div>
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Al finalizar, recibirás los detalles por WhatsApp
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;
