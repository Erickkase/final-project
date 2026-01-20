import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { emotionService, Emotion } from '@/services/emotionService';
import { Heart, Trash2, Edit, Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';

export const EmotionList = () => {
  const [emotions, setEmotions] = useState<Emotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadEmotions();
  }, []);

  const loadEmotions = async () => {
    try {
      setLoading(true);
      const data = await emotionService.getEmotions(50, 0);
      setEmotions(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load emotions');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (emotionId: string) => {
    if (!confirm('Are you sure you want to delete this emotion?')) return;

    try {
      await emotionService.deleteEmotion(emotionId);
      setEmotions(emotions.filter(e => e.emotionId !== emotionId));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete emotion');
    }
  };

  const getEmotionColor = (type: string) => {
    const colors: { [key: string]: string } = {
      alegria: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      tristeza: 'bg-blue-100 text-blue-800 border-blue-300',
      miedo: 'bg-purple-100 text-purple-800 border-purple-300',
      ira: 'bg-red-100 text-red-800 border-red-300',
      disguto: 'bg-green-100 text-green-800 border-green-300',
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity >= 8) return 'text-red-600';
    if (intensity >= 5) return 'text-yellow-600';
    return 'text-green-600';
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

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Emotions</h1>
        <p className="text-gray-600 mt-2">Track and manage your emotional journey</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {emotions.length === 0 ? (
        <div className="card text-center py-12">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No emotions yet</h3>
          <p className="text-gray-600 mb-4">Start tracking your emotions to see them here</p>
          <button
            onClick={() => navigate('/emotions/new')}
            className="btn btn-primary"
          >
            Add Your First Emotion
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {emotions.map((emotion) => (
            <div key={emotion.emotionId} className="card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getEmotionColor(emotion.type)}`}>
                  {emotion.type}
                </span>
                <span className={`text-2xl font-bold ${getIntensityColor(emotion.intensity)}`}>
                  {emotion.intensity}/10
                </span>
              </div>

              <p className="text-gray-800 mb-4 line-clamp-3">{emotion.description}</p>

              <div className="space-y-2 mb-4">
                {emotion.location && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    {emotion.location}
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  {format(new Date(emotion.createdAt), 'PPp')}
                </div>
              </div>

              {emotion.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {emotion.tags.map((tag, idx) => (
                    <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={() => navigate(`/emotions/${emotion.emotionId}/edit`)}
                  className="btn btn-secondary flex-1 flex items-center justify-center"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(emotion.emotionId)}
                  className="btn bg-red-50 text-red-600 hover:bg-red-100 flex-1 flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};
