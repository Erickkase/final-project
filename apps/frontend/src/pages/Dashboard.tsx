import { useState, useEffect, useCallback } from 'react';
import { Layout } from '@/components/Layout';
import { reportService, EmotionSummary, EmotionTrend } from '@/services/reportService';
import { emotionService, EmotionStats } from '@/services/emotionService';
import { useAuth } from '@/contexts/AuthContext';
import { BarChart3, TrendingUp, Heart, Activity } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';

const COLORS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981'];

export const Dashboard = () => {
  const [summary, setSummary] = useState<EmotionSummary | null>(null);
  const [trend15, setTrend15] = useState<EmotionTrend[]>([]);
  const [trend30, setTrend30] = useState<EmotionTrend[]>([]);
  const [stats, setStats] = useState<EmotionStats | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<15 | 30>(15);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check if demo mode (admin token)
      const token = localStorage.getItem('token');
      const isDemoMode = token?.startsWith('demo-admin-token');
      
      if (isDemoMode) {
        // Load demo data
        const demoSummary: EmotionSummary = {
          userId: 'demo-admin',
          totalEmotions: 45,
          emotionDistribution: {
            'Happy': 15,
            'Sad': 8,
            'Angry': 5,
            'Anxious': 10,
            'Calm': 7
          },
          averageIntensity: 6.5,
          mostFrequentEmotion: 'Happy',
          trends: []
        };
        
        const demoTrend15: EmotionTrend[] = Array.from({ length: 15 }, (_, i) => ({
          date: new Date(Date.now() - (14 - i) * 24 * 60 * 60 * 1000).toISOString(),
          emotions: {
            Happy: Math.floor(Math.random() * 5) + 1,
            Sad: Math.floor(Math.random() * 3),
            Angry: Math.floor(Math.random() * 2),
            Anxious: Math.floor(Math.random() * 3),
            Calm: Math.floor(Math.random() * 4)
          },
          totalEmotions: Math.floor(Math.random() * 10) + 5
        }));
        
        const demoTrend30: EmotionTrend[] = Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
          emotions: {
            Happy: Math.floor(Math.random() * 5) + 1,
            Sad: Math.floor(Math.random() * 3),
            Angry: Math.floor(Math.random() * 2),
            Anxious: Math.floor(Math.random() * 3),
            Calm: Math.floor(Math.random() * 4)
          },
          totalEmotions: Math.floor(Math.random() * 10) + 5
        }));
        
        const demoStats: EmotionStats = {
          stats: {
            'Happy': 15,
            'Sad': 8,
            'Angry': 5,
            'Anxious': 10,
            'Calm': 7
          },
          averageIntensity: '6.5',
          mostFrequentEmotion: 'Happy',
          period: 'last-30-days'
        };
        
        setSummary(demoSummary);
        setTrend15(demoTrend15);
        setTrend30(demoTrend30);
        setStats(demoStats);
      } else {
        // Normal API calls
        const [summaryData, trend15Data, trend30Data, statsData] = await Promise.all([
          reportService.getSummary(),
          reportService.getTrend(15),
          reportService.getTrend(30),
          emotionService.getStats(user!.userId),
        ]);
        setSummary(summaryData);
        setTrend15(trend15Data);
        setTrend30(trend30Data);
        setStats(statsData);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const getEmotionPieData = () => {
    if (!summary) return [];
    return Object.entries(summary.emotionDistribution).map(([name, value]) => ({
      name,
      value,
    }));
  };

  const getTrendChartData = () => {
    const trends = selectedPeriod === 15 ? trend15 : trend30;
    return trends.map(trend => ({
      date: format(new Date(trend.date), 'MMM dd'),
      ...trend.emotions,
      total: trend.totalEmotions,
    }));
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of your emotional journey</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Emotions</p>
              <p className="text-3xl font-bold text-gray-900">{summary?.totalEmotions || 0}</p>
            </div>
            <Heart className="w-12 h-12 text-primary-600 opacity-20" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Intensity</p>
              <p className="text-3xl font-bold text-gray-900">{summary?.averageIntensity.toFixed(1) || '0'}</p>
            </div>
            <Activity className="w-12 h-12 text-yellow-600 opacity-20" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Most Frequent</p>
              <p className="text-xl font-bold text-gray-900 capitalize">{summary?.mostFrequentEmotion || 'N/A'}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-green-600 opacity-20" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Emotion Types</p>
              <p className="text-3xl font-bold text-gray-900">{Object.keys(summary?.emotionDistribution || {}).length}</p>
            </div>
            <BarChart3 className="w-12 h-12 text-purple-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        {/* Emotion Distribution */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Emotion Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={getEmotionPieData()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {getEmotionPieData().map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Stats by Type */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Emotions Count</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={Object.entries(stats?.stats || {}).map(([name, value]) => ({ name, value }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Emotion Trends</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedPeriod(15)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedPeriod === 15
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              15 Days
            </button>
            <button
              onClick={() => setSelectedPeriod(30)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedPeriod === 30
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              30 Days
            </button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={getTrendChartData()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="total" stroke="#0ea5e9" strokeWidth={2} name="Total" />
            <Line type="monotone" dataKey="alegria" stroke="#10b981" name="Alegria" />
            <Line type="monotone" dataKey="tristeza" stroke="#3b82f6" name="Tristeza" />
            <Line type="monotone" dataKey="miedo" stroke="#8b5cf6" name="Miedo" />
            <Line type="monotone" dataKey="ira" stroke="#ef4444" name="Ira" />
            <Line type="monotone" dataKey="disguto" stroke="#f59e0b" name="Disguto" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Layout>
  );
};
