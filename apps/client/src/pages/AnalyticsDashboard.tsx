import * as React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import logger from '@shared/utils/logger';

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#AF19FF',
  '#FF4560',
];

const AnalyticsDashboard: React.FC = () => {
  const [overview, setOverview] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [hourly, setHourly] = useState<any[]>([]);
  const navigate = useNavigate();

  const fetchData = async (url: string) => {
    const token = localStorage.getItem('staff_token');
    if (!token) {
      navigate('/staff');
      return null;
    }
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        navigate('/staff');
        return null;
      }
      return (res as any).json();
    } catch (err) {
      logger.error('Failed to fetch from ${url}:', 'Component', err);
      return null;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const overviewData = await fetchData('/api/analytics/overview');
      const servicesData = await fetchData(
        '/api/analytics/service-distribution'
      );
      const hourlyData = await fetchData('/api/analytics/hourly-activity');

      if (overviewData) {
        setOverview(overviewData);
      }
      if (servicesData) {
        setServices(servicesData);
      }
      if (hourlyData) {
        setHourly(hourlyData);
      }
    };
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Analytics Dashboard
          </h1>
          <button
            onClick={() => navigate('/staff/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow transition"
          >
            Back to Staff Dashboard
          </button>
        </div>

        {/* Overview Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700">Total Calls</h3>
            <p className="text-3xl font-bold text-blue-600">
              {overview?.totalCalls || '...'}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700">
              Avg. Call Duration
            </h3>
            <p className="text-3xl font-bold text-green-600">
              {overview?.averageCallDuration || '...'}s
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700">Languages</h3>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie
                  data={overview?.languageDistribution}
                  dataKey="count"
                  nameKey="language"
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  fill="#8884d8"
                  label
                >
                  {overview?.languageDistribution.map(
                    (entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    )
                  )}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              Popular Services
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={services}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="serviceType" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              Hourly Activity
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={hourly}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
