import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, Users, MousePointer } from 'lucide-react';
// Mock data for cities
const cities = [
  {
    id: 1,
    name: 'New York',
    x: 28,
    y: 35,
    visitors: '12.5K',
    conversion: '8.2%',
    trend: '+5%',
    status: 'growth'
  },
  {
    id: 2,
    name: 'London',
    x: 48,
    y: 28,
    visitors: '8.2K',
    conversion: '9.1%',
    trend: '+8%',
    status: 'growth'
  },
  {
    id: 3,
    name: 'Berlin',
    x: 52,
    y: 26,
    visitors: '4.8K',
    conversion: '10.2%',
    trend: '+25%',
    status: 'high'
  },
  {
    id: 4,
    name: 'Dhaka',
    x: 72,
    y: 42,
    visitors: '15.2K',
    conversion: '12.4%',
    trend: '+15%',
    status: 'high'
  },
  {
    id: 5,
    name: 'Tokyo',
    x: 85,
    y: 38,
    visitors: '6.5K',
    conversion: '5.8%',
    trend: '-2%',
    status: 'warning'
  },
  {
    id: 6,
    name: 'Sydney',
    x: 88,
    y: 75,
    visitors: '3.2K',
    conversion: '6.8%',
    trend: '+12%',
    status: 'growth'
  },
  {
    id: 7,
    name: 'Sao Paulo',
    x: 32,
    y: 65,
    visitors: '2.1K',
    conversion: '4.5%',
    trend: '-5%',
    status: 'warning'
  },
  {
    id: 8,
    name: 'Toronto',
    x: 26,
    y: 32,
    visitors: '5.1K',
    conversion: '7.5%',
    trend: '-2%',
    status: 'warning'
  }];

interface InteractiveMapProps {
  cities?: any[];
}

export function InteractiveMap({ cities: propCities }: InteractiveMapProps) {
  const displayCities = propCities && propCities.length > 0 ? propCities.map((c, idx) => {
    const mockMatch = cities.find(m => m.name === c.name);
    return {
      ...mockMatch,
      id: idx,
      name: c.name,
      visitors: c.visitors.toLocaleString(),
      conversion: c.conversion || (mockMatch ? mockMatch.conversion : '0%'),
      trend: mockMatch ? mockMatch.trend : '+0%',
      status: c.visitors > 10000 ? 'high' : c.visitors > 5000 ? 'growth' : 'warning',
      x: mockMatch ? mockMatch.x : Math.random() * 80 + 10,
      y: mockMatch ? mockMatch.y : Math.random() * 60 + 20
    };
  }) : cities;

  const [selectedCity, setSelectedCity] = useState<(typeof displayCities)[0] | null>(
    null
  );
  const [hoveredCity, setHoveredCity] = useState<(typeof displayCities)[0] | null>(
    null
  );
  return (
    <div className="relative w-full aspect-[16/9] bg-[#0A0A0A] rounded-xl overflow-hidden border border-white/10 group">
      {/* World Map SVG Background */}
      <div className="absolute inset-0 opacity-20">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full fill-current text-[color:var(--deep-navy)]">

          {/* Simplified World Map Paths */}
          <path d="M20,30 Q25,25 35,30 T45,35 T55,30 T65,35 T75,30 T85,35 T95,30 V80 H5 V30 Z" />
          {/* This is a placeholder shape. In a real app, use a proper world map SVG path */}
          <path
            d="M10,35 Q15,30 20,35 T30,40 T40,35 T50,40 T60,35 T70,40 T80,35 T90,40 V70 H10 V35 Z"
            opacity="0.5" />

        </svg>
        <div
          className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')] bg-no-repeat bg-center bg-contain opacity-30 grayscale invert"
          style={{
            filter: 'brightness(0.5) sepia(1) hue-rotate(180deg) saturate(2)'
          }}>
        </div>
      </div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Cities */}
      {cities.map((city) =>
        <motion.button
          key={city.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 focus:outline-none group/city"
          style={{
            left: `${city.x}%`,
            top: `${city.y}%`
          }}
          onClick={() => setSelectedCity(city)}
          onMouseEnter={() => setHoveredCity(city)}
          onMouseLeave={() => setHoveredCity(null)}
          whileHover={{
            scale: 1.2
          }}>

          <div
            className={`relative w-3 h-3 rounded-full ${city.status === 'high' ? 'bg-[color:var(--bright-red)]' : city.status === 'growth' ? 'bg-[color:var(--vibrant-green)]' : 'bg-[color:var(--neon-yellow)]'}`}>

            <div
              className={`absolute inset-0 rounded-full animate-ping opacity-50 ${city.status === 'high' ? 'bg-[color:var(--bright-red)]' : city.status === 'growth' ? 'bg-[color:var(--vibrant-green)]' : 'bg-[color:var(--neon-yellow)]'}`} />

          </div>

          {/* Hover Tooltip */}
          <AnimatePresence>
            {hoveredCity?.id === city.id && !selectedCity &&
              <motion.div
                initial={{
                  opacity: 0,
                  y: 10
                }}
                animate={{
                  opacity: 1,
                  y: 0
                }}
                exit={{
                  opacity: 0,
                  y: 5
                }}
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 border border-white/10 rounded-lg whitespace-nowrap z-10 backdrop-blur-md">

                <div className="text-xs font-bold text-white mb-1">
                  {city.name}
                </div>
                <div className="flex items-center gap-3 text-[10px]">
                  <span className="text-gray-400">{city.visitors} visits</span>
                  <span
                    className={
                      city.status === 'high' ?
                        'text-[color:var(--bright-red)]' :
                        'text-[color:var(--vibrant-green)]'
                    }>

                    {city.conversion} CR
                  </span>
                </div>
              </motion.div>
            }
          </AnimatePresence>
        </motion.button>
      )}

      {/* Selected City Modal Overlay */}
      <AnimatePresence>
        {selectedCity &&
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9
            }}
            animate={{
              opacity: 1,
              scale: 1
            }}
            exit={{
              opacity: 0,
              scale: 0.9
            }}
            className="absolute right-4 top-4 w-64 bg-[#050505]/95 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl z-20">

            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <MapPin
                    size={16}
                    className="text-[color:var(--bright-red)]" />

                  {selectedCity.name}
                </h3>
                <p className="text-xs text-gray-400">Regional Analytics</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCity(null);
                }}
                className="text-gray-500 hover:text-white transition-colors">

                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                  <div className="text-[10px] text-gray-400 mb-1 flex items-center gap-1">
                    <Users size={10} /> Visitors
                  </div>
                  <div className="text-lg font-bold text-white">
                    {selectedCity.visitors}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                  <div className="text-[10px] text-gray-400 mb-1 flex items-center gap-1">
                    <MousePointer size={10} /> Conv. Rate
                  </div>
                  <div
                    className={`text-lg font-bold ${selectedCity.status === 'high' ? 'text-[color:var(--bright-red)]' : selectedCity.status === 'growth' ? 'text-[color:var(--vibrant-green)]' : 'text-[color:var(--neon-yellow)]'}`}>

                    {selectedCity.conversion}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-400">Growth Trend</span>
                  <span
                    className={`text-xs font-bold ${selectedCity.trend.startsWith('+') ? 'text-[color:var(--vibrant-green)]' : 'text-[color:var(--bright-red)]'}`}>

                    {selectedCity.trend}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{
                      width: 0
                    }}
                    animate={{
                      width: '75%'
                    }}
                    className={`h-full rounded-full ${selectedCity.trend.startsWith('+') ? 'bg-[color:var(--vibrant-green)]' : 'bg-[color:var(--bright-red)]'}`} />

                </div>
              </div>

              <button className="w-full py-2 rounded-lg bg-[color:var(--bright-red)]/10 text-[color:var(--bright-red)] text-xs font-bold hover:bg-[color:var(--bright-red)] hover:text-white transition-all">
                View Full Report
              </button>
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}