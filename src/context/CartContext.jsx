import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/api";
import { useAuth } from "./AuthContext";
import { toast } from "react-toastify";

const CartContext = createContext();

function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cartFetched, setCartFetched] = useState(false);

  const [count, setCount] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (user) {
      loadUserCart();
    } else {
      setItems([]);
      setCount(0);
      setTotal(0);
    }
  }, [user]);

  // Load user's cart from database
 const loadUserCart = async () => {
  try {
    setIsLoading(true);

    const response = await api.get("/cart");

    const cartData = response.data.data;

    if (cartData?.items) {
      const formattedItems = cartData.items.map((item) => ({
        ...item.product,
        quantity: item.quantity,
      }));

      setItems(formattedItems);

      // Calculate count
      const itemCount = formattedItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      // Calculate total
      const cartTotal = formattedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      setCount(itemCount);
      setTotal(cartTotal);
    } else {
      setItems([]);
      setCount(0);
      setTotal(0);
    }
  } catch (err) {
    console.error("Cart load error:", err);

    setItems([]);
    setCount(0);
    setTotal(0);
  } finally {
    setIsLoading(false);
    setCartFetched(true);
  }
};

  const addToCart = async (product) => {
    if (!user) {
      toast.error("Please login to add items to cart");
      return { success: false };
    }

    try {
      const response = await api.post(`/cart/${product._id}`);

      await loadUserCart();

      toast.success(response.data.message);

      return {
        success: true,
        data: response.data,
      };
    } catch (err) {
      toast.error(err.response?.data?.Message || "Failed to add to cart");

      return {
        success: false,
        error: err.response?.data?.Message,
      };
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const response = await api.delete(`/cart/${productId}`);
      await loadUserCart();
      toast.success(response.data.message);
      return { success: true };
    } catch (err) {
      toast.error(err.response?.data?.Message || "Failed to remove item");
      return { success: false };
    }
  };

  const increaseQuantity = async (productId) => {
  const item = items.find((item) => item._id === productId);

  if (!item) return { success: false };

  try {
    await api.put(`/cart/${productId}`, {
      quantity: item.quantity + 1,
    });

    await loadUserCart();

    return { success: true };
  } catch (e) {
    toast.error(
      e.response?.data?.message || "Cannot increase quantity"
    );

    return { success: false };
  }
};

  const decreaseQuantity = async (productId) => {
  const item = items.find((item) => item._id === productId);

  if (!item) return { success: false };

  if (item.quantity <= 1) {
    return removeFromCart(productId);
  }

  try {
    await api.put(`/cart/${productId}`, {
      quantity: item.quantity - 1,
    });

    await loadUserCart();

    return { success: true };
  } catch (e) {
    toast.error(
      e.response?.data?.message || "Cannot decrease quantity"
    );

    return { success: false };
  }
};


  const clearCart = async () => {
  try {
    await api.delete("/cart");
    await loadUserCart();

    toast.success("Cart cleared successfully");

    return { success: true };
  } catch (err) {
    toast.error("Failed to clear cart");

    return { success: false };
  }
};

  const getCartItemQuantity = (productId) => {
    const item = items.find((item) => item._id === productId);
    return item ? item.quantity : 0;
  };

  const values = {
    items,
    cartFetched,
    count,
    total,
    isLoading,
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    getCartItemQuantity,
    loadUserCart,
  };

  return <CartContext.Provider value={values}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export default CartProvider;