import React, { useState, useEffect, useRef } from 'react';
import { Package, Award, Search, Sparkles } from 'lucide-react';


const AnimatedNumber = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const startTime = useRef(null);
  const startValue = useRef(0);

  useEffect(() => {
    startValue.current = displayValue;
    startTime.current = Date.now();
    
    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime.current;
      const duration = 2000;
      
      if (elapsed < duration) {
        const progress = elapsed / duration;
        const easeOutProgress = 1 - Math.pow(1 - progress, 3);
        const nextValue = startValue.current + (value - startValue.current) * easeOutProgress;
        setDisplayValue(nextValue);
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };
    
    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [value, displayValue]);

  return displayValue.toFixed(1);
};


const AnimatedProgressBar = ({ value, color }) => {
  const [width, setWidth] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    setWidth(0);
    const timer = setTimeout(() => setWidth(value), 300);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="w-full bg-gray-100/80 backdrop-blur-sm rounded-full h-2.5 overflow-hidden">
      <div 
        className={`h-2.5 rounded-full transition-all duration-2000 ease-out shadow-sm ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          width: `${width}%`,
          ...color,
          transitionDuration: '2s'
        }}
      />
    </div>
  );
};

const ProductCard = ({ rank, product, animationDelay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), animationDelay);
    return () => clearTimeout(timer);
  }, [animationDelay]);

  const medalColors = {
    0: 'text-yellow-500',
    1: 'text-gray-400',
    2: 'text-amber-700'
  };

  const progressColors = {
    0: {
      background: 'linear-gradient(90deg, #8B5CF6 0%, #A78BFA 100%)'
    },
    1: {
      background: 'linear-gradient(90deg, #EC4899 0%, #F472B6 100%)'
    },
    2: {
      background: 'linear-gradient(90deg, #3B82F6 0%, #60A5FA 100%)'
    }
  };

  const tagColors = {
    0: {
      background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)',
      color: '#7C3AED'
    },
    1: {
      background: 'linear-gradient(135deg, #FCE7F3 0%, #FDF2F8 100%)',
      color: '#DB2777'
    },
    2: {
      background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
      color: '#2563EB'
    }
  };

  return (
    <div 
      className={`transform transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl 
        transition-all duration-500 border border-gray-100/50">
        <div className="p-6 relative overflow-hidden">
         
          <div 
            className={`absolute top-0 right-0 w-32 h-32 opacity-5 transform rotate-45 transition-transform duration-700
              ${isHovered ? 'scale-125' : 'scale-100'}`}
            style={{
              background: progressColors[rank].background
            }}
          />
          
          <div className="flex items-start space-x-4">
          
            <div className={`w-16 h-16 rounded-xl bg-gray-50/80 flex items-center justify-center relative
              transition-transform duration-500 ${isHovered ? 'scale-105' : ''}`}
            >
              <Package 
             className={`transition-all duration-500 ${isHovered ? 'scale-110 rotate-12' : ''}`}
               style={{
               stroke: rank === 0 ? '#8B5CF6' : rank === 1 ? '#EC4899' : '#3B82F6'
               }}
               size={32}
               />
            </div>
            
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Award 
                    className={`${medalColors[rank]} transform transition-all duration-500
                      ${isHovered ? 'scale-110 rotate-12' : ''}`}
                    size={24}
                  />
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    {product.product_name}
                    {rank === 0 && (
                      <Sparkles 
                        className={`text-yellow-500 transition-all duration-500
                          ${isHovered ? 'scale-110' : ''}`}
                        size={16}
                      />
                    )}
                  </h3>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Purchase Probability</span>
                  <span className="transition-all duration-500">
                    <AnimatedNumber value={product.accuracy  * 100} />%
                  </span>
                </div>
                <AnimatedProgressBar 
                  value={product.accuracy * 100}
                  color={progressColors[rank]}
                />
              </div>

              <div className="pt-1">
                <span 
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                    transition-all duration-500 ${isHovered ? 'shadow-md scale-105' : ''}`}
                  style={tagColors[rank]}
                >
                  ID: {product.product_id}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductRecommendationSystem = () => {
  const [userId, setUserId] = useState('');
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecommendations = async () => {
    if (!userId.trim()) return;
    setLoading(true);
    setError(null);
    setRecommendations(null);

    try {
      const response = await fetch(
        `https://g9814ri6dc.execute-api.ap-southeast-2.amazonaws.com/dev/predictions?user_id=${userId}`
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      const parsedData = Array.isArray(data) ? data : [];

      if (!Array.isArray(parsedData) || parsedData.length === 0) {
        throw new Error('No recommendations found for this user.');
      }

      setRecommendations(parsedData);
    } catch (err) {
      setError(err.message || 'Failed to fetch recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header section */}
        <div className="text-center mb-24">
          <h1 className="text-4xl font-bold tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            Product Recommendations
          </h1>
          <p className="text-lg text-gray-600 font-medium">
            Get personalized product suggestions
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-12 relative overflow-hidden group">
          {/* Decorative elements */}
          <div className="absolute inset-0 opacity-5 bg-gradient-to-r from-purple-500 to-pink-500 transition-opacity duration-300 group-hover:opacity-10" />
          
          <div className="space-y-4 relative">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter user ID..."
                className="w-full pl-10 py-2.5 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none text-lg bg-white/50 backdrop-blur-sm"
              />
            </div>
            <button
              onClick={fetchRecommendations}
              disabled={loading || !userId.trim()}
              className={`w-full px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium text-lg
                ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:from-purple-600 hover:to-pink-600'}
                transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg
                focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 relative overflow-hidden`}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? 'Searching...' : 'Get Recommendations'}
                {!loading && <Sparkles size={16} />}
              </span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-600 text-center bg-red-50/80 backdrop-blur-sm p-4 rounded-xl mb-8 border border-red-100">
            {error}
          </div>
        )}

        {/* Results */}
        {recommendations && (
          <div className="space-y-6">
            {recommendations.map((product, index) => (
              <ProductCard 
                key={product.product_id}
                rank={index}
                product={product}
                animationDelay={index * 200}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductRecommendationSystem;