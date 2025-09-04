import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaEye, FaTimes } from "react-icons/fa";
import axios, { authApis, endpoints } from "../../configs/APIs";

export default function Category() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: ''
    });
    const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize] = useState(5);

    // Fetch categories from API
    const fetchCategories = async (page = 1) => {
        setLoading(true);
        try {
            const res = await axios.get(endpoints["car-category"]);
            setCategories(res.data.result);
            console.log(res.data.result);
            
            // If your API supports pagination, update these
            // setTotalPages(res.data.result.totalPages);
            // setCurrentPage(res.data.result.currentPage);
            setLoading(false);
        } catch (error) {
            showAlert('Lỗi khi tải danh sách danh mục xe!', 'danger');
            console.error('Error fetching categories:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const showAlert = (message, variant = 'success') => {
        setAlert({ show: true, message, variant });
        setTimeout(() => setAlert({ show: false, message: '', variant: 'success' }), 5000);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const openCreateModal = () => {
        setModalMode('create');
        setFormData({ name: '' });
        setShowModal(true);
    };

    const openEditModal = (category) => {
        setModalMode('edit');
        setSelectedCategory(category);
        setFormData({
            name: category.name || ''
        });
        setShowModal(true);
    };

    const openViewModal = (category) => {
        setSelectedCategory(category);
        setShowViewModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setShowViewModal(false);
        setSelectedCategory(null);
        setFormData({ name: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name.trim()) {
            showAlert('Vui lòng nhập tên danh mục!', 'danger');
            return;
        }

        setLoading(true);
        
        try {
            if (modalMode === 'create') {
                const res = await authApis().post(endpoints["create-category"], {
                    name: formData.name
                });

                if (res.status === 200 || res.status === 201) {
                    setCategories(prev => [...prev, res.data.result]);
                    showAlert('Tạo danh mục thành công!', 'success');
                    closeModal();
                }
            } else if (modalMode === 'edit') {
                const res = await authApis().put(endpoints["update-category"](selectedCategory.id), {
                    name: formData.name
                });

                if (res.status === 200) {
                    setCategories(prev => 
                        prev.map(cat => 
                            cat.id === selectedCategory.id 
                                ? { ...cat, name: formData.name }
                                : cat
                        )
                    );
                    showAlert('Cập nhật danh mục thành công!', 'success');
                    closeModal();
                }
            }
        } catch (error) {
            showAlert('Có lỗi xảy ra!', 'danger');
            console.error('Error submitting form:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (categoryId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
            return;
        }

        setLoading(true);
        try {
            const res = await authApis().delete(endpoints["delete-category"](categoryId));

            if (res.status === 200) {
                setCategories(prev => prev.filter(cat => cat.id !== categoryId));
                showAlert("Đã xóa danh mục thành công!", "success");
            }
        } catch (error) {
            showAlert('Lỗi khi xóa danh mục!', 'danger');
            console.error('Error deleting category:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        fetchCategories(page);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            {/* Alert */}
            {alert.show && (
                <div className={`mb-4 p-4 rounded-lg ${
                    alert.variant === 'success' ? 'bg-green-100 text-green-800 border border-green-300' :
                    alert.variant === 'danger' ? 'bg-red-100 text-red-800 border border-red-300' :
                    'bg-blue-100 text-blue-800 border border-blue-300'
                }`}>
                    {alert.message}
                </div>
            )}

            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Quản lý Danh mục Xe</h2>
                <button 
                    onClick={openCreateModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <FaPlus />
                    Thêm Danh mục
                </button>
            </div>

            {/* Categories Table */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-gray-50 px-6 py-3 border-b">
                    <h5 className="font-semibold text-gray-800">Danh sách Danh mục</h5>
                </div>
                <div className="p-6">
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Đang tải...</p>
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">Không có danh mục nào</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full table-auto">
                                    <thead>
                                        <tr className="border-b bg-gray-50">
                                            <th className="px-4 py-3 text-left font-semibold text-gray-700">#</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Tên Danh mục</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {categories.map((category, index) => (
                                            <tr key={category.id} className="border-b hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3">{(currentPage - 1) * pageSize + index + 1}</td>
                                                <td className="px-4 py-3 font-medium">{category.name}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => openViewModal(category)}
                                                            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded transition-colors"
                                                            title="Xem chi tiết"
                                                        >
                                                            <FaEye />
                                                        </button>
                                                        <button
                                                            onClick={() => openEditModal(category)}
                                                            className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded transition-colors"
                                                            title="Chỉnh sửa"
                                                        >
                                                            <FaEdit />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(category.id)}
                                                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded transition-colors"
                                                            title="Xóa"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination - nếu cần */}
                            {totalPages > 1 && (
                                <div className="flex justify-center mt-6">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handlePageChange(1)}
                                            disabled={currentPage === 1}
                                            className={`px-3 py-2 rounded ${
                                                currentPage === 1 
                                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                                                    : 'bg-white border text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            Đầu
                                        </button>
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className={`px-3 py-2 rounded ${
                                                currentPage === 1 
                                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                                                    : 'bg-white border text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            Trước
                                        </button>
                                        
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                            <button
                                                key={page}
                                                onClick={() => handlePageChange(page)}
                                                className={`px-3 py-2 rounded ${
                                                    page === currentPage
                                                        ? 'bg-blue-600 text-white' 
                                                        : 'bg-white border text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                        
                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className={`px-3 py-2 rounded ${
                                                currentPage === totalPages 
                                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                                                    : 'bg-white border text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            Sau
                                        </button>
                                        <button
                                            onClick={() => handlePageChange(totalPages)}
                                            disabled={currentPage === totalPages}
                                            className={`px-3 py-2 rounded ${
                                                currentPage === totalPages 
                                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                                                    : 'bg-white border text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            Cuối
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg w-full max-w-md max-h-90vh overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h3 className="text-xl font-semibold">
                                {modalMode === 'create' ? 'Thêm Danh mục Mới' : 'Chỉnh sửa Danh mục'}
                            </h3>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>
                        
                        <div className="p-6">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tên Danh mục *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Nhập tên danh mục"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </form>
                        </div>
                        
                        <div className="flex justify-end gap-3 p-6 border-t">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                            >
                                Hủy
                            </button>
                            <button 
                                onClick={handleSubmit}
                                disabled={loading}
                                className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 ${
                                    loading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Đang xử lý...
                                    </>
                                ) : (
                                    modalMode === 'create' ? 'Thêm' : 'Cập nhật'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {showViewModal && selectedCategory && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg w-full max-w-md max-h-90vh overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h3 className="text-xl font-semibold">Thông tin Danh mục</h3>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>
                        
                        <div className="p-6">
                            <div className="mb-4">
                                <h4 className="font-semibold text-gray-700 mb-2">ID:</h4>
                                <p className="text-gray-600">{selectedCategory.id}</p>
                            </div>
                            <div className="mb-4">
                                <h4 className="font-semibold text-gray-700 mb-2">Tên Danh mục:</h4>
                                <p className="text-gray-600">{selectedCategory.name}</p>
                            </div>
                            {selectedCategory.createdDate && (
                                <div className="mb-4">
                                    <h4 className="font-semibold text-gray-700 mb-2">Ngày tạo:</h4>
                                    <p className="text-gray-600">
                                        {new Date(selectedCategory.createdDate).toLocaleDateString('vi-VN')}
                                    </p>
                                </div>
                            )}
                        </div>
                        
                        <div className="flex justify-end p-6 border-t">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}