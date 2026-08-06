import React, { useEffect, useMemo, useState } from "react";
import {
  Wrench,
  Search,
  RefreshCw,
  Eye,
  Loader2,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  ChevronLeft,
  ChevronRight,
  X,
  ClipboardList,
  CheckCircle2,
  Clock,
  UserCheck,
} from "lucide-react";

import { api } from "../api/api";
import { toast } from "react-toastify";

const ServicesPage = () => {

  // ===================================
  // States
  // ===================================

  const [services, setServices] = useState([]);

  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [selectedService, setSelectedService] =
    useState(null);

  const [showModal, setShowModal] =
    useState(false);

  const [currentPage, setCurrentPage] =
    useState(1);

  const servicesPerPage = 10;

  // ===================================
  // Load Services
  // ===================================

  useEffect(() => {
    fetchServices();
  }, []);

  // ===================================
  // Fetch Services
  // ===================================

  const fetchServices = async () => {

    try {

      setLoading(true);

      const response = await api.get(
        "/admin/services"
      );

      setServices(response.data.data || []);

    } catch (err) {

      console.log(err);

      toast.error(
        err.response?.data?.message ||
        "Failed to fetch services"
      );

    } finally {

      setLoading(false);

    }

  };

  // ===================================
  // Search + Filter
  // ===================================

  const filteredServices = useMemo(() => {

    return services.filter((service) => {

      const matchesSearch =

        service.fullName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())

        ||

        service.phone
          ?.includes(searchTerm)

        ||

        service.email
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =

        statusFilter === "All"

        ||

        service.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );

    });

  }, [

    services,

    searchTerm,

    statusFilter

  ]);

  // ===================================
  // Statistics
  // ===================================

  const stats = {

    total: services.length,

    pending: services.filter(
      s => s.status === "Pending"
    ).length,

    assigned: services.filter(
      s => s.status === "Assigned"
    ).length,

    completed: services.filter(
      s => s.status === "Completed"
    ).length,

  };

  // ===================================
  // Pagination
  // ===================================

  const totalPages = Math.ceil(
    filteredServices.length /
    servicesPerPage
  );

  const currentServices =
    filteredServices.slice(

      (currentPage - 1) *
      servicesPerPage,

      currentPage *
      servicesPerPage

    );

  // Purely presentational — which page-number buttons to render so
  // pagination doesn't overflow when there are many pages.
  const pageWindow = useMemo(() => {
    const delta = 1;
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  }, [totalPages, currentPage]);

  // ===================================
  // Refresh Services
  // ===================================

  const refreshServices = () => {
    fetchServices();
  };

  // ===================================
  // View Service
  // ===================================

  const openService = (service) => {
    setSelectedService(service);
    setShowModal(true);
  };

  const closeService = () => {
    setSelectedService(null);
    setShowModal(false);
  };

  // ===================================
  // Update Status
  // ===================================

  const updateStatus = async (serviceId, status) => {
    try {
      const response = await api.put(
        `/admin/services/${serviceId}/status`,
        { status }
      );

      toast.success(response.data.message);

      fetchServices();

      if (
        selectedService &&
        selectedService._id === serviceId
      ) {
        setSelectedService((prev) => ({
          ...prev,
          status,
        }));
      }

    } catch (err) {
      console.error(err);

      toast.error(
        err.response?.data?.message ||
        "Failed to update service status"
      );
    }
  };

  // ===================================
  // Status Badge (presentational styling only — same status values)
  // ===================================

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200";

      case "Assigned":
        return "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200";

      case "On The Way":
        return "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200";

      case "Completed":
        return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200";

      case "Cancelled":
        return "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200";

      default:
        return "bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-200";
    }
  };

  const getStatusDot = (status) => {
    switch (status) {
      case "Pending": return "bg-amber-500";
      case "Assigned": return "bg-blue-500";
      case "On The Way": return "bg-indigo-500";
      case "Completed": return "bg-emerald-500";
      case "Cancelled": return "bg-rose-500";
      default: return "bg-gray-400";
    }
  };

  // ===================================
  // Reset Pagination
  // ===================================

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Shared design tokens for this page
  const pageStyles = (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
      .svc-font { font-family: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif; }
      .svc-card {
        background: #ffffff;
        border: 1px solid rgba(15, 23, 42, 0.06);
        box-shadow: 0 1px 2px rgba(15,23,42,0.04), 0 8px 24px -12px rgba(15,23,42,0.08);
      }
      @keyframes svcFadeUp {
        from { opacity: 0; transform: translateY(6px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .svc-fade-up { animation: svcFadeUp 0.35s ease-out both; }
    `}</style>
  );

  // ===================================
  // Loading Screen
  // ===================================

  if (loading) {
    return (
      <div className="svc-font min-h-screen flex flex-col justify-center items-center gap-3 bg-gradient-to-b from-slate-50 to-white">
        {pageStyles}
        <Loader2 className="w-9 h-9 animate-spin text-indigo-600" />
        <p className="text-sm font-medium text-slate-500">Loading service requests...</p>
      </div>
    );
  }

  return (
    <div className="svc-font p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-slate-50 to-white min-h-screen">
      {pageStyles}

      {/* ===================================
          Header
      =================================== */}

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-200">
            <Wrench className="text-white" size={22} />
          </div>
          <div>
            <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Service Management
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Manage customer service requests
            </p>
          </div>
        </div>

        <button
          onClick={refreshServices}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-semibold text-sm shadow-md shadow-indigo-200 transition-all w-full sm:w-auto"
        >
          <RefreshCw size={16} />
          Refresh
        </button>

      </div>

      {/* ===================================
          Statistics
      =================================== */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-6 sm:mb-8">

        <div className="svc-card svc-fade-up rounded-2xl p-4 sm:p-5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center mb-3">
            <ClipboardList className="text-indigo-600" size={20} />
          </div>
          <p className="text-slate-500 text-xs sm:text-sm font-medium">
            Total Requests
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
            {stats.total}
          </h2>
        </div>

        <div className="svc-card svc-fade-up rounded-2xl p-4 sm:p-5" style={{ animationDelay: '40ms' }}>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mb-3">
            <Clock className="text-amber-600" size={20} />
          </div>
          <p className="text-slate-500 text-xs sm:text-sm font-medium">
            Pending
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
            {stats.pending}
          </h2>
        </div>

        <div className="svc-card svc-fade-up rounded-2xl p-4 sm:p-5" style={{ animationDelay: '80ms' }}>
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
            <UserCheck className="text-blue-600" size={20} />
          </div>
          <p className="text-slate-500 text-xs sm:text-sm font-medium">
            Assigned
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
            {stats.assigned}
          </h2>
        </div>

        <div className="svc-card svc-fade-up rounded-2xl p-4 sm:p-5" style={{ animationDelay: '120ms' }}>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-3">
            <CheckCircle2 className="text-emerald-600" size={20} />
          </div>
          <p className="text-slate-500 text-xs sm:text-sm font-medium">
            Completed
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
            {stats.completed}
          </h2>
        </div>

      </div>

      {/* ===================================
          Search & Filter
      =================================== */}

      <div className="svc-card rounded-2xl p-4 sm:p-5 mb-6 sm:mb-8">

        <div className="grid md:grid-cols-[1fr_220px] gap-3 sm:gap-4">

          <div className="relative">

            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search by name, phone or email..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all"
            />

          </div>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="border border-slate-200 rounded-xl px-4 py-2.5 sm:py-3 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 cursor-pointer transition-all"
          >
            <option>All</option>
            <option>Pending</option>
            <option>Assigned</option>
            <option>On The Way</option>
            <option>Completed</option>
            <option>Cancelled</option>
          </select>

        </div>

      </div>

      {/* ===================================
          Services — table (desktop) / cards (mobile)
      =================================== */}

      <div className="svc-card rounded-2xl overflow-hidden">

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">

            <thead className="bg-slate-50">

              <tr>

                <th className="p-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  Customer
                </th>

                <th className="p-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  Service
                </th>

                <th className="p-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  Preferred Date
                </th>

                <th className="p-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="p-4 text-center text-xs font-bold uppercase tracking-wide text-slate-500">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {currentServices.length === 0 ? (

                <tr>

                  <td
                    colSpan="5"
                    className="text-center py-14 text-slate-400"
                  >
                    No service requests found.
                  </td>

                </tr>

              ) : (

                currentServices.map((service) => (

                  <tr
                    key={service._id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70 transition-colors"
                  >

                    <td className="p-4">

                      <div>

                        <h3 className="font-semibold text-slate-800">
                          {service.fullName}
                        </h3>

                        <p className="text-sm text-slate-500">
                          {service.phone}
                        </p>

                      </div>

                    </td>

                    <td className="p-4 text-slate-600 text-sm">
                      {service.serviceType}
                    </td>

                    <td className="p-4 text-slate-600 text-sm">

                      {service.preferredDate
                        ? new Date(
                          service.preferredDate
                        ).toLocaleDateString()
                        : "-"}

                    </td>

                    <td className="p-4">

                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                          service.status
                        )}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(service.status)}`} />
                        {service.status}
                      </span>

                    </td>

                    <td className="p-4">

                      <div className="flex justify-center items-center gap-3">

                        <button
                          onClick={() =>
                            openService(service)
                          }
                          className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 p-1.5 rounded-lg transition-colors"
                          title="View details"
                        >
                          <Eye size={18} />
                        </button>

                        <select
                          value={service.status}
                          onChange={(e) =>
                            updateStatus(
                              service._id,
                              e.target.value
                            )
                          }
                          className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 cursor-pointer"
                        >
                          <option>Pending</option>
                          <option>Assigned</option>
                          <option>On The Way</option>
                          <option>Completed</option>
                          <option>Cancelled</option>
                        </select>

                      </div>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>
        </div>

        {/* Mobile cards — same data, different layout */}
        <div className="md:hidden divide-y divide-slate-100">
          {currentServices.length === 0 ? (
            <div className="text-center py-14 text-slate-400 text-sm">
              No service requests found.
            </div>
          ) : (
            currentServices.map((service) => (
              <div key={service._id} className="p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-800 truncate">
                      {service.fullName}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {service.serviceType}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${getStatusBadge(
                      service.status
                    )}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(service.status)}`} />
                    {service.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                  <span>{service.phone}</span>
                  <span>
                    {service.preferredDate
                      ? new Date(service.preferredDate).toLocaleDateString()
                      : "-"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openService(service)}
                    className="flex-1 flex items-center justify-center gap-1.5 text-indigo-600 border border-indigo-200 bg-indigo-50 py-2 rounded-lg text-xs font-semibold"
                  >
                    <Eye size={14} />
                    View
                  </button>

                  <select
                    value={service.status}
                    onChange={(e) => updateStatus(service._id, e.target.value)}
                    className="flex-1 border border-slate-200 rounded-lg px-2 py-2 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  >
                    <option>Pending</option>
                    <option>Assigned</option>
                    <option>On The Way</option>
                    <option>Completed</option>
                    <option>Cancelled</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
      {/* ===================================
          Service Details Modal
      =================================== */}

      {showModal && selectedService && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">

          <div className="svc-font bg-white rounded-t-3xl sm:rounded-2xl shadow-xl w-full sm:max-w-3xl max-h-[92vh] overflow-y-auto">

            {/* Header */}

            <div className="sticky top-0 bg-white flex justify-between items-center px-5 sm:px-6 py-4 border-b border-slate-100 z-10">

              <h2 className="text-lg sm:text-2xl font-bold text-slate-900">
                Service Details
              </h2>

              <button
                onClick={closeService}
                className="hover:bg-slate-100 rounded-full p-2 transition-colors"
              >
                <X size={20} />
              </button>

            </div>

            {/* Body */}

            <div className="p-5 sm:p-6">

              {/* Customer */}

              <div className="flex items-center gap-4 sm:gap-5 mb-6 sm:mb-8">

                <div className="w-14 h-14 sm:w-20 sm:h-20 shrink-0 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center">

                  <User
                    size={28}
                    className="text-indigo-600 sm:w-10 sm:h-10"
                  />

                </div>

                <div className="min-w-0">

                  <h2 className="text-lg sm:text-2xl font-bold text-slate-900 truncate">

                    {selectedService.fullName}

                  </h2>

                  <p className="text-slate-500 text-sm">

                    {selectedService.serviceType}

                  </p>

                  <span
                    className={`inline-flex items-center gap-1.5 mt-2 sm:mt-3 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${getStatusBadge(
                      selectedService.status
                    )}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(selectedService.status)}`} />
                    {selectedService.status}
                  </span>

                </div>

              </div>

              {/* Details */}

              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">

                {/* Contact */}

                <div className="bg-slate-50 rounded-2xl p-4 sm:p-5">

                  <h3 className="font-bold text-slate-800 mb-4 sm:mb-5 text-sm uppercase tracking-wide">
                    Contact Information
                  </h3>

                  <div className="space-y-4 sm:space-y-5">

                    <div className="flex gap-3">

                      <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                        <Phone className="text-emerald-600" size={16} />
                      </div>

                      <div className="min-w-0">

                        <p className="text-xs text-slate-500">
                          Phone
                        </p>

                        <p className="text-sm font-medium text-slate-700 break-words">
                          {selectedService.phone}
                        </p>

                      </div>

                    </div>

                    <div className="flex gap-3">

                      <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                        <Mail className="text-blue-600" size={16} />
                      </div>

                      <div className="min-w-0">

                        <p className="text-xs text-slate-500">
                          Email
                        </p>

                        <p className="text-sm font-medium text-slate-700 break-words">
                          {selectedService.email}
                        </p>

                      </div>

                    </div>

                    <div className="flex gap-3">

                      <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                        <Calendar className="text-purple-600" size={16} />
                      </div>

                      <div className="min-w-0">

                        <p className="text-xs text-slate-500">
                          Preferred Date
                        </p>

                        <p className="text-sm font-medium text-slate-700">

                          {selectedService.preferredDate
                            ? new Date(
                              selectedService.preferredDate
                            ).toLocaleDateString()
                            : "-"}

                        </p>

                      </div>

                    </div>

                  </div>

                </div>

                {/* Service */}

                <div className="bg-slate-50 rounded-2xl p-4 sm:p-5">

                  <h3 className="font-bold text-slate-800 mb-4 sm:mb-5 text-sm uppercase tracking-wide">
                    Service Information
                  </h3>

                  <div className="space-y-4">

                    <div>

                      <p className="text-xs text-slate-500">
                        Address
                      </p>

                      <div className="flex gap-2 mt-1">

                        <MapPin
                          size={16}
                          className="text-rose-500 mt-0.5 shrink-0"
                        />

                        <p className="text-sm font-medium text-slate-700 break-words">
                          {selectedService.address}
                        </p>

                      </div>

                    </div>

                    <div>

                      <p className="text-xs text-slate-500">
                        Service Type
                      </p>

                      <p className="text-sm font-medium text-slate-700">
                        {selectedService.serviceType}
                      </p>

                    </div>

                    <div>

                      <p className="text-xs text-slate-500">
                        Description
                      </p>

                      <p className="text-sm text-slate-700 mt-1">
                        {selectedService.description ||
                          "No description provided"}
                      </p>

                    </div>

                  </div>

                </div>

              </div>

              {/* Status */}

              <div className="mt-6 sm:mt-8">

                <label className="font-bold text-sm text-slate-800 block mb-3">
                  Update Status
                </label>

                <select
                  value={selectedService.status}
                  onChange={(e) => {
                    updateStatus(
                      selectedService._id,
                      e.target.value
                    );

                    setSelectedService({
                      ...selectedService,
                      status: e.target.value,
                    });
                  }}
                  className="border border-slate-200 rounded-xl px-4 py-3 w-full text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 cursor-pointer"
                >
                  <option>Pending</option>
                  <option>Assigned</option>
                  <option>On The Way</option>
                  <option>Completed</option>
                  <option>Cancelled</option>
                </select>

              </div>

              {/* Footer */}

              <div className="flex justify-end mt-6 sm:mt-8 border-t border-slate-100 pt-5">

                <button
                  onClick={closeService}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 font-semibold text-sm text-slate-700 transition-colors"
                >
                  Close
                </button>

              </div>

            </div>

          </div>

        </div>
      )}
      {/* ===================================
          Empty State
      =================================== */}

      {!loading && filteredServices.length === 0 && (
        <div className="svc-card mt-6 sm:mt-8 p-10 sm:p-16 text-center rounded-2xl">

          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto">
            <Wrench
              size={32}
              className="text-slate-300"
            />
          </div>

          <h2 className="text-lg sm:text-2xl font-bold mt-5 text-slate-800">
            No Service Requests
          </h2>

          <p className="text-slate-500 mt-2 text-sm">
            No service requests match your current search or filter.
          </p>

          <button
            onClick={refreshServices}
            className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-md shadow-indigo-200 transition-colors"
          >
            Refresh
          </button>

        </div>
      )}

      {/* ===================================
          Pagination
      =================================== */}

      {totalPages > 1 && (

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 sm:mt-8">

          <div className="text-xs sm:text-sm text-slate-500 order-2 sm:order-1">

            Showing{" "}

            <span className="font-semibold text-slate-700">
              {(currentPage - 1) * servicesPerPage + 1}
            </span>

            {" "}to{" "}

            <span className="font-semibold text-slate-700">
              {Math.min(
                currentPage * servicesPerPage,
                filteredServices.length
              )}
            </span>

            {" "}of{" "}

            <span className="font-semibold text-slate-700">
              {filteredServices.length}
            </span>

            {" "}Services

          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 order-1 sm:order-2">

            <button
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage((prev) => prev - 1)
              }
              className="border border-slate-200 rounded-lg p-2 disabled:opacity-40 hover:bg-slate-100 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>

            {pageWindow.map((item, index) =>
              item === "..." ? (
                <span key={`ellipsis-${index}`} className="w-8 text-center text-slate-400 text-sm">
                  &hellip;
                </span>
              ) : (
                <button
                  key={item}
                  onClick={() => setCurrentPage(item)}
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg text-sm font-medium transition-colors ${currentPage === item
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                      : "border border-slate-200 hover:bg-slate-100 text-slate-600"
                    }`}
                >
                  {item}
                </button>
              )
            )}

            <button
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((prev) => prev + 1)
              }
              className="border border-slate-200 rounded-lg p-2 disabled:opacity-40 hover:bg-slate-100 transition-colors"
            >
              <ChevronRight size={16} />
            </button>

          </div>

        </div>

      )}

    </div>
  );
};

export default ServicesPage;