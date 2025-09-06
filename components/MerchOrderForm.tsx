"use client";

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface MerchItem {
  id: string;
  name: string;
  price: number;
  image: string;
  sizes: string[];
};

interface OrderItem {
  itemId: string;
  size: string;
  quantity: number;
};

interface ShippingInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  notes: string;
};

const MERCH_ITEMS: MerchItem[] = [
  {
    id: 'hoodie',
    name: 'PSX Hoodie',
    price: 79.99,
    image: '/merch/hoodie.png',
    sizes: ['S', 'M', 'L', 'XL', '2XL']
  },
  {
    id: 'hat',
    name: 'PSX Snapback',
    price: 34.99,
    image: '/merch/hat.png',
    sizes: ['One Size']
  }
];

export default function MerchOrderForm() {
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States',
    notes: ''
  });
  const [currentStep, setCurrentStep] = useState<'items' | 'shipping' | 'confirm'>('items');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setVh();
    window.addEventListener('resize', setVh);
    return () => window.removeEventListener('resize', setVh);
  }, []);

  const addToOrder = (itemId: string, size: string) => {
    setSelectedItems(prev => {
      const existingItem = prev.find(i => i.itemId === itemId && i.size === size);
      if (existingItem) {
        return prev.map(i => 
          i.itemId === itemId && i.size === size 
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { itemId, size, quantity: 1 }];
    });
    setSelectedSize('');
    setSelectedItem(null);
  };

  const removeFromOrder = (itemId: string, size: string) => {
    setSelectedItems(prev => 
      prev
        .map(item => 
          item.itemId === itemId && item.size === size
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter(item => item.quantity > 0)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const orderData = {
        items: selectedItems.map(item => {
          const itemDetails = MERCH_ITEMS.find(i => i.id === item.itemId);
          return {
            itemId: item.itemId,
            itemName: itemDetails?.name || 'Unknown Item',
            size: item.size,
            quantity: item.quantity,
            price: itemDetails?.price || 0
          };
        }),
        shipping: shippingInfo,
        subtotal: selectedItems.reduce((sum, item) => {
          const itemDetails = MERCH_ITEMS.find(i => i.id === item.itemId);
          return sum + (itemDetails?.price || 0) * item.quantity;
        }, 0),
        shippingCost: 9.99, 
        tax: selectedItems.reduce((sum, item) => {
          const itemDetails = MERCH_ITEMS.find(i => i.id === item.itemId);
          return sum + (itemDetails?.price || 0) * item.quantity * 0.08;
        }, 0),
        total: selectedItems.reduce((sum, item) => {
          const itemDetails = MERCH_ITEMS.find(i => i.id === item.itemId);
          return sum + (itemDetails?.price || 0) * item.quantity;
        }, 0) + 9.99
      };

      const response = await fetch('/api/submit-merch-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit order');
      }

      setSubmitSuccess(true);
      setCurrentStep('confirm');
    } catch (error) {
      console.error('Error submitting order:', error);
      alert(`Failed to submit order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalItems = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = selectedItems.reduce((sum, item) => {
    const itemDetails = MERCH_ITEMS.find(i => i.id === item.itemId);
    return sum + (itemDetails?.price || 0) * item.quantity;
  }, 0);
  const shipping = 9.99; 
  const total = subtotal + shipping;

  if (submitSuccess) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
        <div className="text-center py-8 sm:py-12">
          <div className="text-green-500 text-5xl sm:text-6xl mb-4">✓</div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Order Confirmed!</h2>
          <p className="text-zinc-400 mb-6 sm:mb-8">Thank you for your order. We'll send a confirmation email shortly.</p>
          <button
            onClick={() => {
              setSelectedItems([]);
              setShippingInfo({
                name: '',
                email: '',
                phone: '',
                address: '',
                city: '',
                state: '',
                zip: '',
                country: 'United States',
                notes: ''
              });
              setCurrentStep('items');
              setSubmitSuccess(false);
            }}
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-base sm:text-lg"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
      <div className="flex justify-between mb-8 relative">
        {['items', 'shipping', 'confirm'].map((step, index) => (
          <div key={step} className="flex flex-col items-center z-10">
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                (step === 'items' && currentStep === 'items') ||
                (step === 'shipping' && (currentStep === 'shipping' || currentStep === 'confirm')) ||
                (step === 'confirm' && currentStep === 'confirm')
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {index + 1}
            </div>
            <span className="mt-2 text-xs sm:text-sm text-zinc-400 capitalize">{step}</span>
          </div>
        ))}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-zinc-800 -z-10">
          <div 
            className={`h-full bg-blue-600 transition-all duration-300 ${
              currentStep === 'items' ? 'w-0' : 
              currentStep === 'shipping' ? 'w-1/2' : 'w-full'
            }`}
          />
        </div>
      </div>

      {currentStep === 'items' && (
        <>
          <h2 className="text-2xl font-bold mb-6">Select Items</h2>
          <div className="space-y-6">
            {MERCH_ITEMS.map((item) => (
              <div key={item.id} className="flex flex-col sm:flex-row gap-4 p-4 bg-zinc-800/50 rounded-lg">
                <div className="w-full sm:w-32 h-32 bg-zinc-700 rounded-lg overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium">{item.name}</h3>
                  <p className="text-zinc-400 mb-2">${item.price.toFixed(2)}</p>
                  
                  {selectedItem === item.id ? (
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {item.sizes.map((size) => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`px-3 py-1 rounded-full text-sm ${
                              selectedSize === size
                                ? 'bg-blue-600 text-white'
                                : 'bg-zinc-700 text-zinc-200 hover:bg-zinc-600'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => selectedSize && addToOrder(item.id, selectedSize)}
                        disabled={!selectedSize}
                        className={`w-full sm:w-auto px-4 py-2 rounded-lg ${
                          selectedSize
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                        } transition-colors`}
                      >
                        Add to Cart
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedItem(item.id)}
                      className="mt-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors text-sm sm:text-base"
                    >
                      Select Size
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {selectedItems.length > 0 && (
            <div className="mt-8 p-4 bg-zinc-800/50 rounded-lg">
              <h3 className="text-lg font-medium mb-3">Your Cart ({totalItems})</h3>
              <div className="space-y-3 mb-4">
                {selectedItems.map((item, index) => {
                  const itemDetails = MERCH_ITEMS.find(i => i.id === item.itemId);
                  return (
                    <div key={`${item.itemId}-${item.size}-${index}`} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{itemDetails?.name} ({item.size})</p>
                        <p className="text-sm text-zinc-400">${itemDetails?.price.toFixed(2)} × {item.quantity}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => removeFromOrder(item.itemId, item.size)}
                          className="w-8 h-8 flex items-center justify-center bg-zinc-700 hover:bg-zinc-600 rounded-full"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => addToOrder(item.itemId, item.size)}
                          className="w-8 h-8 flex items-center justify-center bg-zinc-700 hover:bg-zinc-600 rounded-full"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-zinc-700 pt-4">
                <div className="flex justify-between mb-2">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Shipping:</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium text-lg mt-4 pt-4 border-t border-zinc-700">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={() => setCurrentStep('shipping')}
                className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Proceed to Shipping
              </button>
            </div>
          )}
        </>
      )}

      {currentStep === 'shipping' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-2xl font-bold mb-6">Shipping Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="name" className="block text-sm font-medium text-zinc-300">Full Name</label>
              <input
                type="text"
                id="name"
                required
                value={shippingInfo.name}
                onChange={(e) => setShippingInfo({...shippingInfo, name: e.target.value})}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300">Email</label>
              <input
                type="email"
                id="email"
                required
                value={shippingInfo.email}
                onChange={(e) => setShippingInfo({...shippingInfo, email: e.target.value})}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="phone" className="block text-sm font-medium text-zinc-300">Phone</label>
              <input
                type="tel"
                id="phone"
                required
                value={shippingInfo.phone}
                onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="address" className="block text-sm font-medium text-zinc-300">Address</label>
              <input
                type="text"
                id="address"
                required
                value={shippingInfo.address}
                onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="city" className="block text-sm font-medium text-zinc-300">City</label>
              <input
                type="text"
                id="city"
                required
                value={shippingInfo.city}
                onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="state" className="block text-sm font-medium text-zinc-300">State/Province</label>
              <input
                type="text"
                id="state"
                required
                value={shippingInfo.state}
                onChange={(e) => setShippingInfo({...shippingInfo, state: e.target.value})}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="zip" className="block text-sm font-medium text-zinc-300">ZIP/Postal Code</label>
              <input
                type="text"
                id="zip"
                required
                value={shippingInfo.zip}
                onChange={(e) => setShippingInfo({...shippingInfo, zip: e.target.value})}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="country" className="block text-sm font-medium text-zinc-300">Country</label>
              <select
                id="country"
                value={shippingInfo.country}
                onChange={(e) => setShippingInfo({...shippingInfo, country: e.target.value})}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="United States">United States</option>
                <option value="Canada">Canada</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Australia">Australia</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label htmlFor="notes" className="block text-sm font-medium text-zinc-300">Order Notes (Optional)</label>
            <textarea
              id="notes"
              rows={3}
              value={shippingInfo.notes}
              onChange={(e) => setShippingInfo({...shippingInfo, notes: e.target.value})}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="button"
              onClick={() => setCurrentStep('items')}
              className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-medium transition-colors"
            >
              Back to Cart
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
