import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { ordersService, getErrorMessage } from '../api/api';

// NOTE: previously this hook defaulted to userId='1' regardless of who was
// logged in, so every user saw the same orders. It now always uses the
// authenticated user's id via AuthContext.
export const useOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [statusChanges, setStatusChanges] = useState([]);

  const pollingRef = useRef(null);
  const previousOrdersRef = useRef([]);

  // Fetch all orders for the current user.
  // TODO: Verify with backend — GET /orders is assumed to return only the
  // authenticated user's orders (scoped via the JWT), not every order.
  const fetchOrders = useCallback(async () => {
    if (!user?.id) {
      setOrders([]);
      setLoading(false);
      return [];
    }
    try {
      setLoading(true);
      const data = await ordersService.listMine();
      setOrders(data);
      previousOrdersRef.current = data;
      setError(null);
      return data;
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to fetch orders');
      setError(message);
      console.error('Error fetching orders:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch single order details
  const fetchOrderDetails = useCallback(async (orderId) => {
    try {
      setLoading(true);
      const data = await ordersService.getById(orderId);
      setCurrentOrder(data);
      setError(null);
      return data;
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to load order details');
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Start polling for order updates
  const startPolling = useCallback((interval = 10000) => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(async () => {
      const newOrders = await fetchOrders();

      newOrders.forEach((newOrder) => {
        const oldOrder = previousOrdersRef.current.find(o => o.id === newOrder.id);
        if (oldOrder && oldOrder.status !== newOrder.status) {
          const change = {
            orderId: newOrder.orderId || newOrder.id,
            oldStatus: oldOrder.status,
            newStatus: newOrder.status,
            timestamp: new Date().toISOString()
          };

          setStatusChanges(prev => [...prev, change]);
          toast.info(`Order #${newOrder.orderId || newOrder.id} status changed to ${newOrder.status}`);
        }
      });

      previousOrdersRef.current = newOrders;
    }, interval);
  }, [fetchOrders]);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const refreshOrders = useCallback(async () => {
    await fetchOrders();
    toast.success('Orders refreshed');
  }, [fetchOrders]);

  // Initialize
  useEffect(() => {
    fetchOrders();
    startPolling(10000); // Poll every 10 seconds

    return () => {
      stopPolling();
    };
  }, [fetchOrders, startPolling, stopPolling]);

  return {
    orders,
    loading,
    error,
    currentOrder,
    statusChanges,
    fetchOrders,
    fetchOrderDetails,
    refreshOrders,
    startPolling,
    stopPolling
  };
};
