import React, {
    createContext,
    useContext,
    useState,
    useEffect,
  } from "react";
  import { fetchCart, addToCart, updateCartItem, removeCartItem, getAccessToken } from "@/hooks/useFetch";
  
  const CartContext = createContext();
  
  export const useCart = () => useContext(CartContext);
  
  export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState({ items: [], total: 0 });
  
    // Load the cart data for a logged in user
    const loadCartData = async () => {
      try {
        const data = await fetchCart();
        setCart({
          ...data,
          total_items: data.items.length,
        });
      } catch (error) {
        console.error("Failed to load cart data:", error);
      }
    };
  
    // Load cart data when the component mounts
    useEffect(() => {
      loadCartData();
    }, []);
  
    // Add an item to the cart (logged in logic only)
    const addItemToCart = async (productId, quantity) => {
      await addToCart(productId, quantity);
      await loadCartData();
    };
  
    // Update item quantity for the cart
    const updateItemQuantity = async (itemId, quantity) => {
      const data = await updateCartItem(itemId, quantity);
      setCart(data);
    };
  
    // Remove an item from the cart
    const removeItemFromCart = async (itemId) => {
      await removeCartItem(itemId);
      const data = await fetchCart();
      setCart(data);
    };
  
    return (
      <CartContext.Provider
        value={{ cart, setCart, loadCartData, addItemToCart, updateItemQuantity, removeItemFromCart }}
      >
        {children}
      </CartContext.Provider>
    );
  };
  