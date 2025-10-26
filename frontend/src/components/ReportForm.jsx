// ===================================
// FILE: frontend/src/components/ReportForm.jsx
// Crop Report Submission Form
// ===================================

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Upload, MapPin, Image as ImageIcon } from 'lucide-react';
import { reportAPI } from '../utils/api';

const CROP_TYPES = [
  'wheat', 'rice', 'cotton', 'sugarcane', 'maize', 
  'mango', 'potato', 'onion', 'other'
];

const UNITS = ['kg', 'tons', 'maunds', 'acres'];

const ReportForm = ({ onSuccess }) => {
  const { connected, publicKey } = useWallet();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [formData, setFormData] = useState({
    cropType: 'wheat',
    quantity: '',
    unit: 'kg',
    latitude: '',
    longitude: '',
    district: '',
    province: '',
    village: '',
    marketPrice: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files.slice(0, 5)); // Max 5 images
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6),
          });
        },
        (error) => alert('Location access denied')
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!connected) {
      alert('Please connect your wallet');
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      alert('Please enable location or enter coordinates');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      
      images.forEach(image => {
        data.append('images', image);
      });

      const response = await reportAPI.submit(data);
      
      alert('✅ Report submitted successfully! You will receive 0.01 SOL after verification.');
      
      // Reset form
      setFormData({
        cropType: 'wheat',
        quantity: '',
        unit: 'kg',
        latitude: '',
        longitude: '',
        district: '',
        province: '',
        village: '',
        marketPrice: '',
      });
      setImages([]);
      
      if (onSuccess) onSuccess(response.data.report);
      
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to submit report: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
        <p className="text-gray-600">Please connect your wallet to submit crop reports</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Submit Crop Report</h2>

      {/* Crop Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Crop Type *
        </label>
        <select
          name="cropType"
          value={formData.cropType}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
        >
          {CROP_TYPES.map(crop => (
            <option key={crop} value={crop}>
              {crop.charAt(0).toUpperCase() + crop.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Quantity */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantity *
          </label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            required
            step="0.01"
            min="0"
            placeholder="100"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Unit *
          </label>
          <select
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            {UNITS.map(unit => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Location *
        </label>
        <button
          type="button"
          onClick={getLocation}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mb-3"
        >
          <MapPin className="w-4 h-4" />
          Get Current Location
        </button>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="latitude"
            value={formData.latitude}
            onChange={handleChange}
            placeholder="Latitude"
            required
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
          <input
            type="text"
            name="longitude"
            value={formData.longitude}
            onChange={handleChange}
            placeholder="Longitude"
            required
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Address */}
      <div className="grid grid-cols-3 gap-4">
        <input
          type="text"
          name="village"
          value={formData.village}
          onChange={handleChange}
          placeholder="Village"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
        />
        <input
          type="text"
          name="district"
          value={formData.district}
          onChange={handleChange}
          placeholder="District"
          required
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
        />
        <input
          type="text"
          name="province"
          value={formData.province}
          onChange={handleChange}
          placeholder="Province"
          required
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Market Price */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Market Price (Optional)
        </label>
        <input
          type="number"
          name="marketPrice"
          value={formData.marketPrice}
          onChange={handleChange}
          step="0.01"
          min="0"
          placeholder="Price per unit"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Images */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Photos (Max 5)
        </label>
        <label className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500">
          <div className="text-center">
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <span className="text-sm text-gray-600">
              {images.length > 0 ? `${images.length} file(s) selected` : 'Click to upload images'}
            </span>
          </div>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="hidden"
          />
        </label>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? 'Submitting...' : 'Submit Report & Mint cNFT'}
      </button>

      <p className="text-xs text-gray-500 text-center">
        * After verification by community, you'll receive 0.01 SOL reward
      </p>
    </form>
  );
};

export default ReportForm;