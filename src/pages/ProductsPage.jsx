import React, { useState, useEffect } from 'react';
import { Star, Search, ShoppingCart, Loader2, AlertCircle, Filter, TrendingUp, Zap, Battery, Droplets, X, Check } from 'lucide-react';
import Footer from '../components/Footer';
import NavBar from '../components/NavBar';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { productsService, getErrorMessage } from '../api/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProductsPage = () => {
    const { addToCart, getCartItemQuantity } = useCart();
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('featured');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [addingToCart, setAddingToCart] = useState({});
    const [quickViewProduct, setQuickViewProduct] = useState(null);

    const colors = {
        primary: '#00A9FF',
        secondary: '#89CFF3',
        accent: '#A0E9FF',
        background: '#CDF5FD',
        text: '#0B0C10',
        error: '#EF4444',
        success: '#10B981',
        gradient: 'linear-gradient(135deg, #00A9FF 0%, #0088CC 100%)',
        gradientHover: 'linear-gradient(135deg, #0088CC 0%, #006699 100%)'
    };

    const categoryIcons = {
        'ro': <Zap className="w-5 h-5" />,
        'uv': <Droplets className="w-5 h-5" />,
        'uf': <Battery className="w-5 h-5" />,
        'gravity': <Droplets className="w-5 h-5" />,
        'all': <Filter className="w-5 h-5" />
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await productsService.list();
            setProducts(data.products || []);
            setError(null);
        } catch (err) {
            console.error('Error loading products:', err);
            setError(getErrorMessage(err, 'Failed to load products. Please try again.'));
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // Lock background scroll while the quick view modal is open
    useEffect(() => {
        document.body.style.overflow = quickViewProduct ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [quickViewProduct]);

    const handleAddToCart = async (product) => {
        if (!product || !product._id) {
            toast.error('Invalid product data');
            return;
        }

        if (product.stock === 0) {
            toast.warning('This product is out of stock');
            return;
        }

        setAddingToCart(prev => ({ ...prev, [product._id]: true }));

        try {
            const result = await addToCart(product);

            if (result && result.success) {
                const cartQuantity = getCartItemQuantity(product._id);

                if (cartQuantity > 1) {
                    toast.success(`Updated quantity: ${cartQuantity} in cart`, {
                        icon: '🔄',
                        autoClose: 2000,
                    });
                } else {
                    toast.success(`${product.name} added to cart!`, {
                        icon: '✅',
                        autoClose: 3000,
                    });
                }

                triggerCartAnimation(product._id);
            } else {
                const errorMessage = result?.error || 'Failed to add to cart';
                console.error('Add to cart failed:', errorMessage);

                if (errorMessage.includes('network') || errorMessage.includes('Network')) {
                    toast.error('Network error. Please check your connection.', { icon: '📶' });
                } else if (errorMessage.includes('401') || errorMessage.includes('auth')) {
                    toast.error('Please login to save your cart.', { icon: '🔒' });
                } else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('reach the server')) {
                    toast.error('Could not reach the server. Please try again in a moment.', { icon: '🔄' });
                } else {
                    toast.error(errorMessage, { icon: '⚠️' });
                }
            }

        } catch (error) {
            console.error('Error in handleAddToCart:', error);

            if (error.message?.includes('Network Error')) {
                toast.error('Network error. Please check your connection.', { icon: '📶' });
            } else if (error.message?.includes('401')) {
                toast.error('Please login to save your cart.', { icon: '🔒' });
            } else {
                toast.error('Failed to add to cart. Please try again.', { icon: '⚠️' });
            }
        } finally {
            setAddingToCart(prev => ({ ...prev, [product._id]: false }));
        }
    };

    const triggerCartAnimation = (productId) => {
        const button = document.getElementById(`cart-btn-${productId}`);
        if (button) {
            button.classList.add('animate-pulse');
            setTimeout(() => {
                button.classList.remove('animate-pulse');
            }, 500);
        }
    };

    const categories = [
        { value: 'all', label: 'All Products', icon: categoryIcons.all },
        { value: 'ro', label: 'RO Purifiers', icon: categoryIcons.ro },
        { value: 'uv', label: 'UV Purifiers', icon: categoryIcons.uv },
        { value: 'uf', label: 'UF Purifiers', icon: categoryIcons.uf },
        { value: 'gravity', label: 'Gravity Filters', icon: categoryIcons.gravity }
    ];

    const sortOptions = [
        { value: 'featured', label: 'Featured', icon: <TrendingUp className="w-4 h-4" /> },
        { value: 'price-low', label: 'Price: Low to High' },
        { value: 'price-high', label: 'Price: High to Low' },
        { value: 'rating', label: 'Highest Rated' },
        { value: 'name', label: 'Name: A to Z' }
    ];

    const filteredProducts = products
        .filter(product => {
            const categoryMatch = selectedCategory === 'all' || product.category === selectedCategory;

            if (!searchTerm.trim()) {
                return categoryMatch;
            }

            const searchMatch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));

            return searchMatch && categoryMatch;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'price-low':
                    return a.price - b.price;
                case 'price-high':
                    return b.price - a.price;
                case 'rating':
                    return (b.rating || 0) - (a.rating || 0);
                case 'name':
                    return a.name.localeCompare(b.name);
                default:
                    return (b.rating || 0) - (a.rating || 0);
            }
        });

    // Renders stars for any rating, including 0/undefined, and supports half stars
    const renderStars = (rating = 0, size = 18) => {
        const safeRating = Number(rating) || 0;
        return Array.from({ length: 5 }, (_, index) => {
            const filled = index < Math.floor(safeRating);
            const half = !filled && index < safeRating;
            return (
                <Star
                    key={index}
                    size={size}
                    className={filled ? 'text-yellow-400 fill-current' : half ? 'text-yellow-400 fill-current opacity-50' : 'text-gray-300'}
                />
            );
        });
    };

    const ProductCardGrid = ({ product }) => {
        const cartQuantity = getCartItemQuantity(product._id);
        const isAdding = addingToCart[product._id];
        const isInCart = cartQuantity > 0;
        const imageUrl = product.image?.url;
        const rating = Number(product.rating) || 0;
        const reviews = Number(product.reviews) || 0;

        return (
            <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-[#00A9FF]/40 hover:-translate-y-1 flex flex-col h-full">
                {/* Product Image — click for quick view */}
                <button
                    type="button"
                    onClick={() => setQuickViewProduct(product)}
                    className="relative overflow-hidden bg-gradient-to-br from-[#CDF5FD] to-white p-4 w-full text-left cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#00A9FF]"
                    aria-label={`View details for ${product.name}`}
                >
                    <div className="relative h-40 sm:h-44 w-full">
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt={product.name}
                                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <Droplets size={48} />
                            </div>
                        )}
                    </div>

                    {/* Discount Badge */}
                    {product.originalPrice > product.price && (
                        <div className="absolute top-2 left-2">
                            <span className="text-xs font-semibold px-2 py-1 bg-[#00A9FF] text-white rounded-full shadow-sm">
                                Save ₹{(product.originalPrice - product.price).toLocaleString()}
                            </span>
                        </div>
                    )}

                    {/* Hover hint */}
                    <span className="absolute inset-x-0 bottom-2 text-center text-[11px] font-medium text-[#0077B6] opacity-0 group-hover:opacity-100 transition-opacity">
                        Click to view details
                    </span>
                </button>

                {/* Product Info */}
                <div className="p-4 flex flex-col grow">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-[#0077B6] uppercase tracking-wide">
                            {product.category || 'Water Purifier'}
                        </span>
                        <div className="flex items-center gap-1">
                            {renderStars(rating, 14)}
                            <span className="text-xs text-gray-500">({reviews})</span>
                        </div>
                    </div>

                    <h3 className="text-sm font-semibold text-[#0B0C10] line-clamp-2 mb-2">
                        {product.name}
                    </h3>

                    {product.description && (
                        <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                            {product.description}
                        </p>
                    )}

                    {product.features?.length > 0 && (
                        <div className="mb-3">
                            <div className="flex flex-wrap gap-1">
                                {product.features.slice(0, 2).map((feature, index) => (
                                    <span
                                        key={index}
                                        className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
                                    >
                                        {feature}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-auto">
                        <div className="flex items-baseline justify-between mb-2">
                            <div>
                                <span className="text-base font-bold text-[#00A9FF]">
                                    ₹{product.price.toLocaleString()}
                                </span>
                                {product.originalPrice > product.price && (
                                    <span className="text-xs text-gray-400 line-through ml-2">
                                        ₹{product.originalPrice.toLocaleString()}
                                    </span>
                                )}
                            </div>

                            {isInCart && (
                                <span className="text-xs font-medium px-2 py-1 bg-[#10B981] text-white rounded-full">
                                    {cartQuantity} in cart
                                </span>
                            )}
                        </div>

                        <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2 min-w-0">
                                <div className={`w-2 h-2 rounded-full shrink-0 ${
                                    product.stock > 10 ? 'bg-[#10B981]' :
                                    product.stock > 0 ? 'bg-yellow-500' : 'bg-[#EF4444]'
                                }`} />
                                <span className="text-xs text-gray-500 truncate">
                                    {product.stock > 10 ? 'In stock' :
                                    product.stock > 0 ? `${product.stock} left` : 'Out of stock'}
                                </span>
                            </div>
                        </div>

                        <div className="flex">
                            <button
                                id={`cart-btn-${product._id}`}
                                onClick={() => handleAddToCart(product)}
                                disabled={product.stock === 0 || isAdding}
                                className="w-full px-3 py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 justify-center"
                                style={product.stock === 0 || isAdding ? {
                                    backgroundColor: '#9CA3AF',
                                    color: 'white'
                                } : isInCart ? {
                                    backgroundColor: '#10B981',
                                    color: 'white'
                                } : {
                                    backgroundColor: '#00A9FF',
                                    color: 'white'
                                }}
                            >
                                {isAdding ? (
                                    <>
                                        <Loader2 className="animate-spin h-3 w-3" />
                                        <span>Adding</span>
                                    </>
                                ) : isInCart ? (
                                    <>
                                        <ShoppingCart size={12} />
                                        <span>Add More</span>
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart size={12} />
                                        <span>Add to Cart</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Quick view modal shown when a product image is clicked
    const QuickViewModal = ({ product, onClose }) => {
        const cartQuantity = getCartItemQuantity(product._id);
        const isAdding = addingToCart[product._id];
        const isInCart = cartQuantity > 0;
        const imageUrl = product.image?.url;
        const rating = Number(product.rating) || 0;
        const reviews = Number(product.reviews) || 0;

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                ></div>

                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 z-10 p-2 bg-white/90 hover:bg-white rounded-full shadow-sm transition-colors"
                        aria-label="Close"
                    >
                        <X size={18} className="text-gray-600" />
                    </button>

                    <div className="grid md:grid-cols-2 gap-0">
                        {/* Image */}
                        <div className="bg-gradient-to-br from-[#CDF5FD] to-white p-8 flex items-center justify-center">
                            {imageUrl ? (
                                <img
                                    src={imageUrl}
                                    alt={product.name}
                                    className="max-h-72 w-full object-contain"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            ) : (
                                <Droplets size={64} className="text-gray-300" />
                            )}
                        </div>

                        {/* Details */}
                        <div className="p-6 flex flex-col">
                            <span className="text-xs font-medium text-[#0077B6] uppercase tracking-wide mb-1">
                                {product.category || 'Water Purifier'}
                            </span>
                            <h2 className="text-xl font-bold text-[#0B0C10] mb-2">{product.name}</h2>

                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex items-center gap-0.5">{renderStars(rating, 16)}</div>
                                <span className="text-sm text-gray-500">
                                    {rating.toFixed(1)} · {reviews} {reviews === 1 ? 'review' : 'reviews'}
                                </span>
                            </div>

                            {product.description && (
                                <p className="text-sm text-gray-600 mb-4">{product.description}</p>
                            )}

                            {product.features?.length > 0 && (
                                <div className="mb-4">
                                    <h4 className="text-xs font-semibold text-gray-700 uppercase mb-2">Key Features</h4>
                                    <ul className="space-y-1.5">
                                        {product.features.map((feature, index) => (
                                            <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                                                <Check size={16} className="text-[#10B981] shrink-0 mt-0.5" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="mt-auto pt-4 border-t">
                                <div className="flex items-baseline gap-2 mb-1">
                                    <span className="text-2xl font-bold text-[#00A9FF]">
                                        ₹{product.price.toLocaleString()}
                                    </span>
                                    {product.originalPrice > product.price && (
                                        <span className="text-sm text-gray-400 line-through">
                                            ₹{product.originalPrice.toLocaleString()}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 mb-4">
                                    <div className={`w-2 h-2 rounded-full ${
                                        product.stock > 10 ? 'bg-[#10B981]' :
                                        product.stock > 0 ? 'bg-yellow-500' : 'bg-[#EF4444]'
                                    }`} />
                                    <span className="text-xs text-gray-500">
                                        {product.stock > 10 ? 'In stock' :
                                        product.stock > 0 ? `${product.stock} left` : 'Out of stock'}
                                    </span>
                                    {isInCart && (
                                        <span className="text-xs font-medium px-2 py-1 bg-[#10B981] text-white rounded-full ml-auto">
                                            {cartQuantity} in cart
                                        </span>
                                    )}
                                </div>

                                <button
                                    onClick={() => handleAddToCart(product)}
                                    disabled={product.stock === 0 || isAdding}
                                    className="w-full py-3 rounded-lg font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    style={{ backgroundColor: product.stock === 0 || isAdding ? '#9CA3AF' : isInCart ? '#10B981' : '#00A9FF' }}
                                >
                                    {isAdding ? (
                                        <>
                                            <Loader2 className="animate-spin h-4 w-4" />
                                            Adding...
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart size={16} />
                                            {isInCart ? 'Add More to Cart' : 'Add to Cart'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <>
                <NavBar />
                <ToastContainer />
                <div className="min-h-screen flex items-center justify-center pt-20" style={{ backgroundColor: colors.background }}>
                    <div className="text-center">
                        <div className="relative">
                            <div className="w-12 h-12 border-2 border-t-blue-500 border-r-transparent border-b-blue-300 border-l-transparent rounded-full animate-spin mx-auto"></div>
                        </div>
                        <p className="mt-4 text-[#0B0C10] text-sm">Loading products...</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (error && products.length === 0) {
        return (
            <>
                <NavBar />
                <ToastContainer />
                <div className="min-h-screen flex items-center justify-center pt-20" style={{ backgroundColor: colors.background }}>
                    <div className="text-center max-w-md p-6">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="h-6 w-6 text-red-500" />
                        </div>
                        <p className="text-[#EF4444] mb-4 text-sm">{error}</p>
                        <button
                            onClick={fetchProducts}
                            className="px-4 py-2 bg-[#00A9FF] text-white text-sm rounded-md hover:bg-[#0077B6] transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <NavBar />
            <ToastContainer
                position="bottom-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                toastClassName="rounded-md font-normal text-sm"
            />

            {quickViewProduct && (
                <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
            )}

            <div className="min-h-screen pt-16 bg-[#CDF5FD]">

                {/* Controls */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 mb-6">
                        <div className="flex flex-col md:flex-row gap-3">
                            {/* Search */}
                            <div className="relative flex-1">
                                <Search
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                    size={18}
                                />
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A9FF]/40 focus:border-[#00A9FF] transition-colors bg-gray-50 focus:bg-white"
                                />
                            </div>

                            {/* Category Filter */}
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full md:w-48 px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A9FF]/40 focus:border-[#00A9FF] transition-colors bg-gray-50 focus:bg-white cursor-pointer"
                            >
                                {categories.map(category => (
                                    <option key={category.value} value={category.value}>
                                        {category.label}
                                    </option>
                                ))}
                            </select>

                            {/* Sort */}
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full md:w-48 px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A9FF]/40 focus:border-[#00A9FF] transition-colors bg-gray-50 focus:bg-white cursor-pointer"
                            >
                                {sortOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Results Info */}
                    {(searchTerm || selectedCategory !== 'all') && (
                        <div className="mb-4">
                            <p className="text-sm text-gray-600">
                                {filteredProducts.length} products found
                                {searchTerm && ` for "${searchTerm}"`}
                                {selectedCategory !== 'all' && ` in ${categories.find(c => c.value === selectedCategory)?.label}`}
                            </p>
                        </div>
                    )}

                    {/* Products Grid */}
                    {filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
                            {filteredProducts.map(product =>
                                <ProductCardGrid key={product._id} product={product} />
                            )}
                        </div>
                    ) : (
                        /* Empty State */
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search size={24} className="text-gray-400" />
                            </div>
                            <h3 className="text-base font-medium text-gray-700 mb-2">No products found</h3>
                            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                                Try adjusting your search or filter to find what you're looking for.
                            </p>
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedCategory('all');
                                }}
                                className="px-4 py-2 text-sm bg-[#00A9FF] text-white rounded-md hover:bg-[#0077B6] transition-colors"
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default ProductsPage;