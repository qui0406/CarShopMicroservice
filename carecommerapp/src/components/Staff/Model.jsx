import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaEye, FaTimes } from "react-icons/fa";
import axios, { authApis, endpoints } from "./../../configs/APIs";

export default function Model() {
    const [carModels, setCarModels] = useState([]);
    const [categories, setCategories] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedCarModel, setSelectedCarModel] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        categoryId: '',
        carBranchId: ''
    });
    const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize] = useState(5);

    // Fetch car models from API
    const fetchCarModels = async (page = 1) => {
        setLoading(true);
        try {
            const res = await axios.get(endpoints["get-all-model"]);
            setCarModels(res.data.result);
            console.log(res.data.result);
            
            setLoading(false);
        } catch (error) {
            showAlert('Lỗi khi tải danh sách mẫu xe!', 'danger');
            console.error('Error fetching car models:', error);
            setLoading(false);
        }
    };

    // Fetch categories for dropdown
    const fetchCategories = async () => {
        try {
            const res = await axios.get(endpoints["car-category"]);
            setCategories(res.data.result);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    // Fetch branches for dropdown
    const fetchBranches = async () => {
        try {
            const res = await axios.get(endpoints["car-branch"]);
            setBranches(res.data.result.data || res.data.result);
        } catch (error) {
            console.error('Error fetching branches:', error);
        }
    };

    useEffect(() => {
        fetchCarModels();
        fetchCategories();
        fetchBranches();
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
        setFormData({ name: '', categoryId: '', carBranchId: '' });
        setShowModal(true);
    };

    const openEditModal = (carModel) => {
        setModalMode('edit');
        setSelectedCarModel(carModel);
        setFormData({
            name: carModel.name || '',
            categoryId: carModel.categoryId || carModel.category?.id || '',
            carBranchId: carModel.carBranchId || carModel.carBranch?.id || ''
        });
        setShowModal(true);
    };

    const openViewModal = (carModel) => {
        setSelectedCarModel(carModel);
        setShowViewModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setShowViewModal(false);
        setSelectedCarModel(null);
        setFormData({ name: '', categoryId: '', carBranchId: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name.trim() || !formData.categoryId || !formData.carBranchId) {
            showAlert('Vui lòng điền đầy đủ thông tin!', 'danger');
            return;
        }

        setLoading(true);
        
        try {
            if (modalMode === 'create') {
                const res = await authApis().post(endpoints["create-car-model"], {
                    name: formData.name,
                    categoryId: parseInt(formData.categoryId),
                    carBranchId: parseInt(formData.carBranchId)
                });

                if (res.status === 200 || res.status === 201) {
                    setCarModels(prev => [...prev, res.data.result]);
                    showAlert('Tạo mẫu xe thành công!', 'success');
                    closeModal();
                }
            } else if (modalMode === 'edit') {
                const res = await authApis().put(endpoints["update-car-model"](selectedCarModel.id), {
                    name: formData.name,
                    categoryId: parseInt(formData.categoryId),
                    carBranchId: parseInt(formData.carBranchId)
                });

                if (res.status === 200) {
                    setCarModels(prev => 
                        prev.map(model => 
                            model.id === selectedCarModel.id 
                                ? { ...model, name: formData.name, categoryId: formData.categoryId, carBranchId: formData.carBranchId }
                                : model
                        )
                    );
                    showAlert('Cập nhật mẫu xe thành công!', 'success');
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

    const handleDelete = async (carModelId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa mẫu xe này?')) {
            return;
        }

        setLoading(true);
        try {
            const res = await authApis().delete(endpoints["delete-car-model"](carModelId));

            if (res.status === 200) {
                setCarModels(prev => prev.filter(model => model.id !== carModelId));
                showAlert("Đã xóa mẫu xe thành công!", "success");
            }
        } catch (error) {
            showAlert('Lỗi khi xóa mẫu xe!', 'danger');
            console.error('Error deleting car model:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        fetchCarModels(page);
    };

    const getCategoryName = (categoryId) => {
        const category = categories.find(cat => cat.id === categoryId);
        console.log(category)
        return category ? category.name : 'N/A';
    };

    const getBranchName = (branchId) => {
        const branch = branches.find(br => br.id === branchId);
        return branch ? branch.name : 'N/A';
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4" style={{paddingTop: "70px"}}>
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
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Quản lý Mẫu Xe</h2>
                <button 
                    onClick={openCreateModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <FaPlus />
                    Thêm Mẫu Xe
                </button>
            </div>

            {/* Car Models Table */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-gray-50 px-6 py-3 border-b">
                    <h5 className="font-semibold text-gray-800">Danh sách Mẫu Xe</h5>
                </div>
                <div className="p-6">
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Đang tải...</p>
                        </div>
                    ) : carModels.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">Không có mẫu xe nào</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full table-auto">
                                    <thead>
                                        <tr className="border-b bg-gray-50">
                                            <th className="px-4 py-3 text-left font-semibold text-gray-700">#</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Tên Mẫu Xe</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Danh mục</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Hãng xe</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {carModels.map((carModel, index) => (
                                            <tr key={carModel.id} className="border-b hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3">{(currentPage - 1) * pageSize + index + 1}</td>
                                                <td className="px-4 py-3 font-medium">{carModel.name}</td>
                                                <td className="px-4 py-3">
                                                    {carModel.category }
                                                </td>
                                                <td className="px-4 py-3">
                                                    {carModel.brand }
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => openViewModal(carModel)}
                                                            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded transition-colors"
                                                            title="Xem chi tiết"
                                                        >
                                                            <FaEye />
                                                        </button>
                                                        <button
                                                            onClick={() => openEditModal(carModel)}
                                                            className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded transition-colors"
                                                            title="Chỉnh sửa"
                                                        >
                                                            <FaEdit />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(carModel.id)}
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
                                {modalMode === 'create' ? 'Thêm Mẫu Xe Mới' : 'Chỉnh sửa Mẫu Xe'}
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
                                        Tên Mẫu Xe *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Nhập tên mẫu xe"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Danh mục *
                                    </label>
                                    <select
                                        name="categoryId"
                                        value={formData.categoryId}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Chọn danh mục</option>
                                        {categories.map(category => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Hãng xe *
                                    </label>
                                    <select
                                        name="carBranchId"
                                        value={formData.carBranchId}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Chọn hãng xe</option>
                                        {branches.map(branch => (
                                            <option key={branch.id} value={branch.id}>
                                                {branch.name}
                                            </option>
                                        ))}
                                    </select>
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
            {showViewModal && selectedCarModel && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg w-full max-w-md max-h-90vh overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h3 className="text-xl font-semibold">Thông tin Mẫu Xe</h3>
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
                                <p className="text-gray-600">{selectedCarModel.id}</p>
                            </div>
                            <div className="mb-4">
                                <h4 className="font-semibold text-gray-700 mb-2">Tên Mẫu Xe:</h4>
                                <p className="text-gray-600">{selectedCarModel.name}</p>
                            </div>
                            <div className="mb-4">
                                <h4 className="font-semibold text-gray-700 mb-2">Danh mục:</h4>
                                <p className="text-gray-600">
                                    {selectedCarModel.category}
                                </p>
                            </div>
                            <div className="mb-4">
                                <h4 className="font-semibold text-gray-700 mb-2">Hãng xe:</h4>
                                <p className="text-gray-600">
                                    {selectedCarModel.brand}
                                </p>
                            </div>
                            {selectedCarModel.createdDate && (
                                <div className="mb-4">
                                    <h4 className="font-semibold text-gray-700 mb-2">Ngày tạo:</h4>
                                    <p className="text-gray-600">
                                        {new Date(selectedCarModel.createdDate).toLocaleDateString('vi-VN')}
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