import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { emotionService, CreateEmotionRequest } from '@/services/emotionService';
import { Heart } from 'lucide-react';

const EMOTION_TYPES = ['alegria', 'tristeza', 'miedo', 'ira', 'disguto'];

export const CreateEmotion = () => {
  const [formData, setFormData] = useState<CreateEmotionRequest>({
    type: 'alegria',
    intensity: 5,
    description: '',
    tags: [],
    location: '',
    weather: '',
    triggers: [],
    notes: '',
  });
  const [tagInput, setTagInput] = useState('');
  const [triggerInput, setTriggerInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await emotionService.createEmotion(formData);
      navigate('/emotions');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to create emotion');
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(t => t !== tag) || [],
    });
  };

  const addTrigger = () => {
    if (triggerInput.trim() && !formData.triggers?.includes(triggerInput.trim())) {
      setFormData({
        ...formData,
        triggers: [...(formData.triggers || []), triggerInput.trim()],
      });
      setTriggerInput('');
    }
  };

  const removeTrigger = (trigger: string) => {
    setFormData({
      ...formData,
      triggers: formData.triggers?.filter(t => t !== trigger) || [],
    });
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Heart className="w-8 h-8 text-primary-600 mr-3" />
            Add New Emotion
          </h1>
          <p className="text-gray-600 mt-2">Record how you're feeling right now</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emotion Type *
              </label>
              <div className="grid grid-cols-5 gap-2">
                {EMOTION_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, type })}
                    className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                      formData.type === type
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="intensity" className="block text-sm font-medium text-gray-700 mb-2">
                Intensity: {formData.intensity}/10 *
              </label>
              <input
                id="intensity"
                type="range"
                min="1"
                max="10"
                value={formData.intensity}
                onChange={(e) => setFormData({ ...formData, intensity: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Mild</span>
                <span>Moderate</span>
                <span>Intense</span>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input min-h-[100px]"
                placeholder="Describe what you're feeling and why..."
                required
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location (optional)
              </label>
              <input
                id="location"
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="input"
                placeholder="Where are you?"
              />
            </div>

            <div>
              <label htmlFor="weather" className="block text-sm font-medium text-gray-700 mb-2">
                Weather (optional)
              </label>
              <input
                id="weather"
                type="text"
                value={formData.weather}
                onChange={(e) => setFormData({ ...formData, weather: e.target.value })}
                className="input"
                placeholder="Sunny, rainy, cloudy..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (optional)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="input flex-1"
                  placeholder="Add a tag and press Enter"
                />
                <button type="button" onClick={addTag} className="btn btn-secondary">
                  Add
                </button>
              </div>
              {formData.tags && formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm flex items-center"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-primary-600 hover:text-primary-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Triggers (optional)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={triggerInput}
                  onChange={(e) => setTriggerInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTrigger())}
                  className="input flex-1"
                  placeholder="What triggered this emotion?"
                />
                <button type="button" onClick={addTrigger} className="btn btn-secondary">
                  Add
                </button>
              </div>
              {formData.triggers && formData.triggers.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.triggers.map((trigger) => (
                    <span
                      key={trigger}
                      className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm flex items-center"
                    >
                      {trigger}
                      <button
                        type="button"
                        onClick={() => removeTrigger(trigger)}
                        className="ml-2 text-yellow-600 hover:text-yellow-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (optional)
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="input min-h-[80px]"
                placeholder="Any additional thoughts..."
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary flex-1"
              >
                {loading ? 'Saving...' : 'Save Emotion'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/emotions')}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};
