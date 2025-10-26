// ===================================
// FILE: frontend/src/components/MapDashboard.jsx
// Interactive Map with Report Markers
// ===================================

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { MapPin, TrendingUp, Package } from 'lucide-react';
import { reportAPI } from '../utils/api';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const MapDashboard = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
  });

  useEffect(() => {
    fetchReports();
  }, [selectedCrop]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = { status: 'verified', limit: 200 };
      if (selectedCrop !== 'all') params.cropType = selectedCrop;

      const response = await reportAPI.getAll(params);
      const reportData = response.data.reports;
      
      setReports(reportData);
      
      // Calculate stats
      setStats({
        total: reportData.length,
        verified: reportData.filter(r => r.status === 'verified').length,
        pending: reportData.filter(r => r.status === 'pending').length,
      });
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const cropTypes = ['all', 'wheat', 'rice', 'cotton', 'sugarcane', 'maize', 'mango', 'potato', 'onion'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Crop Report Map</h2>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-green-600">{stats.total}</p>
              </div>
              <Package className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-blue-600">{stats.verified}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <MapPin className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap gap-2">
          {cropTypes.map(crop => (
            <button
              key={crop}
              onClick={() => setSelectedCrop(crop)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCrop === crop
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {crop.charAt(0).toUpperCase() + crop.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: '600px' }}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading map data...</p>
            </div>
          </div>
        ) : (
          <MapContainer
            center={[30.3753, 69.3451]} // Pakistan center
            zoom={6}
            style={{ height: '100%', width: '100%' }}
          >
             <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
  
            {/* <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            /> */}
            
            {reports.map((report) => (
              <Marker
                key={report._id}
                position={[
                  report.location.coordinates[1],
                  report.location.coordinates[0]
                ]}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-bold text-lg mb-2">
                      {report.cropType.toUpperCase()}
                    </h3>
                    <p className="text-sm mb-1">
                      <strong>Quantity:</strong> {report.quantity.value} {report.quantity.unit}
                    </p>
                    <p className="text-sm mb-1">
                      <strong>Location:</strong> {report.location.address.district}, {report.location.address.province}
                    </p>
                    <p className="text-sm mb-1">
                      <strong>Status:</strong> 
                      <span className={`ml-1 px-2 py-1 rounded text-xs ${
                        report.status === 'verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {report.status}
                      </span>
                    </p>
                    {report.metadata.marketPrice && (
                      <p className="text-sm mb-1">
                        <strong>Price:</strong> PKR {report.metadata.marketPrice}/{report.quantity.unit}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Report ID: {report.reportId}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
    </div>
  );
};

export default MapDashboard;


