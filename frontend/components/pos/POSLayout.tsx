'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Card, CardContent } from '@/components/ui/card';
import { useProducts } from '@/hooks/pos/useProducts';
import { useCart } from '@/hooks/pos/useCart';
import { useCustomers } from '@/hooks/pos/useCustomers';
import { useLocations } from '@/hooks/pos/useLocations';
import { useSales } from '@/hooks/pos/useSales';
import ProductSearch from './ProductSearch';
import ServiceForm from './ServiceForm';
import ProductList from './ProductList';
import CustomerForm from './CustomerForm';
import BiltyForm from './BiltyForm';
import CartItems from './CartItems';
import OrderSummary from './OrderSummary';
import PaymentModal from './PaymentModal';
import ReceiptPreviewModal from './ReceiptPreviewModal';
import { Product } from '@/hooks/pos/useProducts';
import { CartItem } from '@/hooks/pos/useCart';
import { BiltyFormData } from '@/types/pos';

interface POSLayoutProps {
  selectedLocation: any;
  onLocationSwitch: () => void;
  onNavigateToDashboard: () => void;
}

export default function POSLayout({ 
  selectedLocation, 
  onLocationSwitch, 
  onNavigateToDashboard 
}: POSLayoutProps) {
  // Hooks
  const {
    products,
    filteredProducts,
    isLoading: productsLoading,
    loadProducts,
    searchProducts,
    getProductStockQuantity,
    canAddProductToCart
  } = useProducts(selectedLocation?.id);

  const {
    cartItems,
    discount,
    setDiscount,
    subtotal,
    itemDiscounts,
    saleDiscount,
    subtotalAfterDiscount,
    taxAmount,
    taxRate,
    setTaxRate,
    totalAmount,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    addServiceToCart,
    setCartItems
  } = useCart(15.0);

  const {
    customers,
    selectedCustomer,
    setSelectedCustomer,
    createCustomer
  } = useCustomers();

  const {
    isCompletingSale,
    showReceiptModal,
    setShowReceiptModal,
    completedSale,
    receiptData,
    setReceiptData,
    receiptCartItems,
    setReceiptCartItems,
    receiptTotals,
    setReceiptTotals,
    processPayment,
    generateReceipt,
    downloadReceipt,
    printReceipt
  } = useSales();

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [selectedSearchIndex, setSelectedSearchIndex] = useState(-1);
  const [editingQuantities, setEditingQuantities] = useState<{[key: string]: string}>({});
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'BANK_TRANSFER' | 'CHEQUE'>('CASH');
  const [amountPaid, setAmountPaid] = useState(0);
  const [changeGiven, setChangeGiven] = useState(0);
  const [saleNotes, setSaleNotes] = useState('');
  const [biltyData, setBiltyData] = useState<BiltyFormData>({
    address: '',
    contact: '',
    labour: undefined,
    freightCharges: 0,
    labourExpense: 0
  });

  const PRODUCTS_PER_PAGE = 20;

  // Load products when location changes
  useEffect(() => {
    if (selectedLocation?.id) {
      loadProducts(selectedLocation.id);
    }
  }, [selectedLocation?.id, loadProducts]);

  // Initialize displayed products
  useEffect(() => {
    if (filteredProducts.length > 0) {
      const initialProducts = filteredProducts.slice(0, PRODUCTS_PER_PAGE);
      setDisplayedProducts(initialProducts);
      setCurrentPage(1);
    }
  }, [filteredProducts]);

  // Search functionality
  const handleSearchInput = (value: string) => {
    setSearchTerm(value);
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      performSearch(value);
    }, 300);
    
    setSearchTimeout(timeout);
  };

  const performSearch = async (searchTerm: string) => {
    if (!selectedLocation || searchTerm.length < 2) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    setSearchLoading(true);
    try {
      const results = await searchProducts(searchTerm);
      
      if (!Array.isArray(results)) {
        setSearchResults([]);
        setShowSearchDropdown(false);
        return;
      }
      
      const productsWithStock = results.filter(product => {
        const stock = getProductStockQuantity(product);
        return stock > 0;
      });
      
      setSearchResults(productsWithStock);
      setShowSearchDropdown(productsWithStock.length > 0);
    } catch (error) {
      console.error('Error searching products:', error);
      setSearchResults([]);
      setShowSearchDropdown(false);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleProductSelect = (product: Product) => {
    addToCart(product, getProductStockQuantity);
    setSearchTerm('');
    setSearchResults([]);
    setShowSearchDropdown(false);
    setSelectedSearchIndex(-1);
  };

  const handleSearchFocus = () => {
    if (searchResults.length > 0) {
      setShowSearchDropdown(true);
    }
  };

  const handleSearchBlur = () => {
    setTimeout(() => {
      setShowSearchDropdown(false);
    }, 200);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (!showSearchDropdown || searchResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSearchIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSearchIndex(prev => 
          prev > 0 ? prev - 1 : searchResults.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSearchIndex >= 0 && selectedSearchIndex < searchResults.length) {
          handleProductSelect(searchResults[selectedSearchIndex]);
        }
        break;
      case 'Escape':
        setShowSearchDropdown(false);
        setSelectedSearchIndex(-1);
        break;
    }
  };

  // Product list pagination
  const loadMoreProducts = () => {
    if (isLoadingMore) return;
    
    setIsLoadingMore(true);
    const startIndex = currentPage * PRODUCTS_PER_PAGE;
    const endIndex = startIndex + PRODUCTS_PER_PAGE;
    const newProducts = filteredProducts.slice(startIndex, endIndex);
    
    setDisplayedProducts(prev => [...prev, ...newProducts]);
    setCurrentPage(prev => prev + 1);
    setIsLoadingMore(false);
  };

  // Cart quantity editing
  const handleQuantityEdit = (itemId: string, value: string) => {
    setEditingQuantities(prev => ({
      ...prev,
      [itemId]: value
    }));
  };

  const handleQuantityEditFocus = (itemId: string, value: string) => {
    setEditingQuantities(prev => ({
      ...prev,
      [itemId]: value
    }));
  };

  const handleQuantityEditBlur = (itemId: string, value: string) => {
    const inputValue = editingQuantities[itemId];
    if (inputValue !== undefined) {
      const newQuantity = parseInt(inputValue) || 1;
      if (newQuantity >= 1) {
        const cartItem = cartItems.find(item => item.id === itemId);
        if (cartItem && cartItem.productId) {
          const product = products.find(p => p.id === cartItem.productId);
          if (product) {
            const currentStock = getProductStockQuantity(product);
            if (newQuantity > currentStock) {
              // Reset to current quantity
              setEditingQuantities(prev => ({
                ...prev,
                [itemId]: cartItem.quantity.toString()
              }));
              return;
            }
          }
        }
        updateQuantity(itemId, newQuantity, getProductStockQuantity, products);
      }
      setEditingQuantities(prev => {
        const newState = { ...prev };
        delete newState[itemId];
        return newState;
      });
    }
  };

  const handleQuantityEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, itemId: string) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  // Service form
  const handleAddService = (serviceData: any) => {
    addServiceToCart(serviceData);
  };

  // Customer form
  const handleCustomerSelect = (customer: any) => {
    setSelectedCustomer(customer);
  };

  // Bilty form
  const handleBiltyDataChange = (data: BiltyFormData) => {
    setBiltyData(data);
  };

  // Payment
  const handleCompleteSale = () => {
    if (cartItems.length === 0) {
      toast.error('Please add items to cart before completing sale');
      return;
    }
    setShowPaymentModal(true);
  };

  const handleProcessPayment = async (paymentData: any) => {
    try {
      await processPayment(
        cartItems,
        selectedCustomer,
        selectedLocation,
        paymentData.method,
        paymentData.amount,
        paymentData.notes,
        15.0,
        discount,
        subtotal,
        itemDiscounts,
        saleDiscount,
        subtotalAfterDiscount,
        taxAmount,
        totalAmount,
        changeGiven,
        paymentData.isCreditSale
      );

      // Clear cart and reset form
      clearCart();
      setSelectedCustomer(null);
      setAmountPaid(0);
      setChangeGiven(0);
      setSaleNotes('');
      setShowPaymentModal(false);
    } catch (error) {
      console.error('Payment processing failed:', error);
    }
  };

  // Receipt actions
  const handleDownloadReceipt = async (receiptId: string) => {
    await downloadReceipt(receiptId);
  };

  const handlePrintReceipt = async (receiptId: string) => {
    await printReceipt(receiptId);
  };

  const handleGenerateReceipt = async (saleId: string) => {
    try {
      await generateReceipt(saleId);
    } catch (error) {
      console.error('Receipt generation failed:', error);
    }
  };

  return (
    <div className="p-2 relative">
      {/* Loading Overlay */}
      {isCompletingSale && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Processing Sale</h3>
                <p className="text-sm text-gray-600">Please wait while we complete your sale...</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-12 gap-2 h-full">
        {/* Left Panel - Product Search */}
        <div className="col-span-4 flex flex-col gap-2">
          {/* Product Search Card */}
          <Card className="bg-white shadow-lg">
            <CardContent className="p-3">
              <h3 className="text-base font-semibold mb-2 text-gray-900">Search Product By Name/Barcode</h3>
              <ProductSearch
                searchTerm={searchTerm}
                onSearchChange={handleSearchInput}
                onProductSelect={handleProductSelect}
                searchResults={searchResults}
                showDropdown={showSearchDropdown}
                searchLoading={searchLoading}
                selectedIndex={selectedSearchIndex}
                onSearchFocus={handleSearchFocus}
                onSearchBlur={handleSearchBlur}
                onSearchKeyDown={handleSearchKeyDown}
                getProductStockQuantity={getProductStockQuantity}
              />
              <ServiceForm onAddService={handleAddService} />
            </CardContent>
          </Card>

          {/* Product List */}
          <Card className="bg-white shadow-lg">
            <CardContent className="p-3">
              <h3 className="text-base font-semibold mb-2 text-gray-900">Available Products</h3>
              <ProductList
                products={filteredProducts}
                displayedProducts={displayedProducts}
                onAddToCart={(product) => addToCart(product, getProductStockQuantity)}
                getProductStockQuantity={getProductStockQuantity}
                canAddProductToCart={canAddProductToCart}
                onLoadMore={loadMoreProducts}
                isLoadingMore={isLoadingMore}
                hasMoreProducts={displayedProducts.length < filteredProducts.length}
              />
            </CardContent>
          </Card>
        </div>

        {/* Middle Panel - Customer and Bilty Address Cards */}
        <div className="col-span-3 flex flex-col gap-2">
          {/* Customer Details Card */}
          <Card className="bg-white shadow-lg">
            <CardContent className="p-3">
              <h3 className="text-base font-semibold mb-2 text-gray-900">Customer</h3>
              <CustomerForm
                customers={customers}
                selectedCustomer={selectedCustomer}
                onCustomerSelect={handleCustomerSelect}
                onCreateCustomer={createCustomer}
              />
            </CardContent>
          </Card>

          {/* Bilty Address Card */}
          <Card className="bg-white shadow-lg">
            <CardContent className="p-3">
              <h3 className="text-base font-semibold mb-2 text-gray-900">Bilty Address</h3>
              <BiltyForm onDataChange={handleBiltyDataChange} />
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Order Summary */}
        <div className="col-span-5">
          <Card className="bg-white shadow-lg">
            <CardContent className="p-3">
              {/* Item List */}
              <div className="mb-4">
                <h3 className="text-base font-semibold mb-2 text-gray-900">Item List</h3>
                <CartItems
                  cartItems={cartItems}
                  onUpdateQuantity={(itemId, newQuantity) => updateQuantity(itemId, newQuantity, getProductStockQuantity, products)}
                  onRemoveItem={removeFromCart}
                  editingQuantities={editingQuantities}
                  onQuantityEdit={handleQuantityEdit}
                  onQuantityEditFocus={handleQuantityEditFocus}
                  onQuantityEditBlur={handleQuantityEditBlur}
                  onQuantityEditKeyDown={handleQuantityEditKeyDown}
                  getProductStockQuantity={getProductStockQuantity}
                  products={products}
                />
              </div>

              {/* Order Summary */}
              <div>
                <h3 className="text-base font-semibold mb-3 text-gray-900">Order Summary</h3>
                <OrderSummary
                  subtotal={subtotal}
                  discount={discount}
                  onDiscountChange={setDiscount}
                  totalAmount={totalAmount}
                  taxAmount={taxAmount}
                  taxRate={taxRate}
                  onTaxRateChange={setTaxRate}
                  onCompleteSale={handleCompleteSale}
                  isCompletingSale={isCompletingSale}
                  cartItemsCount={cartItems.length}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onProcessPayment={handleProcessPayment}
        totalAmount={totalAmount}
        isProcessing={isCompletingSale}
        selectedCustomer={selectedCustomer}
      />

      {/* Receipt Preview Modal */}
      <ReceiptPreviewModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        completedSale={completedSale}
        receiptData={receiptData}
        receiptCartItems={receiptCartItems}
        receiptTotals={receiptTotals}
        paymentMethod={paymentMethod}
        saleNotes={saleNotes}
        onDownloadReceipt={handleDownloadReceipt}
        onPrintReceipt={handlePrintReceipt}
        onGenerateReceipt={handleGenerateReceipt}
      />
    </div>
  );
}
