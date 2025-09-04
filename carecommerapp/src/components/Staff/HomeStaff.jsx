import React, { useState, useRef, useEffect } from "react";
import  axios ,{ authApis, endpoints } from "./../../configs/APIs";

export default function CarForm() {
  const [car, setCar] = useState({
    name: "",
    price: "",
    year: "",
    carBranch: "",
    carModel: "",
    carFeature: {
      carComfortResponse: {
        mayDieuHoa: false,
        manHinh: "",
        ghe: "",
        sacKhongDay: false,
        copDien: false,
        cuaSo: "",
        bluetooth: false,
        loa: "",
        gps: false,
      },
      carExteriorResponse: {
        den: "",
        gatMua: "",
        smartKey: false,
        guongDien: false,
      },
      featureSafetyResponse: {
        tuiKhi: false,
        phanh: "",
        canBangDienTu: false,
        hoTroGiuLan: false,
        camera: false,
        camBienDoXe: false,
      },
    },
    carService: {
      dongCo: "",
      hopSo: "",
      congSuat: "",
      momenXoan: "",
      dungTichXiLanh: "",
      dungTichXang: "",
      chieuDai: "",
      mauSac: "",
      tocDoToiDa: "",
      loaiNhienLieu: "",
    },
  });

  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [loading, setLoading]= useState(false)

  const [carModel, setCarModel] = useState([]);

  const fileInputRef = useRef(null);

  const handleChange = (e, path) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;

    if (!path) {
      setCar({ ...car, [e.target.name]: value });
    } else {
      const keys = path.split(".");
      const newCar = { ...car };
      let obj = newCar;
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      setCar(newCar);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = [...images, ...files];
    setImages(newImages);

    // Create preview URLs
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImages(prev => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = previewImages.filter((_, i) => i !== index);
    setImages(newImages);
    setPreviewImages(newPreviews);
  };


  const fetchCarModel = async (e)=>{
    const res= await axios.get(endpoints["car-model"]);
    if (res.status === 200 || res.status === 201){
      setCarModel(res.data.result);
    }

  }

  useEffect(()=>{
    fetchCarModel()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    // Basic car info
    formData.append('name', car.name);
    formData.append('carModel', car.carModel);
    formData.append('price', car.price);
    formData.append('year', car.year);
    formData.append('carBranch', car.carBranch);

    // Car Comfort Features
    formData.append('carFeature.carComfort.mayDieuHoa', car.carFeature.carComfortResponse.mayDieuHoa);
    formData.append('carFeature.carComfort.manHinh', car.carFeature.carComfortResponse.manHinh);
    formData.append('carFeature.carComfort.ghe', car.carFeature.carComfortResponse.ghe);
    formData.append('carFeature.carComfort.sacKhongDay', car.carFeature.carComfortResponse.sacKhongDay);
    formData.append('carFeature.carComfort.copDien', car.carFeature.carComfortResponse.copDien);
    formData.append('carFeature.carComfort.cuaSo', car.carFeature.carComfortResponse.cuaSo);
    formData.append('carFeature.carComfort.bluetooth', car.carFeature.carComfortResponse.bluetooth);
    formData.append('carFeature.carComfort.loa', car.carFeature.carComfortResponse.loa);
    formData.append('carFeature.carComfort.gps', car.carFeature.carComfortResponse.gps);

    // Car Exterior Features
    formData.append('carFeature.carExterior.den', car.carFeature.carExteriorResponse.den);
    formData.append('carFeature.carExterior.gatMua', car.carFeature.carExteriorResponse.gatMua);
    formData.append('carFeature.carExterior.smartKey', car.carFeature.carExteriorResponse.smartKey);
    formData.append('carFeature.carExterior.guongDien', car.carFeature.carExteriorResponse.guongDien);

    // Safety Features
    formData.append('carFeature.featureSafety.tuiKhi', car.carFeature.featureSafetyResponse.tuiKhi);
    formData.append('carFeature.featureSafety.phanh', car.carFeature.featureSafetyResponse.phanh);
    formData.append('carFeature.featureSafety.canBangDienTu', car.carFeature.featureSafetyResponse.canBangDienTu);
    formData.append('carFeature.featureSafety.hoTroGiuLan', car.carFeature.featureSafetyResponse.hoTroGiuLan);
    formData.append('carFeature.featureSafety.camera', car.carFeature.featureSafetyResponse.camera);
    formData.append('carFeature.featureSafety.camBienDoXe', car.carFeature.featureSafetyResponse.camBienDoXe);

    // Car Service/Technical Specs
    formData.append('carService.dongCo', car.carService.dongCo);
    formData.append('carService.hopSo', car.carService.hopSo);
    formData.append('carService.congSuat', car.carService.congSuat);
    formData.append('carService.momenXoan', car.carService.momenXoan);
    formData.append('carService.dungTichXiLanh', car.carService.dungTichXiLanh);
    formData.append('carService.dungTichXang', car.carService.dungTichXang);
    formData.append('carService.chieuDai', car.carService.chieuDai);
    formData.append('carService.mauSac', car.carService.mauSac);
    formData.append('carService.tocDoToiDa', car.carService.tocDoToiDa);
    formData.append('carService.loaiNhienLieu', car.carService.loaiNhienLieu);

    images.forEach((image) => {
      formData.append('images', image);
    });

    try {

      // Simulate API call
      setLoading(true)
      
      const res= await authApis().post(endpoints["create-car"], formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
      })

      if(res.status=== 200 || res.status === 201){
        console.log("Thanh cong")
      }

    } catch (error) {
      console.error("Error:", error);
      alert("Có lỗi xảy ra khi gửi dữ liệu!");
    }
    finally{
      setLoading(false)
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white" style={{padding:"70px"}}>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Tạo Thông Tin Xe</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Thông tin cơ bản */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Thông Tin Cơ Bản</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên xe</label>
                <input
                  type="text"
                  name="name"
                  value={car.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VNĐ)</label>
                <input
                  type="number"
                  name="price"
                  value={car.price}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Năm sản xuất</label>
                <input
                  type="date"
                  name="year"
                  value={car.year}
                  onChange={handleChange}
                  min="1900-01-01"
                  max="2025-12-31"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />

              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Dòng xe</label>
                <select
                  value={car.carModel}
                  onChange={(e) => handleChange(e, "car.carModel")}
                > 
                  
                    <option value="">-- Chọn mẫu xe --</option>
                    {carModel.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name}
                      </option>
                    ))}
                  </select>

                  
              </div>
            </div>
          </div>

          {/* Car Comfort */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-blue-800">Tiện Nghi Xe</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={car.carFeature.carComfortResponse.mayDieuHoa}
                    onChange={(e) => handleChange(e, "carFeature.carComfortResponse.mayDieuHoa")}
                    className="w-4 h-4 text-blue-600"
                  />
                  <label className="text-sm font-medium text-gray-700">Máy điều hòa</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={car.carFeature.carComfortResponse.sacKhongDay}
                    onChange={(e) => handleChange(e, "carFeature.carComfortResponse.sacKhongDay")}
                    className="w-4 h-4 text-blue-600"
                  />
                  <label className="text-sm font-medium text-gray-700">Sạc không dây</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={car.carFeature.carComfortResponse.copDien}
                    onChange={(e) => handleChange(e, "carFeature.carComfortResponse.copDien")}
                    className="w-4 h-4 text-blue-600"
                  />
                  <label className="text-sm font-medium text-gray-700">Cốp điện</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={car.carFeature.carComfortResponse.bluetooth}
                    onChange={(e) => handleChange(e, "carFeature.carComfortResponse.bluetooth")}
                    className="w-4 h-4 text-blue-600"
                  />
                  <label className="text-sm font-medium text-gray-700">Bluetooth</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={car.carFeature.carComfortResponse.gps}
                    onChange={(e) => handleChange(e, "carFeature.carComfortResponse.gps")}
                    className="w-4 h-4 text-blue-600"
                  />
                  <label className="text-sm font-medium text-gray-700">GPS</label>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Màn hình</label>
                  <input
                    type="text"
                    value={car.carFeature.carComfortResponse.manHinh}
                    onChange={(e) => handleChange(e, "carFeature.carComfortResponse.manHinh")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="VD: 7 inch touchscreen"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghế</label>
                  <input
                    type="text"
                    value={car.carFeature.carComfortResponse.ghe}
                    onChange={(e) => handleChange(e, "carFeature.carComfortResponse.ghe")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="VD: Ghế da, chỉnh điện"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cửa sổ</label>
                  <input
                    type="text"
                    value={car.carFeature.carComfortResponse.cuaSo}
                    onChange={(e) => handleChange(e, "carFeature.carComfortResponse.cuaSo")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="VD: Cửa sổ điện"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loa</label>
                  <input
                    type="text"
                    value={car.carFeature.carComfortResponse.loa}
                    onChange={(e) => handleChange(e, "carFeature.carComfortResponse.loa")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="VD: 6 loa, Bose"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Car Exterior */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-green-800">Ngoại Thất</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={car.carFeature.carExteriorResponse.smartKey}
                    onChange={(e) => handleChange(e, "carFeature.carExteriorResponse.smartKey")}
                    className="w-4 h-4 text-green-600"
                  />
                  <label className="text-sm font-medium text-gray-700">Smart Key</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={car.carFeature.carExteriorResponse.guongDien}
                    onChange={(e) => handleChange(e, "carFeature.carExteriorResponse.guongDien")}
                    className="w-4 h-4 text-green-600"
                  />
                  <label className="text-sm font-medium text-gray-700">Gương điện</label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Đèn</label>
                  <input
                    type="text"
                    value={car.carFeature.carExteriorResponse.den}
                    onChange={(e) => handleChange(e, "carFeature.carExteriorResponse.den")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="VD: LED, Xenon"
                  />
                </div>
              </div>
              <div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gạt mưa</label>
                  <input
                    type="text"
                    value={car.carFeature.carExteriorResponse.gatMua}
                    onChange={(e) => handleChange(e, "carFeature.carExteriorResponse.gatMua")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="VD: Tự động cảm ứng"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Safety Features */}
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-red-800">Tính Năng An Toàn</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={car.carFeature.featureSafetyResponse.tuiKhi}
                    onChange={(e) => handleChange(e, "carFeature.featureSafetyResponse.tuiKhi")}
                    className="w-4 h-4 text-red-600"
                  />
                  <label className="text-sm font-medium text-gray-700">Túi khí</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={car.carFeature.featureSafetyResponse.canBangDienTu}
                    onChange={(e) => handleChange(e, "carFeature.featureSafetyResponse.canBangDienTu")}
                    className="w-4 h-4 text-red-600"
                  />
                  <label className="text-sm font-medium text-gray-700">Cân bằng điện tử</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={car.carFeature.featureSafetyResponse.hoTroGiuLan}
                    onChange={(e) => handleChange(e, "carFeature.featureSafetyResponse.hoTroGiuLan")}
                    className="w-4 h-4 text-red-600"
                  />
                  <label className="text-sm font-medium text-gray-700">Hỗ trợ giữ làn</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={car.carFeature.featureSafetyResponse.camera}
                    onChange={(e) => handleChange(e, "carFeature.featureSafetyResponse.camera")}
                    className="w-4 h-4 text-red-600"
                  />
                  <label className="text-sm font-medium text-gray-700">Camera</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={car.carFeature.featureSafetyResponse.camBienDoXe}
                    onChange={(e) => handleChange(e, "carFeature.featureSafetyResponse.camBienDoXe")}
                    className="w-4 h-4 text-red-600"
                  />
                  <label className="text-sm font-medium text-gray-700">Cảm biến đỗ xe</label>
                </div>
              </div>
              <div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phanh</label>
                  <input
                    type="text"
                    value={car.carFeature.featureSafetyResponse.phanh}
                    onChange={(e) => handleChange(e, "carFeature.featureSafetyResponse.phanh")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="VD: ABS, EBD"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Car Service */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-purple-800">Thông Số Kỹ Thuật</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Động cơ</label>
                <input
                  type="text"
                  value={car.carService.dongCo}
                  onChange={(e) => handleChange(e, "carService.dongCo")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="VD: 1.5L VTEC Turbo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hộp số</label>
                <input
                  type="text"
                  value={car.carService.hopSo}
                  onChange={(e) => handleChange(e, "carService.hopSo")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="VD: CVT, 6MT"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Công suất (HP)</label>
                <input
                  type="text"
                  value={car.carService.congSuat}
                  onChange={(e) => handleChange(e, "carService.congSuat")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="VD: 182 HP"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Momen xoắn (Nm)</label>
                <input
                  type="text"
                  value={car.carService.momenXoan}
                  onChange={(e) => handleChange(e, "carService.momenXoan")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="VD: 240 Nm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dung tích xi lanh (cc)</label>
                <input
                  type="text"
                  value={car.carService.dungTichXiLanh}
                  onChange={(e) => handleChange(e, "carService.dungTichXiLanh")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="VD: 1498"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dung tích xăng (L)</label>
                <input
                  type="text"
                  value={car.carService.dungTichXang}
                  onChange={(e) => handleChange(e, "carService.dungTichXang")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="VD: 57"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chiều dài (mm)</label>
                <input
                  type="text"
                  value={car.carService.chieuDai}
                  onChange={(e) => handleChange(e, "carService.chieuDai")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="VD: 4300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Màu sắc</label>
                <input
                  type="text"
                  value={car.carService.mauSac}
                  onChange={(e) => handleChange(e, "carService.mauSac")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="VD: Trắng, Đen, Xám"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tốc độ tối đa (km/h)</label>
                <input
                  type="text"
                  value={car.carService.tocDoToiDa}
                  onChange={(e) => handleChange(e, "carService.tocDoToiDa")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="VD: 200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loại nhiên liệu</label>
                <select
                  value={car.carService.loaiNhienLieu}
                  onChange={(e) => handleChange(e, "carService.loaiNhienLieu")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Chọn loại nhiên liệu</option>
                  <option value="Xăng">Xăng</option>
                  <option value="Dầu Diesel">Dầu Diesel</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Điện">Điện</option>
                </select>
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-yellow-800">Hình Ảnh Xe</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn hình ảnh (có thể chọn nhiều ảnh)
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"
              />
            </div>
            
            {images.length > 0 && (
              <div className="mt-4">
                <h4 className="text-md font-medium text-gray-700 mb-2">
                  Đã chọn {images.length} hình ảnh:
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {previewImages.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                      <p className="text-xs text-gray-600 mt-1 truncate">
                        {images[index].name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  &nbsp; Đang xử lý...
                </>
              ) : (
                "Tạo sản phẩm"
              )}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}