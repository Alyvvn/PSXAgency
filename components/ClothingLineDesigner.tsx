"use client";

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

type ProductType = 'tshirt' | 'hoodie' | 'snapback' | 'joggers' | 'tote';

interface ProductOption {
  id: string;
  name: string;
  basePrice: number;
  retailPrice: number;
  colors: string[];
  sizes: string[];
  category: 'tops' | 'bottoms' | 'accessories';
}

interface SelectedProduct extends Omit<ProductOption, 'colors' | 'sizes'> {
  selectedColor: string;
  selectedSize: string;
  quantity: number;
}

const PRODUCTS: Record<ProductType, ProductOption> = {
  tshirt: {
    id: 'tshirt',
    name: 'Basic T-Shirt',
    basePrice: 12,
    retailPrice: 30,
    colors: ['White', 'Black', 'Gray', 'Navy', 'Red', 'Green', 'Sand'],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    category: 'tops'
  },
  hoodie: {
    id: 'hoodie',
    name: 'Premium Hoodie',
    basePrice: 35,
    retailPrice: 75,
    colors: ['Black', 'Gray', 'Navy', 'Olive', 'Burgundy'],
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    category: 'tops'
  },
  snapback: {
    id: 'snapback',
    name: 'Snapback Hat',
    basePrice: 15,
    retailPrice: 35,
    colors: ['Black', 'White', 'Navy', 'Olive'],
    sizes: ['One Size'],
    category: 'accessories'
  },
  joggers: {
    id: 'joggers',
    name: 'Jogger Pants',
    basePrice: 25,
    retailPrice: 50,
    colors: ['Black', 'Gray', 'Navy', 'Olive'],
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    category: 'bottoms'
  },
  tote: {
    id: 'tote',
    name: 'Canvas Tote Bag',
    basePrice: 8,
    retailPrice: 25,
    colors: ['Natural', 'Black', 'Navy', 'Olive'],
    sizes: ['One Size'],
    category: 'accessories'
  }
};

type DesignStyle = 'minimal' | 'vintage' | 'streetwear' | 'luxury' | 'tech';

const DESIGN_STYLES = [
  { id: 'minimal', name: 'Minimal', description: 'Clean, simple logo placement' },
  { id: 'vintage', name: 'Vintage', description: 'Retro and distressed look' },
  { id: 'luxury', name: 'Luxury', description: 'Elegant, sophisticated look' },
  { id: 'streetwear', name: 'Streetwear', description: 'Bold graphics, oversized prints' },
  { id: 'tech', name: 'Tech/Gaming', description: 'Modern, tech-inspired designs' },
];

interface ClothingLineDesignerProps {
  onSubmit?: (data: any) => void;
}

export function ClothingLineDesigner({ onSubmit }: ClothingLineDesignerProps) {
  const [collectionName, setCollectionName] = useState('');
  const [targetMargin, setTargetMargin] = useState(60);
  const [selectedStyle, setSelectedStyle] = useState<DesignStyle>('minimal');
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [sampleSize, setSampleSize] = useState(50);

  const addProduct = (productId: ProductType) => {
    const product = PRODUCTS[productId];
    const newProduct: SelectedProduct = {
      ...product,
      selectedColor: product.colors[0],
      selectedSize: product.sizes[0],
      quantity: 1
    };
    setSelectedProducts([...selectedProducts, newProduct]);
  };

  const removeProduct = (index: number) => {
    const updated = [...selectedProducts];
    updated.splice(index, 1);
    setSelectedProducts(updated);
  };

  const updateProduct = (index: number, updates: Partial<SelectedProduct>) => {
    const updated = [...selectedProducts];
    updated[index] = { ...updated[index], ...updates };
    setSelectedProducts(updated);
  };

  const collectionMetrics = useMemo(() => {
    const baseCost = selectedProducts.reduce((sum, p) => sum + (p.basePrice * p.quantity), 0);
    const retailValue = selectedProducts.reduce((sum, p) => sum + (p.retailPrice * p.quantity), 0);
    const profit = retailValue - baseCost;
    const margin = baseCost > 0 ? (profit / retailValue) * 100 : 0;
    
    return {
      itemsSelected: selectedProducts.reduce((sum, p) => sum + p.quantity, 0),
      totalBaseCost: baseCost,
      totalRetailValue: retailValue,
      averageMargin: margin,
      estimatedProfit: (retailValue * (targetMargin / 100)) - baseCost,
      profitAtSampleSize: ((retailValue * (targetMargin / 100)) - baseCost) * (sampleSize / 100)
    };
  }, [selectedProducts, targetMargin, sampleSize]);

  return (
    <div className="space-y-8">
      <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800">
        <h2 className="text-xl font-semibold mb-6">Collection Setup</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Collection Name</label>
            <input
              type="text"
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              placeholder="e.g., Summer 2024 Launch"
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Design Style</label>
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value as DesignStyle)}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {DESIGN_STYLES.map(style => (
                <option key={style.id} value={style.id}>
                  {style.name}: {style.description}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Target Margin: {targetMargin}%
            </label>
            <input
              type="range"
              min="20"
              max="80"
              value={targetMargin}
              onChange={(e) => setTargetMargin(Number(e.target.value))}
              className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-zinc-400 mt-1">
              <span>20%</span>
              <span>50%</span>
              <span>80%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800">
            <h2 className="text-xl font-semibold mb-6">Product Selection</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {Object.values(PRODUCTS).map((product) => (
                <div key={product.id} className="border border-zinc-800 rounded-lg p-4 hover:border-blue-500 transition-colors">
                  <h3 className="font-medium">{product.name}</h3>
                  <p className="text-sm text-zinc-400">
                    Base: ${product.basePrice} • Retail: ${product.retailPrice}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {product.colors.length} colors • {product.sizes.length} {product.sizes[0] === 'One Size' ? 'size' : 'sizes'}
                  </p>
                  <button
                    onClick={() => addProduct(product.id as ProductType)}
                    className="mt-3 w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors"
                  >
                    Add to Collection
                  </button>
                </div>
              ))}
            </div>

            {selectedProducts.length > 0 && (
              <div className="mt-8">
                <h3 className="font-medium mb-4">Selected Products</h3>
                <div className="space-y-4">
                  {selectedProducts.map((product, index) => (
                    <div key={index} className="border border-zinc-800 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-sm text-zinc-400">
                            ${product.basePrice} base • ${product.retailPrice} retail
                          </p>
                        </div>
                        <button
                          onClick={() => removeProduct(index)}
                          className="text-red-500 hover:text-red-400"
                        >
                          Remove
                        </button>
                      </div>
                      
                      <div className="mt-3 grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-zinc-400 mb-1">Color</label>
                          <select
                            value={product.selectedColor}
                            onChange={(e) => updateProduct(index, { selectedColor: e.target.value })}
                            className="w-full px-3 py-1.5 text-sm bg-zinc-800 border border-zinc-700 rounded-md"
                          >
                            {PRODUCTS[product.id as ProductType].colors.map(color => (
                              <option key={color} value={color}>{color}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-xs text-zinc-400 mb-1">Size</label>
                          <select
                            value={product.selectedSize}
                            onChange={(e) => updateProduct(index, { selectedSize: e.target.value })}
                            className="w-full px-3 py-1.5 text-sm bg-zinc-800 border border-zinc-700 rounded-md"
                          >
                            {PRODUCTS[product.id as ProductType].sizes.map(size => (
                              <option key={size} value={size}>{size}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-xs text-zinc-400 mb-1">Quantity</label>
                          <input
                            type="number"
                            min="1"
                            value={product.quantity}
                            onChange={(e) => updateProduct(index, { quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                            className="w-full px-3 py-1.5 text-sm bg-zinc-800 border border-zinc-700 rounded-md"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800 sticky top-4">
            <h2 className="text-xl font-semibold mb-6">Collection Metrics</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-zinc-400">Items Selected:</span>
                <span>{collectionMetrics.itemsSelected}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-zinc-400">Total Base Cost:</span>
                <span>${collectionMetrics.totalBaseCost.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-zinc-400">Total Retail Value:</span>
                <span>${collectionMetrics.totalRetailValue.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-zinc-400">Average Margin:</span>
                <span className={cn(
                  collectionMetrics.averageMargin >= 50 ? 'text-green-400' : 'text-yellow-400'
                )}>
                  {collectionMetrics.averageMargin.toFixed(1)}%
                </span>
              </div>
              
              <div className="pt-4 mt-4 border-t border-zinc-800">
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-1">
                    Sample Size: {sampleSize} units
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="200"
                    value={sampleSize}
                    onChange={(e) => setSampleSize(Number(e.target.value))}
                    className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                <div className="flex justify-between">
                  <span className="text-zinc-400">Est. Profit ({sampleSize} units):</span>
                  <span className="font-medium">
                    ${collectionMetrics.profitAtSampleSize.toFixed(2)}
                  </span>
                </div>
              </div>
              
              <button
                className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                disabled={!collectionName || selectedProducts.length === 0}
                onClick={async () => {
                  try {
                    const projectName = prompt("Enter your project name:");
                    if (!projectName) return alert("Project name is required.");

                    const socials = prompt("Enter your socials (e.g., Twitter, Discord):");
                    if (!socials) return alert("Socials are required.");

                    const submitBtn = document.activeElement as HTMLButtonElement;
                    const originalText = submitBtn.textContent;
                    submitBtn.textContent = 'Sending...';
                    submitBtn.disabled = true;

                    const response = await fetch('/api/submit', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        type: 'merch-store-order',
                        project: { name: projectName },
                        contact: { socials },
                        order: {
                          collectionName,
                          products: selectedProducts,
                          sampleSize,
                          targetMargin
                        }
                      })
                    });

                    if (!response.ok) {
                      const error = await response.json().catch(() => ({}));
                      throw new Error(error.message || 'Failed to submit order');
                    }

                    alert('✅ Order submitted successfully! We\'ll be in touch soon.');
                    // Reset form
                    setCollectionName('');
                    setSelectedProducts([]);
                  } catch (error) {
                    console.error('Error submitting order:', error);
                    const errorMessage = error instanceof Error ? error.message : 'Please try again';
                    alert(`❌ Failed to submit order: ${errorMessage}`);
                  } finally {
                    const submitBtn = document.querySelector('button:contains("Sending...")') as HTMLButtonElement | null;
                    if (submitBtn) {
                      submitBtn.textContent = 'Submit Collection Request';
                      submitBtn.disabled = false;
                    }
                  }
                }}
              >
                Submit Collection Request
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
