import React, { useState, useEffect } from "react";
import { 
    FaStore, FaShapes, FaCar, FaPlus, FaSearch, 
    FaRegBell, FaCog, FaQuestionCircle, FaSignOutAlt,
    FaBolt, FaCheckCircle, FaExclamationCircle, FaTimes, FaThLarge
} from "react-icons/fa";
import axios, { authApis, endpoints } from "./../../configs/APIs";
import StaffLayout from "./StaffLayout";

export default function UnifiedDashboard() {
    const [carModels, setCarModels] = useState([]);
    const [categories, setCategories] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(false);

    // Smart Filter States
    const [searchQuery, setSearchQuery] = useState("");

    // Modal States
    const [modelModal, setModelModal] = useState({ show: false, mode: "create", data: null });
    const [branchModal, setBranchModal] = useState({ show: false });
    const [categoryModal, setCategoryModal] = useState({ show: false });

    // Forms
    const [modelForm, setModelForm] = useState({ name: "", categoryId: "", carBranchId: "" });
    const [branchForm, setBranchForm] = useState({ name: "", country: "" });
    const [categoryForm, setCategoryForm] = useState({ name: "" });

    // Notifications & Feed
    const [toasts, setToasts] = useState([]);
    
    // UI Layout Active States
    const [activeSidebar, setActiveSidebar] = useState("Dashboard");
    const [activeTopNav, setActiveTopNav] = useState("Dashboard");

    // Dynamic Activity Feed
    const [activities, setActivities] = useState([
        { id: 1, type: "info", dot: "bg-blue-500", title: "Admin customized dashboard UI", desc: "System initialized" }
    ]);

    const addActivity = (title, desc, type="info") => {
        const dot = type === 'success' ? 'bg-emerald-500' : type === 'danger' ? 'bg-red-500' : 'bg-blue-500';
        setActivities(prev => [{ id: Date.now(), type, dot, title, desc }, ...prev].slice(0, 5));
    };

    const showToast = (message, undoCallback = null) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, undoCallback }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [modelsRes, catsRes, branchesRes] = await Promise.all([
                axios.get(endpoints["get-all-model"]),
                axios.get(endpoints["car-category"]),
                axios.get(endpoints["car-branch"])
            ]);
            
            const fetchedModels = modelsRes.data.result || [];
            const fetchedCats = catsRes.data.result || [];
            const fetchedBranches = branchesRes.data.result?.data || branchesRes.data.result || [];

            setCarModels(fetchedModels.length ? fetchedModels : [
                { id: 1, name: "911 GT3 RS", brand: "Porsche", category: "Coupe", carBranchId: 1, categoryId: 1, basePrice: 223800, status: "Active" },
                { id: 2, name: "M4 Competition", brand: "BMW", category: "Sedan", carBranchId: 2, categoryId: 3, basePrice: 82200, status: "Active" }
            ]);
            setCategories(fetchedCats.length ? fetchedCats : [{ id: 1, name: "Coupe" }, { id: 3, name: "Sedan" }]);
            setBranches(fetchedBranches.length ? fetchedBranches : [
                { id: 1, name: "Porsche", country: "STUTTGART, GERMANY", image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=200&fit=crop" },
                { id: 2, name: "BMW", country: "MUNICH, GERMANY", image: "https://images.unsplash.com/photo-1555013349-1662580a6b7e?q=80&w=200&fit=crop" }
            ]);
        } catch (error) {
            setCarModels([{ id: 1, name: "911 GT3 RS", brand: "Porsche", category: "Coupe", carBranchId: 1, categoryId: 1, basePrice: 223800, status: "Active" }]);
            setCategories([{ id: 1, name: "Coupe" }]);
            setBranches([{ id: 1, name: "Porsche", country: "STUTTGART, GERMANY", image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=200&fit=crop" }]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        document.body.style.backgroundColor = '#f9fafb';
    }, []);

    // Form Submits Pattern
    const handleModelSubmit = async (e) => {
        e.preventDefault();
        try {
            if (modelModal.mode === "create") {
                const res = await authApis().post(endpoints["create-model"], {
                    name: modelForm.name, categoryId: parseInt(modelForm.categoryId), carBranchId: parseInt(modelForm.carBranchId)
                });
                if (res.status === 200 || res.status === 201) {
                    setCarModels([...carModels, {...res.data.result, status: 'Active'}]);
                    addActivity(`Staff added model: ${modelForm.name}`, "Inventory Update", "success");
                    setModelModal({ show: false, mode: "create", data: null });
                }
            } else {
                const res = await authApis().put(endpoints["update-car-model"](modelModal.data.id), {
                    name: modelForm.name, categoryId: parseInt(modelForm.categoryId), carBranchId: parseInt(modelForm.carBranchId)
                });
                if (res.status === 200) {
                    setCarModels(carModels.map(m => m.id === modelModal.data.id ? { ...m, name: modelForm.name, categoryId: modelForm.categoryId, carBranchId: modelForm.carBranchId } : m));
                    addActivity(`Staff updated model: ${modelForm.name}`, "Inventory Update", "info");
                    setModelModal({ show: false, mode: "create", data: null });
                }
            }
        } catch (error) {
            // Mock Fallback
            if(modelModal.mode==="create") {
                setCarModels([...carModels, {id: Date.now(), name: modelForm.name, carBranchId: modelForm.carBranchId, categoryId: modelForm.categoryId, status: 'Active'}]);
                addActivity(`Added mock model: ${modelForm.name}`, "Local Fallback", "success");
            } else {
                setCarModels(carModels.map(m => m.id === modelModal.data.id ? { ...m, name: modelForm.name, categoryId: modelForm.categoryId, carBranchId: modelForm.carBranchId } : m));
            }
            setModelModal({ show: false, mode: "create", data: null });
        }
    };

    const handleDeleteModel = async (id, name) => {
        const backup = carModels.find(m => m.id === id);
        setCarModels(carModels.filter(m => m.id !== id));
        addActivity(`Deleted Model: ${name}`, "Trash bin cleared", "danger");
        
        showToast(`Model ${name} deleted.`, () => {
            setCarModels(prev => [...prev, backup]);
            addActivity(`Restored Model: ${name}`, "Action Reverted", "info");
        });
        try {
            await authApis().delete(endpoints["delete-model"](id));
        } catch(e){}
    };

    const handleBranchSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append("name", branchForm.name);
            if (branchForm.country) formData.append("country", branchForm.country);
            const res = await authApis().post(endpoints["create-branch"], formData, { headers: { "Content-Type": "multipart/form-data" } });
            if (res.status === 200 || res.status === 201) {
                setBranches([...branches, res.data.result]);
                addActivity(`Added Branch: ${branchForm.name}`, "Inventory Update", "success");
            }
        } catch (err) {
            // Mock fallback
            const mockBranch = { id: Date.now(), name: branchForm.name, country: branchForm.country.toUpperCase(), image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=200&fit=crop" };
            setBranches([...branches, mockBranch]);
            addActivity(`Added Branch (mock): ${branchForm.name}`, "Local Fallback", "info");
        } finally {
            setBranchForm({ name: "", country: "" });
            setBranchModal({ show: false });
        }
    };

    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append("name", categoryForm.name);
            const res = await authApis().post(endpoints["create-category"], formData, { headers: { "Content-Type": "multipart/form-data" } });
            if (res.status === 200 || res.status === 201) {
                setCategories([...categories, res.data.result]);
                addActivity(`Added Category: ${categoryForm.name}`, "Inventory Update", "success");
            }
        } catch (err) {
            // Mock fallback
            const mockCat = { id: Date.now(), name: categoryForm.name };
            setCategories([...categories, mockCat]);
            addActivity(`Added Category (mock): ${categoryForm.name}`, "Local Fallback", "info");
        } finally {
            setCategoryForm({ name: "" });
            setCategoryModal({ show: false });
        }
    };

    const filteredModels = carModels.filter(m => String(m.name).toLowerCase().includes(searchQuery.toLowerCase()));

    const formatCurrency = (val) => val ? `$${Number(val).toLocaleString()}` : 'N/A';

    return (
        <StaffLayout searchPlaceholder="Search models, VIN, or SKU..." searchVal={searchQuery} onSearchChange={e => setSearchQuery(e.target.value)}>
            <div className="px-8 py-6 relative h-full flex flex-col">
                
                {/* Local View Switcher */}
                <div className="flex border-b border-gray-200 mb-6 gap-8">
                    <button onClick={()=>{setActiveTopNav("Dashboard"); setActiveSidebar("Dashboard");}} className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTopNav === "Dashboard" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-800"}`}>Dashboard</button>
                    <button onClick={()=>{setActiveTopNav("Inventory"); setActiveSidebar("Models");}} className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTopNav === "Inventory" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-800"}`}>Kho xe (Model)</button>
                    <button onClick={()=>{setActiveTopNav("Branches"); setActiveSidebar("Branches");}} className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTopNav === "Branches" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-800"}`}>Branches</button>
                    <button onClick={()=>{setActiveTopNav("Categories"); setActiveSidebar("Categories");}} className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTopNav === "Categories" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-800"}`}>Categories</button>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
                    <div className="max-w-6xl mx-auto space-y-8">

                        {/* ====== DASHBOARD VIEW ====== */}
                        {activeSidebar === "Dashboard" && (<>
                        {/* SYSTEM OVERVIEW HEADER */}
                        <div className="flex justify-between items-end">
                            <div>
                                <h2 className="text-[32px] font-black text-gray-900 tracking-tight leading-tight">System Overview</h2>
                                <p className="text-[15px] text-gray-500 mt-1">Manage global inventory and branch distribution.</p>
                            </div>
                            <button 
                                onClick={() => { setModelForm({name:'', categoryId:'', carBranchId:''}); setModelModal({show: true, mode: 'create', data: null}); }}
                                className="bg-[#0f62fe] active:bg-blue-800 hover:bg-blue-700 text-white px-5 py-2.5 rounded shadow-sm font-medium flex items-center gap-2 text-sm transition-colors"
                            >
                                <FaPlus size={12}/> Quick Action
                            </button>
                        </div>

                        {/* STAT CARDS */}
                        <div className="grid grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                                <div className="flex justify-between items-start mb-6">
                                    <FaStore className="text-blue-600 text-2xl"/>
                                    <span className="text-3xl font-bold text-gray-900">{branches.length < 10 ? `0${branches.length}` : branches.length}</span>
                                </div>
                                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">Total Branches</div>
                                <div className="flex gap-2">
                                    {branches.slice(0,4).map((b, i) => (
                                        <div key={i} className="w-8 h-8 bg-gray-100 rounded overflow-hidden border border-gray-200">
                                            <img src={b.image} alt="branch" className="w-full h-full object-cover opacity-80 mix-blend-multiply"/>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                                <div className="flex justify-between items-start mb-6">
                                    <FaShapes className="text-blue-600 text-2xl"/>
                                    <span className="text-3xl font-bold text-gray-900">{categories.length < 10 ? `0${categories.length}` : categories.length}</span>
                                </div>
                                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">Total Categories</div>
                                <div className="flex gap-2">
                                    {categories.slice(0,4).map(c => (
                                        <span key={c.name} className="text-[10px] font-bold bg-gray-100 px-2.5 py-1 rounded text-gray-600 truncate max-w-[60px]">{c.name}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                                <div className="flex justify-between items-start mb-6">
                                    <FaCar className="text-blue-600 text-2xl"/>
                                    <span className="text-3xl font-bold text-gray-900">{carModels.length}</span>
                                </div>
                                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Total Models</div>
                                <div className="text-[13px] font-bold text-[#0f62fe] tracking-wide">+24 this week</div>
                            </div>
                        </div>

                        {/* BRANCHES */}
                        <section>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><FaStore className="text-[#0f62fe]"/> Branches</h3>
                                <div className="flex gap-3">
                                    <button onClick={()=>setCategoryModal({show:true})} className="text-indigo-600 font-bold flex items-center gap-1 hover:text-indigo-800 text-sm border border-indigo-100 bg-indigo-50 px-3 py-1.5 rounded-lg">
                                        <FaPlus size={10}/> Add Category
                                    </button>
                                    <button onClick={()=>setBranchModal({show:true})} className="text-[#0f62fe] font-bold flex items-center gap-1 hover:text-blue-800 text-sm border border-blue-100 bg-blue-50 px-3 py-1.5 rounded-lg">
                                        <FaPlus size={10}/> Add Branch
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-4 gap-6">
                                {branches.slice(0,4).map(branch => (
                                    <div key={branch.id} className="bg-white rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-md transition-shadow">
                                        <div className="w-16 h-12 mb-3 bg-gray-50 overflow-hidden text-center object-contain">
                                            <img src={branch.image} alt={branch.name} className="w-full h-full object-cover mix-blend-multiply hover:scale-105 transition-transform"/>
                                        </div>
                                        <h4 className="font-bold text-gray-900 text-[15px] mb-0.5">{branch.name}</h4>
                                        <p className="text-[9px] text-gray-400 font-bold tracking-widest uppercase">{branch.country}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* MODELS TABLE CONTEXT */}
                        <section className="relative">
                            
                            <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden w-full max-w-[calc(100%-320px)] lg:max-w-[calc(100%-340px)]">
                                
                                <div className="p-5 border-b border-gray-100">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Models Management</h3>
                                    <div className="relative">
                                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm"/>
                                        <input 
                                            type="text" 
                                            placeholder="Search models, VIN, or SKU..." 
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 rounded border-none focus:ring-2 focus:ring-[#0f62fe] text-sm text-gray-700"
                                        />
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm whitespace-nowrap">
                                        <thead>
                                            <tr className="border-b border-gray-100">
                                                <th className="px-5 py-3 w-10"><input type="checkbox" className="rounded border-gray-300"/></th>
                                                <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Model Name</th>
                                                <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Branch</th>
                                                <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Category</th>
                                                <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Base Price</th>
                                                <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Status</th>
                                                <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {filteredModels.map(model => (
                                                <tr key={model.id} className="hover:bg-gray-50/50 group">
                                                    <td className="px-5 py-4"><input type="checkbox" className="rounded border-gray-300"/></td>
                                                    <td className="px-5 py-4 font-bold text-gray-900">{model.name}</td>
                                                    <td className="px-5 py-4 text-gray-600">{model.brand || branches.find(b=>b.id===model.carBranchId)?.name}</td>
                                                    <td className="px-5 py-4">
                                                        <span className="px-2.5 py-1 text-[10px] font-bold bg-gray-100 text-gray-700 rounded uppercase">{model.category || categories.find(c=>c.id===model.categoryId)?.name}</span>
                                                    </td>
                                                    <td className="px-5 py-4 font-mono text-gray-600 font-medium">{formatCurrency(model.basePrice || model.price)}</td>
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-1.5 text-xs font-bold">
                                                            <div className={`w-1.5 h-1.5 rounded-full ${model.status === 'Active' ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
                                                            <span className={model.status === 'Active' ? 'text-emerald-600' : 'text-gray-500'}>{model.status}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4 text-right">
                                                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => {setModelForm({name: model.name, carBranchId: model.carBranchId||'', categoryId: model.categoryId||''}); setModelModal({show: true, mode: 'edit', data: model})}} className="text-blue-600 hover:text-blue-800 font-bold text-[11px] tracking-wider uppercase">Edit</button>
                                                            <button onClick={() => handleDeleteModel(model.id, model.name)} className="text-red-500 hover:text-red-700 font-bold text-[11px] tracking-wider uppercase">Del</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {filteredModels.length === 0 && (
                                                <tr><td colSpan="6" className="p-8 text-center text-gray-400">No models found</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                                    <span>Showing 4 of 1,402 models</span>
                                    <div className="flex gap-2">
                                        <button className="px-3 py-1.5 border border-gray-200 rounded text-gray-600 hover:bg-gray-50">Previous</button>
                                        <button className="px-3 py-1.5 border border-gray-200 rounded font-bold text-gray-900 hover:bg-gray-50">Next</button>
                                    </div>
                                </div>
                            </div>
                            
                            {/* ABSOLUTE SYSTEM ACTIVITY SIDEBAR */}
                            <div className="absolute top-0 right-0 w-[300px] h-full shadow-[0_4px_24px_rgba(0,0,0,0.06)] rounded-xl overflow-hidden flex flex-col">
                                <div className="bg-[#0f62fe] text-white p-4 flex items-center justify-between">
                                    <span className="font-bold text-sm tracking-wide">System Activity</span>
                                    <FaBolt className="text-white"/>
                                </div>
                                <div className="flex-1 bg-white p-4 space-y-5">
                                    {activities.map((act, i) => (
                                        <div key={i} className="flex gap-3 relative before:content-[''] before:absolute before:left-1 before:top-4 before:bottom-[-20px] before:w-px before:bg-gray-100 last:before:hidden">
                                            <div className={`w-2 h-2 mt-1.5 shrink-0 rounded-full ${act.dot} relative z-10`}></div>
                                            <div>
                                                <p className="text-[13px] font-bold text-gray-900 leading-snug">{act.title}</p>
                                                <p className="text-[11px] text-gray-500 mt-0.5 font-medium">{act.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </section>
                        </>)}

                        {/* ====== BRANCHES VIEW ====== */}
                        {activeSidebar === "Branches" && (<>
                        <div className="flex justify-between items-end mb-6">
                            <div>
                                <h2 className="text-[28px] font-black text-gray-900 tracking-tight">Branches</h2>
                                <p className="text-gray-500 mt-1">Manage car brand branches and dealerships.</p>
                            </div>
                            <button onClick={()=>setBranchModal({show:true})} className="bg-[#0f62fe] text-white px-5 py-2.5 rounded shadow-sm font-medium flex items-center gap-2 text-sm hover:bg-blue-700 transition-colors">
                                <FaPlus size={12}/> Add Branch
                            </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {branches.map(branch => (
                                <div key={branch.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-md transition-shadow group relative overflow-hidden">
                                    <div className="w-20 h-14 mb-4 bg-gray-50 rounded overflow-hidden flex items-center justify-center">
                                        <img src={branch.image} alt={branch.name} className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform"/>
                                    </div>
                                    <h4 className="font-bold text-gray-900 text-base mb-0.5">{branch.name}</h4>
                                    <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">{branch.country}</p>
                                    <div className="absolute inset-0 bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                        <button className="px-3 py-1.5 bg-blue-500 text-white rounded text-xs font-bold hover:bg-blue-600">Edit</button>
                                        <button className="px-3 py-1.5 bg-red-500 text-white rounded text-xs font-bold hover:bg-red-600">Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        </>)}

                        {/* ====== CATEGORIES VIEW ====== */}
                        {activeSidebar === "Categories" && (<>
                        <div className="flex justify-between items-end mb-6">
                            <div>
                                <h2 className="text-[28px] font-black text-gray-900 tracking-tight">Categories</h2>
                                <p className="text-gray-500 mt-1">Manage vehicle categories and types.</p>
                            </div>
                            <button onClick={()=>setCategoryModal({show:true})} className="bg-indigo-600 text-white px-5 py-2.5 rounded shadow-sm font-medium flex items-center gap-2 text-sm hover:bg-indigo-700 transition-colors">
                                <FaPlus size={12}/> Add Category
                            </button>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead><tr className="border-b border-gray-100 bg-gray-50">
                                    <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">#</th>
                                    <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Name</th>
                                    <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Models</th>
                                    <th className="px-6 py-3"></th>
                                </tr></thead>
                                <tbody className="divide-y divide-gray-50">
                                    {categories.map((cat, i) => (
                                        <tr key={cat.id} className="hover:bg-gray-50/50 group">
                                            <td className="px-6 py-4 text-gray-400 font-bold">{String(i+1).padStart(2,'0')}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1.5 bg-indigo-50 text-indigo-700 font-bold text-xs rounded uppercase tracking-wider">{cat.name}</span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 font-medium">{carModels.filter(m=>m.categoryId===cat.id || m.category===cat.name).length} models</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="text-indigo-600 hover:text-indigo-800 font-bold text-[11px] uppercase">Edit</button>
                                                    <button className="text-red-500 hover:text-red-700 font-bold text-[11px] uppercase">Del</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        </>)}

                        {/* ====== MODELS ONLY VIEW ====== */}
                        {activeSidebar === "Models" && (<>
                        <div className="flex justify-between items-end mb-6">
                            <div>
                                <h2 className="text-[28px] font-black text-gray-900 tracking-tight">Models Management</h2>
                                <p className="text-gray-500 mt-1">Full inventory of all car models.</p>
                            </div>
                            <button onClick={()=>{ setModelForm({name:'', categoryId:'', carBranchId:''}); setModelModal({show:true, mode:'create', data:null}); }} className="bg-[#0f62fe] text-white px-5 py-2.5 rounded shadow-sm font-medium flex items-center gap-2 text-sm hover:bg-blue-700 transition-colors">
                                <FaPlus size={12}/> Add Model
                            </button>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-gray-100">
                                <div className="relative">
                                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm"/>
                                    <input type="text" placeholder="Search models..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} className="w-full pl-11 pr-4 py-2.5 bg-gray-50 rounded border-none focus:ring-2 focus:ring-[#0f62fe] text-sm"/>
                                </div>
                            </div>
                            <table className="w-full text-left text-sm">
                                <thead><tr className="border-b border-gray-100">
                                    <th className="px-5 py-3 w-10"><input type="checkbox" className="rounded border-gray-300"/></th>
                                    <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Model Name</th>
                                    <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Branch</th>
                                    <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Category</th>
                                    <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Status</th>
                                    <th className="px-5 py-3"></th>
                                </tr></thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredModels.map(model => (
                                        <tr key={model.id} className="hover:bg-gray-50/50 group">
                                            <td className="px-5 py-4"><input type="checkbox" className="rounded border-gray-300"/></td>
                                            <td className="px-5 py-4 font-bold text-gray-900">{model.name}</td>
                                            <td className="px-5 py-4 text-gray-600">{model.brand || branches.find(b=>b.id===model.carBranchId)?.name}</td>
                                            <td className="px-5 py-4"><span className="px-2.5 py-1 text-[10px] font-bold bg-gray-100 text-gray-700 rounded uppercase">{model.category || categories.find(c=>c.id===model.categoryId)?.name}</span></td>
                                            <td className="px-5 py-4"><div className="flex items-center gap-1.5 text-xs font-bold"><div className={`w-1.5 h-1.5 rounded-full ${model.status==='Active'?'bg-emerald-500':'bg-gray-400'}`}></div><span className={model.status==='Active'?'text-emerald-600':'text-gray-500'}>{model.status}</span></div></td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={()=>{setModelForm({name:model.name, carBranchId:model.carBranchId||'', categoryId:model.categoryId||''}); setModelModal({show:true, mode:'edit', data:model})}} className="text-blue-600 hover:text-blue-800 font-bold text-[11px] uppercase">Edit</button>
                                                    <button onClick={()=>handleDeleteModel(model.id,model.name)} className="text-red-500 hover:text-red-700 font-bold text-[11px] uppercase">Del</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredModels.length===0 && <tr><td colSpan="6" className="p-8 text-center text-gray-400">No models found</td></tr>}
                                </tbody>
                            </table>
                        </div>
                        </>)}

                    </div>

                    {/* TOAST NOTIFICATION COPY */}
                    {toasts.map(t => (
                        <div key={t.id} className="absolute bottom-12 left-1/2 -translate-x-1/2 ml-[-150px] bg-[#323232] text-white px-5 py-3 rounded text-sm shadow-xl flex items-center gap-6 animate-fade-in-up" style={{zIndex: 999}}>
                            <span>{t.message}</span>
                            <button className="text-[#78a9ff] font-bold uppercase text-[11px] tracking-widest hover:text-blue-300 transition-colors pointer-events-auto" onClick={() => setToasts([])}>UNDO</button>
                            <button className="text-gray-400 hover:text-white pointer-events-auto" onClick={() => setToasts([])}><FaTimes size={14}/></button>
                        </div>
                    ))}

                    {/* FOOTER TEXT */}
                    <div className="fixed bottom-0 left-64 right-0 h-12 bg-gray-50 border-t border-gray-200 px-8 flex items-center justify-between text-[9px] font-bold tracking-widest uppercase text-gray-500 font-mono">
                        <span>© 2024 PRECISION AUTOMOTIVE GROUP. SYSTEM STATUS: OPERATIONAL</span>
                        <div className="flex gap-6">
                            <span className="hover:text-gray-800 cursor-pointer">PRIVACY POLICY</span>
                            <span className="hover:text-gray-800 cursor-pointer">LEGAL INFORMATION</span>
                            <span className="hover:text-gray-800 cursor-pointer">TECHNICAL DOCS</span>
                        </div>
                    </div>
                </div>

                {/* MODAL SYSTEM */}
                {modelModal.show && (
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[999] animate-fade-in-up">
                        <div className="bg-white rounded-xl w-full max-w-md shadow-2xl p-6 relative">
                            <button onClick={()=>setModelModal({show:false})} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900"><FaTimes/></button>
                            <h3 className="text-xl font-bold text-gray-900 mb-6">{modelModal.mode === 'create' ? 'Add New Model' : 'Edit Model'}</h3>
                            
                            <form onSubmit={handleModelSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Model Name</label>
                                    <input required value={modelForm.name} onChange={e=>setModelForm({...modelForm, name: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-[#0f62fe] focus:outline-none text-sm"/>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Branch</label>
                                    <select required value={modelForm.carBranchId} onChange={e=>setModelForm({...modelForm, carBranchId: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-[#0f62fe] focus:outline-none text-sm">
                                        <option value="">Select Branch</option>
                                        {branches.map(b => <option value={b.id} key={b.id}>{b.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Category</label>
                                    <select required value={modelForm.categoryId} onChange={e=>setModelForm({...modelForm, categoryId: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-[#0f62fe] focus:outline-none text-sm">
                                        <option value="">Select Category</option>
                                        {categories.map(c => <option value={c.id} key={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={()=>setModelModal({show:false})} className="flex-1 border border-gray-200 py-2.5 rounded font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
                                    <button type="submit" className="flex-1 bg-[#0f62fe] text-white py-2.5 rounded font-bold hover:bg-blue-700 shadow flex items-center justify-center gap-2"><FaCheckCircle/> Save</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* BRANCH MODAL */}
                {branchModal.show && (
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[999] animate-fade-in-up">
                        <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl p-6 relative">
                            <button onClick={()=>setBranchModal({show:false})} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900"><FaTimes/></button>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"><FaStore/></div>
                                <h3 className="text-xl font-bold text-gray-900">New Branch</h3>
                            </div>
                            <form onSubmit={handleBranchSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Brand Name *</label>
                                    <input required value={branchForm.name} onChange={e=>setBranchForm({...branchForm, name: e.target.value})} placeholder="e.g. Porsche" className="w-full px-4 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-[#0f62fe] focus:outline-none text-sm"/>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Country / HQ</label>
                                    <input value={branchForm.country} onChange={e=>setBranchForm({...branchForm, country: e.target.value})} placeholder="e.g. Stuttgart, Germany" className="w-full px-4 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-[#0f62fe] focus:outline-none text-sm"/>
                                </div>
                                <div className="pt-2 flex gap-3">
                                    <button type="button" onClick={()=>setBranchModal({show:false})} className="flex-1 border border-gray-200 py-2.5 rounded font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
                                    <button type="submit" className="flex-1 bg-[#0f62fe] text-white py-2.5 rounded font-bold hover:bg-blue-700 shadow flex items-center justify-center gap-2"><FaCheckCircle/> Create</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* CATEGORY MODAL */}
                {categoryModal.show && (
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[999] animate-fade-in-up">
                        <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl p-6 relative">
                            <button onClick={()=>setCategoryModal({show:false})} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900"><FaTimes/></button>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center"><FaShapes/></div>
                                <h3 className="text-xl font-bold text-gray-900">New Category</h3>
                            </div>
                            <form onSubmit={handleCategorySubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Category Name *</label>
                                    <input required value={categoryForm.name} onChange={e=>setCategoryForm({name: e.target.value})} placeholder="e.g. Electric Vehicle" className="w-full px-4 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"/>
                                </div>
                                <div className="pt-2 flex gap-3">
                                    <button type="button" onClick={()=>setCategoryModal({show:false})} className="flex-1 border border-gray-200 py-2.5 rounded font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
                                    <button type="submit" className="flex-1 bg-indigo-600 text-white py-2.5 rounded font-bold hover:bg-indigo-700 shadow flex items-center justify-center gap-2"><FaCheckCircle/> Create</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>
            <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.3s ease-out forwards;
                }
            `}</style>
        </StaffLayout>
    );
}