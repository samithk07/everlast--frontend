import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Eye,
  Package,
  ShoppingBag,
  Users,
  IndianRupee,
  Loader2,
  X,
} from "lucide-react";
import { api } from "../api/api";
import { toast } from "react-toastify";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const ordersPerPage = 10;

  useEffect(() => {
    fetchOrders();
  }, []);

  // ============================
  // Fetch Orders
  // ============================
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/orders");
      setOrders(response.data.data || []);
      setError("");
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Failed to fetch orders");
      toast.error(err.response?.data?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // Statistics
  // ============================
  const stats = useMemo(() => {
    const revenue = orders.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0
    );
    const delivered = orders.filter(
      (o) => o.orderStatus === "Delivered"
    ).length;
    const pending = orders.filter((o) => o.orderStatus === "Placed").length;

    return {
      totalOrders: orders.length,
      revenue,
      delivered,
      pending,
    };
  }, [orders]);

  // ============================
  // Filters
  // ============================
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || order.orderStatus === statusFilter;

    const matchesPayment =
      paymentFilter === "All" || order.paymentStatus === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  // ============================
  // Pagination
  // ============================
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const currentOrders = filteredOrders.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  );

  // Reset to page 1 whenever filters change and current page is out of range
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages]);

  // ============================
  // Status Badge
  // ============================
  const getStatusColor = (status) => {
    switch (status) {
      case "Placed":
        return "bg-amber-100 text-amber-700 ring-1 ring-amber-200";
      case "Processing":
        return "bg-blue-100 text-blue-700 ring-1 ring-blue-200";
      case "Shipped":
        return "bg-violet-100 text-violet-700 ring-1 ring-violet-200";
      case "Delivered":
        return "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200";
      case "Cancelled":
        return "bg-red-100 text-red-700 ring-1 ring-red-200";
      default:
        return "bg-gray-100 text-gray-700 ring-1 ring-gray-200";
    }
  };

  const getPaymentColor = (status) => {
    switch (status) {
      case "Paid":
        return "text-emerald-600";
      case "Failed":
        return "text-red-600";
      default:
        return "text-amber-600";
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const response = await api.put(`/admin/orders/${orderId}/status`, {
        orderStatus: newStatus,
      });

      toast.success(response.data.message);

      // Update the modal immediately
      setSelectedOrder((prev) => ({
        ...prev,
        orderStatus: newStatus,
      }));

      // Refresh table data
      await fetchOrders();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update order");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin w-10 h-10 sm:w-12 sm:h-12 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 max-w-[1600px] mx-auto overflow-x-hidden">
      {/* ================= Header ================= */}
      <div className="flex flex-col gap-1 mb-5 sm:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
          Orders
        </h1>
        <p className="text-xs sm:text-sm lg:text-base text-gray-500">
          Manage all customer orders
        </p>
      </div>

      {error && (
        <div className="mb-5 sm:mb-6 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm break-words">
          {error}
        </div>
      )}

      {/* ================= Cards ================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6 mb-5 sm:mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-5 hover:shadow-md transition-shadow min-w-0">
          <div className="flex justify-between items-start gap-2">
            <div className="min-w-0">
              <p className="text-[11px] sm:text-sm text-gray-500 truncate">
                Total Orders
              </p>
              <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold mt-0.5 sm:mt-2 text-gray-900">
                {stats.totalOrders}
              </h2>
            </div>
            <div className="rounded-lg bg-blue-50 p-1.5 sm:p-2.5 shrink-0">
              <ShoppingBag className="w-4 h-4 sm:w-6 sm:h-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-5 hover:shadow-md transition-shadow min-w-0">
          <div className="flex justify-between items-start gap-2">
            <div className="min-w-0">
              <p className="text-[11px] sm:text-sm text-gray-500 truncate">
                Revenue
              </p>
              <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold mt-0.5 sm:mt-2 text-gray-900 truncate">
                ₹{stats.revenue.toLocaleString()}
              </h2>
            </div>
            <div className="rounded-lg bg-green-50 p-1.5 sm:p-2.5 shrink-0">
              <IndianRupee className="w-4 h-4 sm:w-6 sm:h-6 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-5 hover:shadow-md transition-shadow min-w-0">
          <div className="flex justify-between items-start gap-2">
            <div className="min-w-0">
              <p className="text-[11px] sm:text-sm text-gray-500 truncate">
                Delivered
              </p>
              <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold mt-0.5 sm:mt-2 text-gray-900">
                {stats.delivered}
              </h2>
            </div>
            <div className="rounded-lg bg-emerald-50 p-1.5 sm:p-2.5 shrink-0">
              <Package className="w-4 h-4 sm:w-6 sm:h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-5 hover:shadow-md transition-shadow min-w-0">
          <div className="flex justify-between items-start gap-2">
            <div className="min-w-0">
              <p className="text-[11px] sm:text-sm text-gray-500 truncate">
                Pending
              </p>
              <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold mt-0.5 sm:mt-2 text-gray-900">
                {stats.pending}
              </h2>
            </div>
            <div className="rounded-lg bg-orange-50 p-1.5 sm:p-2.5 shrink-0">
              <Users className="w-4 h-4 sm:w-6 sm:h-6 text-orange-500" />
            </div>
          </div>
        </div>
      </div>

      {/* ================= Filters ================= */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-5 mb-5 sm:mb-6">
        <div className="flex flex-row gap-2 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
          <div className="relative flex-1 min-w-0 sm:col-span-2 lg:col-span-1">
            <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Search orders..."
              className="border border-gray-200 rounded-lg pl-8 sm:pl-10 pr-2 sm:pr-4 py-2 w-full text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <select
            className="border border-gray-200 rounded-lg px-1.5 sm:px-3 py-2 text-xs sm:text-sm w-20 sm:w-full shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option>All</option>
            <option>Placed</option>
            <option>Processing</option>
            <option>Shipped</option>
            <option>Delivered</option>
            <option>Cancelled</option>
          </select>

          <select
            className="border border-gray-200 rounded-lg px-1.5 sm:px-3 py-2 text-xs sm:text-sm w-20 sm:w-full shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option>All</option>
            <option>Pending</option>
            <option>Paid</option>
            <option>Failed</option>
          </select>
        </div>
      </div>

      {/* ================= Orders: Table (desktop / tablet) ================= */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Order ID
                </th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Customer
                </th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Amount
                </th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Payment
                </th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Status
                </th>
                <th className="p-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentOrders.map((order) => (
                <tr
                  key={order._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="p-4 font-mono text-sm text-gray-600">
                    #{order._id.slice(-8)}
                  </td>
                  <td className="p-4 max-w-[220px]">
                    <p className="font-semibold text-gray-900 truncate">
                      {order.shippingAddress?.fullName}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {order.shippingAddress?.phone}
                    </p>
                  </td>
                  <td className="p-4 font-medium text-gray-900 whitespace-nowrap">
                    ₹{(order.totalAmount ?? 0).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-sm font-medium ${getPaymentColor(
                        order.paymentStatus
                      )}`}
                    >
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(
                        order.orderStatus
                      )}`}
                    >
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                        title="View order"
                      >
                        <Eye className="w-5 h-5 text-blue-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {currentOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-gray-400">
                    No orders match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= Orders: Cards (mobile) ================= */}
      <div className="md:hidden space-y-3">
        {currentOrders.map((order) => (
          <div
            key={order._id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-3.5 sm:p-4"
          >
            <div className="flex justify-between items-start gap-2 mb-3">
              <div className="min-w-0">
                <p className="font-mono text-xs text-gray-500 truncate">
                  #{order._id.slice(-8)}
                </p>
                <p className="font-semibold text-gray-900 mt-0.5 truncate">
                  {order.shippingAddress?.fullName}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {order.shippingAddress?.phone}
                </p>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-medium whitespace-nowrap shrink-0 ${getStatusColor(
                  order.orderStatus
                )}`}
              >
                {order.orderStatus}
              </span>
            </div>

            <div className="flex justify-between items-center border-t border-gray-100 pt-3">
              <div className="min-w-0">
                <p className="font-semibold text-gray-900">
                  ₹{(order.totalAmount ?? 0).toLocaleString()}
                </p>
                <span
                  className={`text-xs font-medium ${getPaymentColor(
                    order.paymentStatus
                  )}`}
                >
                  {order.paymentStatus}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(order)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors text-xs font-medium text-blue-600 shrink-0"
              >
                <Eye className="w-4 h-4" />
                View
              </button>
            </div>
          </div>
        ))}

        {currentOrders.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center text-gray-400">
            No orders match your filters.
          </div>
        )}
      </div>

      {/* ================= Pagination ================= */}
      {totalPages > 1 && (
        <div className="flex flex-wrap justify-center md:justify-end items-center mt-6 gap-1.5 sm:gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="px-3 sm:px-4 py-2 rounded-lg border border-gray-200 text-xs sm:text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index + 1)}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-xs sm:text-sm transition-colors ${
                currentPage === index + 1
                  ? "bg-blue-600 text-white"
                  : "border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {index + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="px-3 sm:px-4 py-2 rounded-lg border border-gray-200 text-xs sm:text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* ================= View Order Modal ================= */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-xl w-full sm:max-w-3xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-8 relative">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-3 right-3 sm:top-4 sm:right-5 p-1.5 rounded-lg hover:bg-gray-100 transition-colors z-10"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            <h2 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6 pr-8 text-gray-900">
              Order Details
            </h2>

            <div className="grid sm:grid-cols-2 gap-5 sm:gap-8">
              <div className="min-w-0">
                <h3 className="font-semibold mb-3 text-gray-900">Customer</h3>
                <div className="space-y-1.5 text-sm text-gray-700">
                  <p className="break-words">
                    <span className="text-gray-500">Name:</span>{" "}
                    {selectedOrder.shippingAddress?.fullName}
                  </p>
                  <p className="break-words">
                    <span className="text-gray-500">Phone:</span>{" "}
                    {selectedOrder.shippingAddress?.phone}
                  </p>
                  <p className="text-gray-500 pt-1">Address:</p>
                  <p className="text-gray-600 leading-relaxed break-words">
                    {selectedOrder.shippingAddress?.address}
                    {selectedOrder.shippingAddress?.address && ", "}
                    {selectedOrder.shippingAddress?.city}
                    {selectedOrder.shippingAddress?.city && ", "}
                    {selectedOrder.shippingAddress?.state}{" "}
                    {selectedOrder.shippingAddress?.pincode}
                  </p>
                </div>
              </div>

              <div className="min-w-0">
                <h3 className="font-semibold mb-3 text-gray-900">
                  Order Summary
                </h3>
                <div className="space-y-1.5 text-sm text-gray-700">
                  <p className="break-all">
                    <span className="text-gray-500">Order ID:</span>{" "}
                    {selectedOrder._id}
                  </p>
                  <p>
                    <span className="text-gray-500">Total:</span>{" "}
                    <span className="font-semibold">
                      ₹{(selectedOrder.totalAmount ?? 0).toLocaleString()}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-500">Payment:</span>{" "}
                    {selectedOrder.paymentMethod}
                  </p>
                  <p>
                    <span className="text-gray-500">Payment Status:</span>{" "}
                    {selectedOrder.paymentStatus}
                  </p>
                </div>

                <div className="mt-5">
                  <label className="block mb-2 text-sm font-semibold text-gray-900">
                    Update Status
                  </label>
                  <select
                    className="border border-gray-200 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={selectedOrder.orderStatus}
                    onChange={(e) =>
                      handleUpdateStatus(selectedOrder._id, e.target.value)
                    }
                  >
                    <option value="Placed">Placed</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Products */}
            <div className="mt-6 sm:mt-8">
              <h3 className="font-semibold mb-3 sm:mb-4 text-gray-900">
                Ordered Products
              </h3>
              <div className="space-y-2.5 sm:space-y-3">
                {(selectedOrder.items ?? []).map((item, idx) => (
                  <div
                    key={item.product?._id ?? idx}
                    className="flex justify-between items-center gap-3 border border-gray-100 rounded-lg p-3 sm:p-4"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-semibold text-gray-900 truncate">
                        {item.product?.name ?? "Product unavailable"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="font-medium text-gray-900 whitespace-nowrap shrink-0">
                      ₹{(item.price ?? 0).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end mt-6 sm:mt-8">
              <button
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                onClick={() => setSelectedOrder(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;