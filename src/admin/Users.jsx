import React, { useEffect, useMemo, useState } from "react";
import {
  Users,
  User,
  UserCheck,
  UserX,
  Search,
  RefreshCw,
  Eye,
  Lock,
  Unlock,
  Loader2,
  Mail,
  Calendar,
  Shield,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { api } from "../api/api";
import { toast } from "react-toastify";

const UsersPage = () => {

  // ==========================
  // State
  // ==========================

  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");

  const [roleFilter, setRoleFilter] = useState("All");

  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedUser, setSelectedUser] = useState(null);

  const [showModal, setShowModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const usersPerPage = 10;

  // ==========================
  // Load Users
  // ==========================

  useEffect(() => {
    fetchUsers();
  }, []);

  // ==========================
  // Fetch Users
  // ==========================

  const fetchUsers = async () => {
    try {

      setLoading(true);

      const response = await api.get("/admin/users");

      setUsers(response.data.data || []);

    } catch (err) {

      console.log(err);

      toast.error(
        err.response?.data?.message ||
        "Failed to load users"
      );

    } finally {

      setLoading(false);

    }
  };

  // ==========================
  // Search + Filter
  // ==========================

  const filteredUsers = useMemo(() => {

    return users.filter((user) => {

      const searchMatch =

        user.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())

        ||

        user.email
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      const roleMatch =

        roleFilter === "All"

        ||

        user.role === roleFilter.toLowerCase();

      const statusMatch =

        statusFilter === "All"

        ||

        (statusFilter === "Blocked"

          ? user.isBlocked

          : !user.isBlocked);

      return (
        searchMatch &&
        roleMatch &&
        statusMatch
      );

    });

  }, [

    users,

    searchTerm,

    roleFilter,

    statusFilter

  ]);

  // ==========================
  // Statistics
  // ==========================

  const stats = {

    total: users.length,

    active: users.filter(
      (u) => !u.isBlocked
    ).length,

    blocked: users.filter(
      (u) => u.isBlocked
    ).length,

    admins: users.filter(
      (u) => u.role === "admin"
    ).length,

  };

  // ==========================
  // Pagination
  // ==========================

  const totalPages = Math.ceil(
    filteredUsers.length / usersPerPage
  );

  const currentUsers = filteredUsers.slice(

    (currentPage - 1) * usersPerPage,

    currentPage * usersPerPage

  )
    // ===================================
  // Refresh Users
  // ===================================

  const refreshUsers = () => {
    fetchUsers();
  };

  // ===================================
  // View User
  // ===================================

  const openUser = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const closeUser = () => {
    setSelectedUser(null);
    setShowModal(false);
  };

  // ===================================
  // Block User
  // ===================================

  const handleBlock = async (userId) => {
    const confirmBlock = window.confirm(
      "Are you sure you want to block this user?"
    );

    if (!confirmBlock) return;

    try {
      const response = await api.put(
        `/admin/users/${userId}/block`
      );

      toast.success(response.data.message);

      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId
            ? { ...user, isBlocked: true }
            : user
        )
      );

      if (
        selectedUser &&
        selectedUser._id === userId
      ) {
        setSelectedUser((prev) => ({
          ...prev,
          isBlocked: true,
        }));
      }

    } catch (err) {
      console.error(err);

      toast.error(
        err.response?.data?.message ||
          "Failed to block user"
      );
    }
  };

  // ===================================
  // Unblock User
  // ===================================

  const handleUnblock = async (userId) => {
    const confirmUnblock = window.confirm(
      "Are you sure you want to unblock this user?"
    );

    if (!confirmUnblock) return;

    try {
      const response = await api.put(
        `/admin/users/${userId}/unblock`
      );

      toast.success(response.data.message);

      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId
            ? { ...user, isBlocked: false }
            : user
        )
      );

      if (
        selectedUser &&
        selectedUser._id === userId
      ) {
        setSelectedUser((prev) => ({
          ...prev,
          isBlocked: false,
        }));
      }

    } catch (err) {
      console.error(err);

      toast.error(
        err.response?.data?.message ||
          "Failed to unblock user"
      );
    }
  };

  // ===================================
  // Badge Helpers
  // ===================================

  const getRoleBadge = (role) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-700";

      case "user":
        return "bg-blue-100 text-blue-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusBadge = (isBlocked) => {
    return isBlocked
      ? "bg-red-100 text-red-700"
      : "bg-green-100 text-green-700";
  };

  // ===================================
  // Loading Screen
  // ===================================

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    
    <div className="p-6">
          {/* ==========================
          Header
      ========================== */}

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            User Management
          </h1>

          <p className="text-gray-500 mt-1">
            Manage all registered users
          </p>
        </div>

        <button
          onClick={refreshUsers}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg"
        >
          <RefreshCw size={18} />
          Refresh
        </button>

      </div>

      {/* ==========================
          Statistics
      ========================== */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">

        <div className="bg-white rounded-xl shadow p-5">
          <Users className="text-blue-600 mb-3" size={30} />

          <p className="text-gray-500">Total Users</p>

          <h2 className="text-3xl font-bold">
            {stats.total}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <UserCheck className="text-green-600 mb-3" size={30} />

          <p className="text-gray-500">Active Users</p>

          <h2 className="text-3xl font-bold">
            {stats.active}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <UserX className="text-red-600 mb-3" size={30} />

          <p className="text-gray-500">Blocked Users</p>

          <h2 className="text-3xl font-bold">
            {stats.blocked}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <Shield className="text-purple-600 mb-3" size={30} />

          <p className="text-gray-500">Admins</p>

          <h2 className="text-3xl font-bold">
            {stats.admins}
          </h2>
        </div>

      </div>

      {/* ==========================
          Search & Filters
      ========================== */}

      <div className="bg-white rounded-xl shadow p-5 mb-8">

        <div className="grid md:grid-cols-3 gap-4">

          <div className="relative">

            <Search
              size={18}
              className="absolute left-3 top-4 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              className="w-full border rounded-lg pl-10 pr-4 py-3"
            />

          </div>

          <select
            value={roleFilter}
            onChange={(e) =>
              setRoleFilter(e.target.value)
            }
            className="border rounded-lg px-4 py-3"
          >
            <option>All</option>
            <option>User</option>
            <option>Admin</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="border rounded-lg px-4 py-3"
          >
            <option>All</option>
            <option>Active</option>
            <option>Blocked</option>
          </select>

        </div>

      </div>

      {/* ==========================
          Users Table
      ========================== */}

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="p-4 text-left">
                User
              </th>

              <th className="p-4 text-left">
                Email
              </th>

              <th className="p-4 text-left">
                Role
              </th>

              <th className="p-4 text-left">
                Status
              </th>

              <th className="p-4 text-left">
                Joined
              </th>

              <th className="p-4 text-center">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {currentUsers.length === 0 ? (

              <tr>

                <td
                  colSpan="6"
                  className="text-center py-12 text-gray-500"
                >
                  No users found.
                </td>

              </tr>

            ) : (

              currentUsers.map((user) => (

                <tr
                  key={user._id}
                  className="border-b hover:bg-gray-50"
                >

                  <td className="p-4">

                    <div className="flex items-center gap-3">

                      <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center">

                        <User
                          size={20}
                          className="text-blue-600"
                        />

                      </div>

                      <div>

                        <h3 className="font-semibold">

                          {user.name}

                        </h3>

                        <p className="text-sm text-gray-500">

                          {user._id.slice(-8)}

                        </p>

                      </div>

                    </div>

                  </td>

                  <td className="p-4">
                    {user.email}
                  </td>

                  <td className="p-4">

                    <span
                      className={`px-3 py-1 rounded-full text-sm ${getRoleBadge(
                        user.role
                      )}`}
                    >
                      {user.role}
                    </span>

                  </td>

                  <td className="p-4">

                    <span
                      className={`px-3 py-1 rounded-full text-sm ${getStatusBadge(
                        user.isBlocked
                      )}`}
                    >
                      {user.isBlocked
                        ? "Blocked"
                        : "Active"}
                    </span>

                  </td>

                  <td className="p-4">
                    {new Date(
                      user.createdAt
                    ).toLocaleDateString()}
                  </td>

                  <td className="p-4">

                    <div className="flex justify-center gap-3">

                      <button
                        onClick={() =>
                          openUser(user)
                        }
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye size={20} />
                      </button>

                      {user.isBlocked ? (

                        <button
                          onClick={() =>
                            handleUnblock(user._id)
                          }
                          className="text-green-600 hover:text-green-800"
                        >
                          <Unlock size={20} />
                        </button>

                      ) : (

                        <button
                          onClick={() =>
                            handleBlock(user._id)
                          }
                          className="text-red-600 hover:text-red-800"
                        >
                          <Lock size={20} />
                        </button>

                      )}

                    </div>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>
            {/* =====================================
          User Details Modal
      ===================================== */}

      {showModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">

            {/* Header */}

            <div className="flex justify-between items-center border-b px-6 py-4">

              <h2 className="text-2xl font-bold">
                User Details
              </h2>

              <button
                onClick={closeUser}
                className="hover:bg-gray-100 rounded-full p-2"
              >
                <X size={22} />
              </button>

            </div>

            {/* Body */}

            <div className="p-6">

              {/* Profile */}

              <div className="flex items-center gap-5 mb-8">

                <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">

                  <User
                    size={45}
                    className="text-blue-600"
                  />

                </div>

                <div>

                  <h2 className="text-2xl font-bold">

                    {selectedUser.name}

                  </h2>

                  <p className="text-gray-500">

                    {selectedUser.email}

                  </p>

                  <div className="flex gap-3 mt-4">

                    <span
                      className={`px-3 py-1 rounded-full text-sm ${getRoleBadge(
                        selectedUser.role
                      )}`}
                    >
                      {selectedUser.role}
                    </span>

                    <span
                      className={`px-3 py-1 rounded-full text-sm ${getStatusBadge(
                        selectedUser.isBlocked
                      )}`}
                    >
                      {selectedUser.isBlocked
                        ? "Blocked"
                        : "Active"}
                    </span>

                  </div>

                </div>

              </div>

              {/* Details */}

              <div className="grid md:grid-cols-2 gap-6">

                {/* Left */}

                <div className="bg-gray-50 rounded-xl p-5">

                  <h3 className="font-semibold mb-5">

                    Basic Information

                  </h3>

                  <div className="space-y-5">

                    <div className="flex gap-3">

                      <Mail className="text-blue-600" />

                      <div>

                        <p className="text-sm text-gray-500">

                          Email

                        </p>

                        <p>

                          {selectedUser.email}

                        </p>

                      </div>

                    </div>

                    <div className="flex gap-3">

                      <Shield className="text-purple-600" />

                      <div>

                        <p className="text-sm text-gray-500">

                          Role

                        </p>

                        <p>

                          {selectedUser.role}

                        </p>

                      </div>

                    </div>

                    <div className="flex gap-3">

                      <Calendar className="text-green-600" />

                      <div>

                        <p className="text-sm text-gray-500">

                          Joined

                        </p>

                        <p>

                          {new Date(
                            selectedUser.createdAt
                          ).toLocaleDateString()}

                        </p>

                      </div>

                    </div>

                  </div>

                </div>

                {/* Right */}

                <div className="bg-gray-50 rounded-xl p-5">

                  <h3 className="font-semibold mb-5">

                    Address

                  </h3>

                  {selectedUser.address ? (

                    <div className="space-y-3">

                      <p>

                        <strong>Name :</strong>{" "}

                        {selectedUser.address.name || "-"}

                      </p>

                      <p>

                        <strong>Phone :</strong>{" "}

                        {selectedUser.address.number || "-"}

                      </p>

                      <p>

                        <strong>Address :</strong>{" "}

                        {selectedUser.address.address || "-"}

                      </p>

                      <p>

                        <strong>City :</strong>{" "}

                        {selectedUser.address.city || "-"}

                      </p>

                      <p>

                        <strong>Pincode :</strong>{" "}

                        {selectedUser.address.pincode || "-"}

                      </p>

                    </div>

                  ) : (

                    <div className="text-gray-500">

                      Address not available

                    </div>

                  )}

                </div>

              </div>

              {/* Footer */}

              <div className="flex justify-end mt-8 border-t pt-5">

                <button
                  onClick={closeUser}
                  className="px-6 py-3 rounded-lg bg-gray-200 hover:bg-gray-300"
                >
                  Close
                </button>

              </div>

            </div>

          </div>

        </div>
      )}
            {/* =====================================
          Empty State
      ===================================== */}

      {!loading && filteredUsers.length === 0 && (
        <div className="bg-white rounded-xl shadow mt-8 p-16 text-center">

          <Users
            size={70}
            className="mx-auto text-gray-300"
          />

          <h2 className="text-2xl font-bold mt-5">
            No Users Found
          </h2>

          <p className="text-gray-500 mt-2">
            No users match your current search or filters.
          </p>

          <button
            onClick={refreshUsers}
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            Refresh Users
          </button>

        </div>
      )}

      {/* =====================================
          Pagination
      ===================================== */}

      {totalPages > 1 && (

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-8">

          <div className="text-sm text-gray-500">

            Showing{" "}

            <span className="font-semibold">
              {(currentPage - 1) * usersPerPage + 1}
            </span>

            {" "}to{" "}

            <span className="font-semibold">

              {Math.min(
                currentPage * usersPerPage,
                filteredUsers.length
              )}

            </span>

            {" "}of{" "}

            <span className="font-semibold">

              {filteredUsers.length}

            </span>

            {" "}Users

          </div>

          <div className="flex items-center gap-2">

            <button
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage((prev) => prev - 1)
              }
              className="border rounded-lg p-2 disabled:opacity-50 hover:bg-gray-100"
            >
              <ChevronLeft size={18} />
            </button>

            {Array.from(
              { length: totalPages },
              (_, index) => (

                <button
                  key={index}
                  onClick={() =>
                    setCurrentPage(index + 1)
                  }
                  className={`w-10 h-10 rounded-lg ${
                    currentPage === index + 1
                      ? "bg-blue-600 text-white"
                      : "border hover:bg-gray-100"
                  }`}
                >
                  {index + 1}
                </button>

              )
            )}

            <button
              disabled={
                currentPage === totalPages
              }
              onClick={() =>
                setCurrentPage((prev) => prev + 1)
              }
              className="border rounded-lg p-2 disabled:opacity-50 hover:bg-gray-100"
            >
              <ChevronRight size={18} />
            </button>

          </div>

        </div>

      )}

    </div>
    
  );
  
};

export default UsersPage;