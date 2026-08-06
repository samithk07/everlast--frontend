import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  X,
  Loader2,
  Package,
  Image as ImageIcon,
} from "lucide-react";

import { api } from "../api/api";
import { toast } from "react-toastify";

const ProductsPage = () => {

  // ===============================
  // States
  // ===============================

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);

  const [previewImage, setPreviewImage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);

  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  const productsPerPage = 8;

  const initialForm = {
    name: "",
    category: "",
    description: "",
    brand: "",
    price: "",
    originalPrice: "",
    discount: "",
    stock: "",
    rating: "",
    reviews: "",
    warranty: "",
    features: "",
    status: "active",
    image: null,
  };

  const [formData, setFormData] = useState(initialForm);

  // ===============================
  // Load Products
  // ===============================

  useEffect(() => {
    fetchProducts();
  }, []);

  // ===============================
  // Fetch Products
  // ===============================

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const response = await api.get("/admin/products");

      setProducts(response.data.data || []);

      setError("");

    } catch (err) {

      console.log(err);

      setError(
        err.response?.data?.message ||
          "Failed to fetch products"
      );

      toast.error(
        err.response?.data?.message ||
          "Failed to fetch products"
      );

    } finally {

      setLoading(false);

    }
  };

  // ===============================
  // Search + Filter
  // ===============================

  const filteredProducts = useMemo(() => {

    return products.filter((product) => {

      const matchesSearch =
        product.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||

        product.brand
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||

        product.description
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" ||

        product.category === selectedCategory;

      return matchesSearch && matchesCategory;

    });

  }, [products, searchTerm, selectedCategory]);

  // ===============================
  // Pagination
  // ===============================

  const totalPages = Math.ceil(
    filteredProducts.length / productsPerPage
  );

  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  // ===============================
  // Categories
  // ===============================

  const categories = [
    "All",

    ...new Set(
      products.map((item) => item.category)
    ),
  ];

  // ===============================
  // Open Add Modal
  // ===============================

  const openAddModal = () => {

    setEditingProduct(null);

    setFormData(initialForm);

    setPreviewImage("");

    setShowModal(true);

  };

  // ===============================
  // Open Edit Modal
  // ===============================

  const openEditModal = (product) => {

    setEditingProduct(product);

    setFormData({
      name: product.name || "",
      category: product.category || "",
      description: product.description || "",
      brand: product.brand || "",
      price: product.price || "",
      originalPrice: product.originalPrice || "",
      discount: product.discount || "",
      stock: product.stock || "",
      rating: product.rating || "",
      reviews: product.reviews || "",
      warranty: product.warranty || "",
      features: Array.isArray(product.features)
        ? product.features.join(", ")
        : product.features || "",
      status: product.status || "active",
      image: null,
    });

    setPreviewImage(product.image?.url || "");

    setShowModal(true);

  }

    // ==========================================
  // Handle Input Change
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================
  // Handle Image Change
  // ==========================================

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setFormData((prev) => ({
      ...prev,
      image: file,
    }));

    setPreviewImage(URL.createObjectURL(file));
  };

  // ==========================================
  // Validation
  // ==========================================

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Product name is required");
      return false;
    }

    if (!formData.category.trim()) {
      toast.error("Category is required");
      return false;
    }

    if (!formData.brand.trim()) {
      toast.error("Brand is required");
      return false;
    }

    if (!formData.price || Number(formData.price) <= 0) {
      toast.error("Enter valid price");
      return false;
    }

    if (!formData.stock || Number(formData.stock) < 0) {
      toast.error("Enter valid stock");
      return false;
    }

    if (!editingProduct && !formData.image) {
      toast.error("Product image is required");
      return false;
    }

    return true;
  };

  // ==========================================
  // Add Product
  // ==========================================

  const handleAddProduct = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        if (key === "features") {
          data.append(
            "features",
            JSON.stringify(
              formData.features
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean)
            )
          );
        } else {
          data.append(key, formData[key]);
        }
      });

      const response = await api.post(
        "/admin/products",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success(response.data.message);

      setShowModal(false);

      setFormData(initialForm);

      setPreviewImage("");

      fetchProducts();

    } catch (err) {
      console.error(err);

      toast.error(
        err.response?.data?.message ||
          "Failed to add product"
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // Update Product
  // ==========================================

  const handleUpdateProduct = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        if (key === "features") {
          data.append(
            "features",
            JSON.stringify(
              formData.features
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean)
            )
          );
        } else {
          if (key === "image") {
            if (formData.image) {
              data.append("image", formData.image);
            }
          } else {
            data.append(key, formData[key]);
          }
        }
      });

      const response = await api.put(
        `/admin/products/${editingProduct._id}`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success(response.data.message);

      setShowModal(false);

      setEditingProduct(null);

      setFormData(initialForm);

      setPreviewImage("");

      fetchProducts();

    } catch (err) {
      console.error(err);

      toast.error(
        err.response?.data?.message ||
          "Failed to update product"
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // Update Status Only (table quick-toggle)
  // ==========================================

  const handleStatusChange = async (productId, newStatus) => {
    // Keep the previous value so we can roll back on failure
    const previousProducts = products;

    // Optimistic update so the dropdown feels instant
    setProducts((prev) =>
      prev.map((p) =>
        p._id === productId ? { ...p, status: newStatus } : p
      )
    );

    setUpdatingStatusId(productId);

    try {
      // Sent as multipart/form-data to match this route's existing
      // expectations (handleUpdateProduct always posts multipart here).
      const data = new FormData();
      data.append("status", newStatus);

      const response = await api.put(
        `/admin/products/${productId}`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success(
        response.data.message || `Marked as ${newStatus}`
      );

    } catch (err) {
      console.error(err);

      // Roll back the optimistic update
      setProducts(previousProducts);

      toast.error(
        err.response?.data?.message ||
          "Failed to update status"
      );
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // ==========================================
  // Delete Product
  // ==========================================

  const handleDeleteProduct = async (id) => {
    const confirmDelete = window.confirm(
      "Delete this product?"
    );

    if (!confirmDelete) return;

    try {
      const response = await api.delete(
        `/admin/products/${id}`
      );

      toast.success(response.data.message);

      fetchProducts();

    } catch (err) {
      console.error(err);

      toast.error(
        err.response?.data?.message ||
          "Delete failed"
      );
    }
  };

  // ==========================================
  // Submit Form
  // ==========================================

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingProduct) {
      handleUpdateProduct();
    } else {
      handleAddProduct();
    }
  }

    // ==========================================
  // Loading Screen
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6">

      {/* ================= Header ================= */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

        <div>

          <h1 className="text-3xl font-bold text-gray-900">
            Products
          </h1>

          <p className="text-gray-500 mt-1">
            Manage all products
          </p>

        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>

      </div>

      {/* ================= Statistics ================= */}

      <div className="grid md:grid-cols-4 gap-5 mb-8">

        <div className="bg-white rounded-xl shadow p-5">

          <Package className="text-blue-600 mb-3 w-8 h-8" />

          <p className="text-gray-500">
            Total Products
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {products.length}
          </h2>

        </div>

        <div className="bg-white rounded-xl shadow p-5">

          <Package className="text-green-600 mb-3 w-8 h-8" />

          <p className="text-gray-500">
            active
          </p>

          <h2 className="text-3xl font-bold mt-2">

            {
              products.filter(
                (item) =>
                  item.status === "active"
              ).length
            }

          </h2>

        </div>

        <div className="bg-white rounded-xl shadow p-5">

          <Package className="text-orange-500 mb-3 w-8 h-8" />

          <p className="text-gray-500">
            inactive
          </p>

          <h2 className="text-3xl font-bold mt-2">

            {
              products.filter(
                (item) =>
                  item.status === "inactive"
              ).length
            }

          </h2>

        </div>

        <div className="bg-white rounded-xl shadow p-5">

          <Package className="text-purple-600 mb-3 w-8 h-8" />

          <p className="text-gray-500">
            Categories
          </p>

          <h2 className="text-3xl font-bold mt-2">

            {categories.length - 1}

          </h2>

        </div>

      </div>

      {/* ================= Search + Filter ================= */}

      <div className="bg-white rounded-xl shadow p-5 mb-6">

        <div className="grid md:grid-cols-2 gap-4">

          <div className="relative">

            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />

            <input
              type="text"
              placeholder="Search Product..."

              value={searchTerm}

              onChange={(e) =>
                setSearchTerm(e.target.value)
              }

              className="w-full border rounded-lg pl-10 pr-4 py-3"
            />

          </div>

          <select
            value={selectedCategory}

            onChange={(e) =>
              setSelectedCategory(e.target.value)
            }

            className="border rounded-lg px-4 py-3"
          >

            {categories.map((cat) => (

              <option
                key={cat}
                value={cat}
              >
                {cat}
              </option>

            ))}

          </select>

        </div>

      </div>

      {/* ================= Table ================= */}

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="p-4 text-left">
                Product
              </th>

              <th className="p-4 text-left">
                Category
              </th>

              <th className="p-4 text-left">
                Price
              </th>

              <th className="p-4 text-left">
                Stock
              </th>

              <th className="p-4 text-left">
                Status
              </th>

              <th className="p-4 text-center">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {currentProducts.length === 0 && (

              <tr>

                <td
                  colSpan={6}
                  className="text-center py-12 text-gray-500"
                >

                  No Products Found

                </td>

              </tr>

            )}

            {currentProducts.map((product) => (

              <tr
                key={product._id}
                className="border-b hover:bg-gray-50"
              >

                <td className="p-4">

                  <div className="flex items-center gap-4">

                    <img
                      src={
                        product.image?.url ||
                        "/placeholder.png"
                      }
                      alt={product.name}
                      className="w-16 h-16 rounded-lg object-cover border"
                    />

                    <div>

                      <h3 className="font-semibold">

                        {product.name}

                      </h3>

                      <p className="text-sm text-gray-500">

                        {product.brand}

                      </p>

                    </div>

                  </div>

                </td>

                <td className="p-4">

                  {product.category}

                </td>

                <td className="p-4">

                  ₹{Number(product.price).toLocaleString()}

                </td>

                <td className="p-4">

                  {product.stock}

                </td>

                <td className="p-4">

                  <div className="relative inline-block">
                    <select
                      value={product.status || "active"}
                      disabled={updatingStatusId === product._id}
                      onChange={(e) =>
                        handleStatusChange(product._id, e.target.value)
                      }
                      className={`appearance-none pl-3 pr-7 py-1 rounded-full text-sm font-medium border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-wait ${
                        product.status === "inactive"
                          ? "bg-red-100 text-red-700 focus:ring-red-400"
                          : "bg-green-100 text-green-700 focus:ring-green-400"
                      }`}
                    >
                      <option value="active">active</option>
                      <option value="inactive">inactive</option>
                    </select>
                    {updatingStatusId === product._id && (
                      <Loader2 className="w-3.5 h-3.5 animate-spin absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    )}
                  </div>

                </td>

                <td className="p-4">

                  <div className="flex justify-center gap-3">

                    <button
                      onClick={() =>
                        openEditModal(product)
                      }
                    >
                      <Edit className="w-5 h-5 text-blue-600" />
                    </button>

                    <button
                      onClick={() =>
                        handleDeleteProduct(
                          product._id
                        )
                      }
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {/* ================= Pagination ================= */}

      {totalPages > 1 && (

        <div className="flex justify-end gap-2 mt-6">

          <button
            disabled={currentPage === 1}
            onClick={() =>
              setCurrentPage((prev) => prev - 1)
            }
            className="border px-4 py-2 rounded disabled:opacity-50"
          >
            Previous
          </button>

          {Array.from(
            { length: totalPages },
            (_, index) => (

              <button
                key={index}
                onClick={() =>
                  setCurrentPage(index + 1)
                }
                className={`px-4 py-2 rounded ${
                  currentPage === index + 1
                    ? "bg-blue-600 text-white"
                    : "border"
                }`}
              >
                {index + 1}
              </button>

            )
          )}

          <button
            disabled={currentPage === totalPages}
            onClick={() =>
              setCurrentPage((prev) => prev + 1)
            }
            className="border px-4 py-2 rounded disabled:opacity-50"
          >
            Next
          </button>

        </div>

      )}
            {/* ===============================
          Add / Edit Product Modal
      =============================== */}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-5">

          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">

            {/* Header */}

            <div className="flex justify-between items-center border-b p-6">

              <h2 className="text-2xl font-bold">

                {editingProduct
                  ? "Edit Product"
                  : "Add Product"}

              </h2>

              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingProduct(null);
                  setFormData(initialForm);
                  setPreviewImage("");
                }}
              >
                <X className="w-6 h-6" />
              </button>

            </div>

            {/* Form */}

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-6"
            >

              {/* Product Name */}

              <div>

                <label className="block mb-2 font-medium">
                  Product Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-3"
                  required
                />

              </div>

              {/* Category & Brand */}

              <div className="grid md:grid-cols-2 gap-5">

                <div>

                  <label className="block mb-2 font-medium">
                    Category
                  </label>

                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full border rounded-lg p-3"
                    required
                  />

                </div>

                <div>

                  <label className="block mb-2 font-medium">
                    Brand
                  </label>

                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="w-full border rounded-lg p-3"
                    required
                  />

                </div>

              </div>

              {/* Description */}

              <div>

                <label className="block mb-2 font-medium">
                  Description
                </label>

                <textarea
                  rows="4"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-3"
                />

              </div>

              {/* Price */}

              <div className="grid md:grid-cols-3 gap-5">

                <div>

                  <label className="block mb-2 font-medium">
                    Price
                  </label>

                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full border rounded-lg p-3"
                  />

                </div>

                <div>

                  <label className="block mb-2 font-medium">
                    Original Price
                  </label>

                  <input
                    type="number"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleChange}
                    className="w-full border rounded-lg p-3"
                  />

                </div>

                <div>

                  <label className="block mb-2 font-medium">
                    Discount %
                  </label>

                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleChange}
                    className="w-full border rounded-lg p-3"
                  />

                </div>

              </div>

              {/* Stock */}

              <div className="grid md:grid-cols-3 gap-5">

                <div>

                  <label className="block mb-2 font-medium">
                    Stock
                  </label>

                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    className="w-full border rounded-lg p-3"
                  />

                </div>

                <div>

                  <label className="block mb-2 font-medium">
                    Rating
                  </label>

                  <input
                    type="number"
                    step="0.1"
                    name="rating"
                    value={formData.rating}
                    onChange={handleChange}
                    className="w-full border rounded-lg p-3"
                  />

                </div>

                <div>

                  <label className="block mb-2 font-medium">
                    Reviews
                  </label>

                  <input
                    type="number"
                    name="reviews"
                    value={formData.reviews}
                    onChange={handleChange}
                    className="w-full border rounded-lg p-3"
                  />

                </div>

              </div>

              {/* Warranty */}

              <div>

                <label className="block mb-2 font-medium">
                  Warranty
                </label>

                <input
                  type="text"
                  name="warranty"
                  value={formData.warranty}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-3"
                />

              </div>

              {/* Features */}

              <div>

                <label className="block mb-2 font-medium">
                  Features
                </label>

                <textarea
                  rows="3"
                  name="features"
                  value={formData.features}
                  onChange={handleChange}
                  placeholder="Comma separated features"
                  className="w-full border rounded-lg p-3"
                />

              </div>

              {/* Status */}

              <div>

                <label className="block mb-2 font-medium">
                  Status
                </label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-3"
                >

                  <option value="active">
                    active
                  </option>

                  <option value="inactive">
                    inactive
                  </option>

                </select>

              </div>

              {/* Image */}

              <div>

                <label className="block mb-3 font-medium">
                  Product Image
                </label>

                <label className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center cursor-pointer">

                  {previewImage ? (

                    <img
                      src={previewImage}
                      className="w-48 h-48 object-cover rounded-lg"
                    />

                  ) : (

                    <>
                      <ImageIcon className="w-12 h-12 text-gray-400" />

                      <p className="mt-3 text-gray-500">

                        Click to Upload Image

                      </p>

                    </>

                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    hidden
                  />

                </label>

              </div>

              {/* Buttons */}

              <div className="flex justify-end gap-4 pt-5 border-t">

                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProduct(null);
                    setFormData(initialForm);
                    setPreviewImage("");
                  }}
                  className="px-6 py-3 border rounded-lg"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg flex items-center gap-2"
                >

                  {saving && (
                    <Loader2 className="animate-spin w-5 h-5" />
                  )}

                  {editingProduct
                    ? "Update Product"
                    : "Add Product"}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}
            {/* ===============================
          Empty State (Optional)
      =============================== */}

      {!loading && products.length === 0 && (
        <div className="bg-white rounded-xl shadow p-16 text-center mt-6">

          <Package className="w-20 h-20 mx-auto text-gray-300" />

          <h2 className="text-2xl font-bold mt-5">
            No Products Found
          </h2>

          <p className="text-gray-500 mt-2">
            Click the button below to add your first product.
          </p>

          <button
            onClick={openAddModal}
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            Add Product
          </button>

        </div>
      )}

    </div>
  );
};

export default ProductsPage;