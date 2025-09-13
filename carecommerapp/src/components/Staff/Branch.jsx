import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaEye, FaTimes } from "react-icons/fa";
import axios, { authApis, endpoints } from "../../configs/APIs";

export default function Branch() {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        country: '',
        imageBranch: null
    });
    const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize] = useState(5);

    // Simulate API calls - replace with actual API calls
    const fetchBranches = async () => {
        setLoading(true);
        try {
                const res = await axios.get(endpoints["car-branch"]);
                setBranches(res.data.result);
                setLoading(false);
            
        } catch (error) {
            showAlert('Lỗi khi tải danh sách Hãng xe!', 'danger');
            console.error('Error fetching branches:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
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

    const handleFileChange = (e) => {
        setFormData(prev => ({
            ...prev,
            imageBranch: e.target.files[0]
        }));
    };

    const openCreateModal = () => {
        setModalMode('create');
        setFormData({ name: '', country: '', imageBranch: null });
        setShowModal(true);
    };

    const openEditModal = (branch) => {
        setModalMode('edit');
        setSelectedBranch(branch);
        setFormData({
            name: branch.name || '',
            country: branch.country || '',
            imageBranch: null
        });
        setShowModal(true);
    };

    const openViewModal = (branch) => {
        setSelectedBranch(branch);
        setShowViewModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setShowViewModal(false);
        setSelectedBranch(null);
        setFormData({ name: '', country: '', imageBranch: null });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name.trim() || !formData.country.trim()) {
            showAlert('Vui lòng điền đầy đủ thông tin!', 'danger');
            return;
        }

        setLoading(true);
        
        try {
            
            const f= new FormData();
            f.append("name", formData.name)
            f.append("country", formData.country);
            f.append("imageBranch", formData.imageBranch)


            const res= await authApis().post(endpoints["create-branch"], f, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            } )

            if(res === 200 || res === 201){
                setBranches(prev => [...prev, res.data.result.d]);
            }

        } catch (error) {
            showAlert('Có lỗi xảy ra!', 'danger');
            console.error('Error submitting form:', error);
            setLoading(false);
        }
        finally{
            setLoading(false)
        }
    };

    const handleDelete = async (branchId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa Hãng xe này?')) {
            return;
        }

        setLoading(true);
        try {
            const res = await authApis().delete(endpoints["delete-branch"](branchId));

            if(res.status === 204){
                console.log("Xóa thành công:", res.data);
                showAlert("Đã xóa chi nhánh thành công!", "success");
            }
            fetchBranches();
            
        } catch (error) {
            showAlert('Lỗi khi xóa Hãng xe!', 'danger');
            console.error('Error deleting branch:', error);
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        fetchBranches(page);
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
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Quản lý Hãng xe Xe</h2>
                <button 
                    onClick={openCreateModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <FaPlus />
                    Thêm Hãng xe
                </button>
            </div>

            {/* Branches Table */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-gray-50 px-6 py-3 border-b">
                    <h5 className="font-semibold text-gray-800">Danh sách Hãng xe</h5>
                </div>
                <div className="p-6">
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Đang tải...</p>
                        </div>
                    ) : branches.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">Không có Hãng xe nào</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full table-auto">
                                    <thead>
                                        <tr className="border-b bg-gray-50">
                                            <th className="px-4 py-3 text-left font-semibold text-gray-700">#</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Tên Hãng xe</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Quốc gia</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Hình ảnh</th>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {branches.map((branch, index) => (
                                            <tr key={branch.id} className="border-b hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3">{(currentPage - 1) * pageSize + index + 1}</td>
                                                <td className="px-4 py-3 font-medium">{branch.name}</td>
                                                <td className="px-4 py-3">{branch.country}</td>
                                                <td className="px-4 py-3">
                                                    {branch.imageBranch ? (
                                                        <img 
                                                            src={branch.imageBranch} 
                                                            alt={branch.name}
                                                            className="w-12 h-12 object-cover rounded-lg"
                                                        />
                                                    ) : (
                                                        <span className="text-gray-400">Không có ảnh</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => openViewModal(branch)}
                                                            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded transition-colors"
                                                            title="Xem chi tiết"
                                                        >
                                                            <FaEye />
                                                        </button>
                                                        <button
                                                            onClick={() => openEditModal(branch)}
                                                            className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded transition-colors"
                                                            title="Chỉnh sửa"
                                                        >
                                                            <FaEdit />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(branch.id)}
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

                            {/* Pagination */}
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
                    <div className="bg-white rounded-lg w-full max-w-2xl max-h-90vh overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h3 className="text-xl font-semibold">
                                {modalMode === 'create' ? 'Thêm Hãng xe Mới' : 'Chỉnh sửa Hãng xe'}
                            </h3>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>
                        
                        <div className="p-6">
                            <div onSubmit={handleSubmit}>
                                <div className="grid md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tên Hãng xe *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="Nhập tên Hãng xe"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Quốc gia *
                                        </label>
                                        <input
                                            type="text"
                                            name="country"
                                            value={formData.country}
                                            onChange={handleInputChange}
                                            placeholder="Nhập tên quốc gia"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                </div>
                                
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Hình ảnh Hãng xe
                                    </label>
                                    <input
                                        type="file"
                                        name="imageBranch"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        Chọn file hình ảnh (JPG, PNG, GIF)
                                    </p>
                                </div>

                                {modalMode === 'edit' && selectedBranch?.imageBranch && (
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Hình ảnh hiện tại
                                        </label>
                                        <img 
                                            src={selectedBranch.imageBranch} 
                                            alt={selectedBranch.name}
                                            className="w-24 h-24 object-cover rounded-lg border"
                                        />
                                    </div>
                                )}
                            </div>
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
            {showViewModal && selectedBranch && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg w-full max-w-2xl max-h-90vh overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h3 className="text-xl font-semibold">Thông tin Hãng xe</h3>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>
                        
                        <div className="p-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <div className="mb-4">
                                        <h4 className="font-semibold text-gray-700 mb-2">Tên Hãng xe:</h4>
                                        <p className="text-gray-600">{selectedBranch.name}</p>
                                    </div>
                                    <div className="mb-4">
                                        <h4 className="font-semibold text-gray-700 mb-2">Quốc gia:</h4>
                                        <p className="text-gray-600">{selectedBranch.country}</p>
                                    </div>
                                    {selectedBranch.createdDate && (
                                        <div className="mb-4">
                                            <h4 className="font-semibold text-gray-700 mb-2">Ngày tạo:</h4>
                                            <p className="text-gray-600">
                                                {new Date(selectedBranch.createdDate).toLocaleDateString('vi-VN')}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    {selectedBranch.imageBranch ? (
                                        <div>
                                            <h4 className="font-semibold text-gray-700 mb-2">Hình ảnh:</h4>
                                            <img 
                                                src={selectedBranch.imageBranch} 
                                                alt={selectedBranch.name}
                                                className="w-full max-w-sm h-auto rounded-lg border"
                                            />
                                        </div>
                                    ) : (
                                        <div>
                                            <h4 className="font-semibold text-gray-700 mb-2">Hình ảnh:</h4>
                                            <p className="text-gray-400">Không có hình ảnh</p>
                                        </div>
                                    )}
                                </div>
                            </div>
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