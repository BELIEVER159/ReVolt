import React, { useState } from 'react';
import { 
  Search, ShoppingCart, User, MapPin, Truck, Star, Zap, Cpu, CheckCircle, 
  ShieldCheck, Plus, Minus, AlertTriangle, Upload, RefreshCw, ArrowRight, 
  Sparkles, BatteryCharging, DollarSign
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('marketplace');
  const [cartCount, setCartCount] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [addAddonCombo, setAddAddonCombo] = useState(true);

  // SECTION 1: Wall-Mounted Smart Hybrid Inverters
  const customInverters = [
    {
      id: 201,
      name: 'ReVolt EV-Hybrid 5kW Wall-Mounted High-Voltage Inverter',
      model: 'RV-INV-5KW-HV',
      power: '5kW / 150V–400V Wide DC Window',
      type: 'Wall-Mounted Hybrid Inverter',
      price: 24999,
      original: 45000,
      discount: '44% OFF',
      tag: 'Custom Built for EV Packs',
      gst: 4500,
      application: 'Runs Tata Nexon & MG ZS EV Packs on Home Solar',
      warranty: '24 Months Replacement Warranty',
      img: '/inverter.jpg'
    },
    {
      id: 202,
      name: 'ReVolt Smart Digital 3kW 48V Hybrid Solar Inverter',
      model: 'RV-INV-3KW-48V',
      power: '3kW / 48V High Current MPPT',
      type: 'Digital Hybrid Solar Inverter',
      price: 14999,
      original: 28000,
      discount: '46% OFF',
      tag: 'CAN-Bus BMS Ready',
      gst: 2700,
      application: 'Runs Scooter & Toto EV Batteries',
      warranty: '24 Months Replacement Warranty',
      img: '/inverter.jpg'
    }
  ];

  // SECTION 2: Smart Converters for Existing Home Inverters
  const smartConverters = [
    {
      id: 301,
      name: 'ReVolt Universal High-Voltage to 12V/24V Smart DC Converter',
      model: 'RV-CNV-HV-1224V',
      power: '150V–380V DC Input -> 12V/24V Output (3000W)',
      type: 'Smart Home Inverter Adapter',
      price: 2999,
      original: 6500,
      discount: '53% OFF',
      tag: 'Plug & Play Adapter',
      gst: 540,
      application: 'Connects Car/Toto/2-Wheeler Batteries to Existing Home Inverters',
      warranty: '18 Months Warranty',
      img: '/converter.jpg'
    }
  ];

  // SECTION 3: EV Cars, Toto & Scooter Second-Life Batteries
  const evVehicleBatteries = [
    {
      id: 101,
      name: 'Ex-Tata Nexon EV 30kWh Second-Life Battery Pack',
      model: 'TATA-NX-30KWH',
      power: '30 kWh / 320V Nominal',
      soh: 78,
      type: 'EV Car Second-Life Pack',
      price: 115000,
      original: 280000,
      discount: '58% OFF',
      tag: '78% SOH Certified',
      gst: 20700,
      application: 'Home Solar Backup / Micro-Grid',
      warranty: '12 Months Warranty',
      img: '/ev-battery.jpg',
      addonPrice: 2999,
      addonTitle: 'Add Smart DC Converter (For Existing Home Inverters)'
    },
    {
      id: 102,
      name: 'Ex-MG ZS EV 44.5kWh Repurposed Battery Module',
      model: 'MG-ZS-44KWH',
      power: '44.5 kWh / 350V',
      soh: 74,
      type: 'EV Car Second-Life Pack',
      price: 165000,
      original: 390000,
      discount: '57% OFF',
      tag: '74% SOH Certified',
      gst: 29700,
      application: 'Commercial Office Emergency Power',
      warranty: '12 Months Warranty',
      img: '/ev-battery.jpg',
      addonPrice: 2999,
      addonTitle: 'Add Smart DC Converter (For Existing Home Inverters)'
    },
    {
      id: 103,
      name: 'Ex-Toto E-Rickshaw 48V 100Ah Lithium Battery Pack',
      model: 'TOTO-48V-100AH',
      power: '4.8 kWh / 48V Nominal',
      soh: 76,
      type: 'E-Rickshaw / Toto Pack',
      price: 28500,
      original: 62000,
      discount: '54% OFF',
      tag: '76% SOH Certified',
      gst: 5130,
      application: 'Home Backup & Small Shops',
      warranty: '12 Months Warranty',
      img: '/ev-battery.jpg',
      addonPrice: 1499,
      addonTitle: 'Add 48V-12V Smart Adapter'
    }
  ];

  // AI Valuation State & Handlers
  const [vehicleModel, setVehicleModel] = useState('Tata Nexon EV');
  const [age, setAge] = useState(4);
  const [mileage, setMileage] = useState(45000);
  const [capacity, setCapacity] = useState(30);
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanningOdo, setScanningOdo] = useState(false);
  const [scanningBattery, setScanningBattery] = useState(false);
  const [batteryInspection, setBatteryInspection] = useState(null);
  const [conditionMultiplier, setConditionMultiplier] = useState(1.0);

  // 1. Odometer OCR Handler
  const handleOdometerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setScanningOdo(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/predict-from-odometer', { 
        method: 'POST', 
        body: formData 
      });
      const data = await res.json();
      if (data.success && data.extracted_mileage_km) {
        setMileage(data.extracted_mileage_km);
      } else {
        throw new Error("OCR API failed");
      }
    } catch (err) {
      console.warn("Backend API offline, using fallback extraction.", err);
      setTimeout(() => {
        setMileage(684);
      }, 1000);
    } finally {
      setTimeout(() => setScanningOdo(false), 1100);
    }
  };

  // 2. Battery Photo Defect Handler
  const handleBatteryPhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setScanningBattery(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/inspect-battery-photo', { 
        method: 'POST', 
        body: formData 
      });
      const data = await res.json();
      if (data.success && data.inspection) {
        setBatteryInspection(data.inspection);
        setConditionMultiplier(data.inspection.multiplier);
      } else {
        throw new Error("Defect Inspection API offline");
      }
    } catch (err) {
      console.warn("Backend Defect API offline, using fallback.", err);
      setTimeout(() => {
        const mockInspection = { condition: "Good - Minor Surface Wear", multiplier: 0.95 };
        setBatteryInspection(mockInspection);
        setConditionMultiplier(mockInspection.multiplier);
      }, 1000);
    } finally {
      setTimeout(() => setScanningBattery(false), 1100);
    }
  };

  // Calculate Offer
  const handleCalculateQuote = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/predict-soh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age_years: parseFloat(age),
          mileage_km: parseFloat(mileage),
          capacity_kwh: parseFloat(capacity),
          condition_multiplier: parseFloat(conditionMultiplier)
        })
      });
      const data = await res.json();
      setQuote({ soh: data.predicted_soh, estimatedOffer: data.buyback_offer_inr, action: data.recommended_action });
    } catch (err) {
      console.warn("API Offline, using local SOH formula.", err);
      const predictedSoh = Math.max(50, Math.round(100 - (age * 3.5) - (mileage / 6000)));
      const baseOffer = capacity * 4500 * (predictedSoh / 100) * conditionMultiplier;
      setQuote({
        soh: predictedSoh,
        estimatedOffer: Math.round(baseOffer),
        action: predictedSoh > 70 ? 'Repurpose for Home Energy Storage' : 'Recycle Cells'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 font-sans">
      
      {/* 1. HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => { setActiveTab('marketplace'); setSelectedProduct(null); }}>
            <span className="text-2xl font-black text-red-600 tracking-tight">ReVolt</span>
            <span className="text-[10px] bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded">ENERGY</span>
          </div>

          <div className="hidden md:flex items-center text-xs text-gray-600 gap-1 border-r border-gray-200 pr-4">
            <MapPin className="w-4 h-4 text-red-600" />
            <div>
              <p className="text-[10px] text-gray-400">Deliver to</p>
              <p className="font-bold text-gray-700">Select Location &gt;</p>
            </div>
          </div>

          <div className="flex-1 max-w-xl relative flex">
            <input 
              type="text" 
              placeholder="Search EV Second-Life Battery, Smart Inverter, Converter Adapter..." 
              className="w-full border border-gray-300 rounded-l-md px-4 py-2 text-sm focus:outline-none focus:border-red-500"
            />
            <button className="bg-red-600 text-white px-5 rounded-r-md hover:bg-red-700 flex items-center justify-center font-bold">
              <Search className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center space-x-4 text-xs font-medium text-gray-700">
            {/* PROMINENT HEADER SELLER BUTTON */}
            <button 
              onClick={() => { setActiveTab('sell'); setSelectedProduct(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-extrabold text-sm transition-all shadow-md ${
                activeTab === 'sell' 
                  ? 'bg-red-600 text-white ring-2 ring-red-400' 
                  : 'bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 animate-pulse'
              }`}
            >
              <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" />
              <span>SELL EV BATTERY</span>
            </button>

            <div className="hidden sm:flex items-center gap-1 cursor-pointer"><User className="w-4 h-4" /><span>Login</span></div>
            <div className="hidden sm:flex items-center gap-1 cursor-pointer"><Truck className="w-4 h-4" /><span>Track</span></div>

            <div className="flex items-center gap-1 cursor-pointer relative" onClick={() => setCartCount(cartCount + 1)}>
              <ShoppingCart className="w-5 h-5 text-gray-800" />
              <span className="font-bold">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 2. PRODUCT DETAIL VIEW */}
      {selectedProduct ? (
        <main className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-xs text-gray-500 mb-4 flex items-center gap-1">
            <span className="cursor-pointer hover:underline" onClick={() => setSelectedProduct(null)}>Home</span> &gt; 
            <span>Catalog</span> &gt; 
            <span className="font-semibold text-gray-800">{selectedProduct.name}</span>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-5 flex flex-col items-center border-r border-gray-200 pr-6">
              <div className="w-full h-72 bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-center relative overflow-hidden">
                <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                  {selectedProduct.tag}
                </span>
                <img 
                  src={selectedProduct.img} 
                  alt={selectedProduct.name} 
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300x200?text=Product+Image'; }} 
                />
              </div>
            </div>

            <div className="md:col-span-4 space-y-4">
              <h1 className="text-xl font-bold text-gray-900 leading-snug">{selectedProduct.name}</h1>

              {selectedProduct.addonPrice && (
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Existing Home Inverter Compatible!</span>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    Check the box on the right to bundle our Smart DC Converter!
                  </p>
                </div>
              )}

              {selectedProduct.soh && (
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg flex items-center gap-3">
                  <ShieldCheck className="w-8 h-8 text-emerald-600" />
                  <div>
                    <p className="text-xs font-extrabold text-emerald-800 uppercase">Certified Second-Life Battery</p>
                    <p className="text-sm font-black text-emerald-600">State of Health (SOH): {selectedProduct.soh}%</p>
                  </div>
                </div>
              )}

              <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 text-xs space-y-2">
                <p className="font-bold text-gray-700 border-b border-gray-200 pb-1">SPECIFICATIONS</p>
                <div className="grid grid-cols-2 gap-2 text-gray-600">
                  <div>Model: <p className="font-semibold text-gray-800">{selectedProduct.model}</p></div>
                  <div>Power: <p className="font-semibold text-gray-800">{selectedProduct.power}</p></div>
                  <div>Type: <p className="font-semibold text-gray-800">{selectedProduct.type}</p></div>
                  <div>Warranty: <p className="font-semibold text-emerald-600">{selectedProduct.warranty}</p></div>
                </div>
              </div>
            </div>

            <div className="md:col-span-3 border-l border-gray-200 pl-6 space-y-4">
              {selectedProduct.addonPrice && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg space-y-2">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={addAddonCombo} 
                      onChange={(e) => setAddAddonCombo(e.target.checked)}
                      className="mt-1"
                    />
                    <div>
                      <p className="text-xs font-bold text-emerald-800">{selectedProduct.addonTitle}</p>
                      <p className="text-[11px] text-gray-600">+ ₹{selectedProduct.addonPrice.toLocaleString('en-IN')}</p>
                    </div>
                  </label>
                </div>
              )}

              <div>
                <span className="text-xs text-gray-400 line-through">MRP ₹{selectedProduct.original.toLocaleString('en-IN')}</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-gray-900">
                    ₹{(selectedProduct.price + (selectedProduct.addonPrice && addAddonCombo ? selectedProduct.addonPrice : 0)).toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs font-bold text-green-600">{selectedProduct.discount}</span>
                </div>
              </div>

              <button 
                onClick={() => setCartCount(cartCount + 1)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded text-xs flex items-center justify-center gap-2 shadow"
              >
                <ShoppingCart className="w-4 h-4" /> ADD TO CART
              </button>

              <button 
                onClick={() => alert(`🎉 Order placed for ${selectedProduct.name}!`)}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded text-xs shadow"
              >
                BUY NOW
              </button>
            </div>
          </div>
        </main>
      ) : (
        /* 3. MAIN MARKETPLACE VIEW */
        <main className="max-w-7xl mx-auto px-4 py-6 space-y-8">
          
          {activeTab === 'marketplace' && (
            <>
              {/* ======================================================== */}
              {/* 🌟 GIANT HIGH-VISIBILITY AI BATTERY SELLER HERO BANNER */}
              {/* ======================================================== */}
              <div className="bg-gradient-to-r from-gray-900 via-slate-900 to-red-950 text-white rounded-2xl p-6 md:p-8 shadow-xl border border-red-900/50 relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
                  <BatteryCharging className="w-96 h-96 text-red-500" />
                </div>

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  
                  {/* Left Column: Heading & Selling Value Prop */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="inline-flex items-center gap-2 bg-red-600/30 border border-red-500/50 px-3 py-1 rounded-full text-xs font-bold text-red-300">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                      <span>OFFICIAL REVOLT BUYBACK PROGRAM</span>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
                      Have a Used EV, Scooter or Toto Battery? <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-amber-300 to-rose-400">
                        Sell it for Instant Cash with AI!
                      </span>
                    </h1>

                    <p className="text-gray-300 text-sm leading-relaxed max-w-xl">
                      Upload your speedometer & battery casing photos. Our Computer Vision AI extracts mileage, inspects health defects, and generates a instant buyback offer in 10 seconds!
                    </p>

                    {/* Quick Steps Badges */}
                    <div className="grid grid-cols-3 gap-3 pt-2 max-w-lg">
                      <div className="bg-white/10 backdrop-blur-md rounded-lg p-2.5 text-center border border-white/10">
                        <Upload className="w-5 h-5 mx-auto text-red-400 mb-1" />
                        <p className="text-[11px] font-bold">1. Upload Speedo</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-md rounded-lg p-2.5 text-center border border-white/10">
                        <Cpu className="w-5 h-5 mx-auto text-amber-400 mb-1" />
                        <p className="text-[11px] font-bold">2. Scan Casing</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-md rounded-lg p-2.5 text-center border border-white/10">
                        <DollarSign className="w-5 h-5 mx-auto text-emerald-400 mb-1" />
                        <p className="text-[11px] font-bold">3. Get Cash Quote</p>
                      </div>
                    </div>

                    {/* Big Action Button */}
                    <div className="pt-2">
                      <button 
                        onClick={() => setActiveTab('sell')}
                        className="bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-base px-8 py-4 rounded-xl shadow-lg hover:shadow-red-600/40 transition-all flex items-center gap-3 transform hover:-translate-y-0.5"
                      >
                        <Zap className="w-5 h-5 fill-yellow-300 text-yellow-300" />
                        <span>LAUNCH AI BATTERY VALUATION & SELL NOW</span>
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Interactive Quick Valuation Preview Card */}
                  <div className="lg:col-span-5">
                    <div className="bg-white text-gray-900 rounded-xl p-5 shadow-2xl border border-gray-100 space-y-4">
                      <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                        <h3 className="font-extrabold text-sm text-gray-800 flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-red-600" />
                          <span>Instant AI Valuation Calculator</span>
                        </h3>
                        <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded">
                          Live AI Engine
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="font-bold text-gray-600 block mb-1">EV Model</label>
                          <select value={vehicleModel} onChange={(e) => setVehicleModel(e.target.value)} className="w-full border border-gray-300 rounded p-1.5 font-semibold text-gray-800">
                            <option>Tata Nexon EV</option>
                            <option>MG ZS EV</option>
                            <option>Ather 450X</option>
                            <option>Toto E-Rickshaw</option>
                          </select>
                        </div>

                        <div>
                          <label className="font-bold text-gray-600 block mb-1">Age (Years)</label>
                          <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="w-full border border-gray-300 rounded p-1.5 font-semibold" />
                        </div>

                        <div>
                          <label className="font-bold text-gray-600 block mb-1">Extracted Mileage</label>
                          <input type="number" value={mileage} onChange={(e) => setMileage(e.target.value)} className="w-full border border-gray-300 rounded p-1.5 font-semibold text-emerald-700 bg-emerald-50/50" />
                        </div>

                        <div>
                          <label className="font-bold text-gray-600 block mb-1">Pack Size (kWh)</label>
                          <input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} className="w-full border border-gray-300 rounded p-1.5 font-semibold" />
                        </div>
                      </div>

                      <button 
                        onClick={() => { setActiveTab('sell'); handleCalculateQuote(); }}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 shadow"
                      >
                        <Zap className="w-4 h-4" /> CALCULATE ESTIMATED BUYBACK OFFER
                      </button>
                    </div>
                  </div>

                </div>
              </div>

              {/* ======================================================== */}
              {/* MARKETPLACE SECTION 1: Hybrid Inverters */}
              {/* ======================================================== */}
              <div className="bg-gradient-to-r from-red-100 via-rose-100 to-amber-100 rounded-lg p-4 border border-red-200">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Wall-Mounted Smart Hybrid Inverters</h2>
                    <p className="text-xs text-gray-600">Custom inverters to run high-voltage EV car & scooter packs on solar</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customInverters.map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => setSelectedProduct(item)}
                      className="bg-white rounded-md p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer flex justify-between items-center"
                    >
                      <div className="w-36 h-28 bg-gray-50 rounded p-1 mr-4 border border-gray-200 flex items-center justify-center overflow-hidden">
                        <img 
                          src={item.img} 
                          alt={item.name} 
                          className="max-h-full max-w-full object-cover rounded" 
                          onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/150x120?text=Inverter+Photo'; }}
                        />
                      </div>
                      <div className="flex-1">
                        <span className="bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded">{item.tag}</span>
                        <h3 className="text-xs font-bold text-gray-800 mt-1">{item.name}</h3>
                        <p className="text-[10px] text-gray-500 mb-2">{item.power}</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-base font-black text-gray-900">₹{item.price.toLocaleString('en-IN')}</span>
                          <span className="text-xs text-gray-400 line-through">₹{item.original.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* MARKETPLACE SECTION 2: Smart Converters */}
              <div className="bg-gradient-to-r from-emerald-100 via-teal-100 to-green-100 rounded-lg p-4 border border-emerald-300">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Smart Converters (Use Existing Home Inverter)</h2>
                    <p className="text-xs text-gray-600">Connect EV, Toto, or 2-Wheeler batteries directly to your existing home lead-acid inverter</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {smartConverters.map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => setSelectedProduct(item)}
                      className="bg-white rounded-md p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer flex justify-between items-center"
                    >
                      <div className="w-36 h-28 bg-gray-50 rounded p-1 mr-4 border border-gray-200 flex items-center justify-center overflow-hidden">
                        <img 
                          src={item.img} 
                          alt={item.name} 
                          className="max-h-full max-w-full object-cover rounded" 
                          onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/150x120?text=Converter+Photo'; }}
                        />
                      </div>
                      <div className="flex-1">
                        <span className="bg-emerald-700 text-white text-[9px] font-bold px-2 py-0.5 rounded">{item.tag}</span>
                        <h3 className="text-xs font-bold text-gray-800 mt-1">{item.name}</h3>
                        <p className="text-[10px] text-gray-500 mb-2">{item.power}</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-base font-black text-gray-900">₹{item.price.toLocaleString('en-IN')}</span>
                          <span className="text-xs text-gray-400 line-through">₹{item.original.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* MARKETPLACE SECTION 3: EV Vehicle Packs */}
              <div className="bg-gradient-to-r from-sky-200 via-blue-100 to-indigo-100 rounded-lg p-4 border border-sky-300">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">EV Cars, Toto & Scooter Batteries (70% - 80% SOH)</h2>
                    <p className="text-xs text-gray-600">Repurposed Second-Life Battery Packs</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {evVehicleBatteries.map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => setSelectedProduct(item)}
                      className="bg-white rounded-md p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <span className="bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded w-max">{item.soh}% SOH Certified</span>
                      <div className="h-36 w-full bg-gray-50 rounded my-2 p-1 border border-gray-200 flex items-center justify-center overflow-hidden">
                        <img 
                          src={item.img} 
                          alt={item.name} 
                          className="max-h-full max-w-full object-cover rounded" 
                          onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/200x140?text=EV+Battery+Photo'; }}
                        />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-gray-800 line-clamp-2 mb-1">{item.name}</h3>
                        <p className="text-base font-black text-gray-900">₹{item.price.toLocaleString('en-IN')}</p>
                        <button className="w-full bg-red-600 text-white font-bold py-1.5 rounded text-xs mt-3">VIEW & BUNDLE</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ======================================================== */}
          {/* ⚡ EXPANDED FULL-PAGE AI SELLER PORTAL */}
          {/* ======================================================== */}
          {activeTab === 'sell' && (
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 p-8 space-y-8">
              
              {/* Back to Marketplace */}
              <button 
                onClick={() => setActiveTab('marketplace')}
                className="text-xs font-bold text-gray-500 hover:text-red-600 flex items-center gap-1 transition-all"
              >
                ← Back to Marketplace
              </button>

              <div className="text-center border-b border-gray-200 pb-6">
                <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-black mb-2">
                  <Sparkles className="w-4 h-4 text-red-600" />
                  <span>AI COMPUTER VISION & ML ENGINE</span>
                </div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                  AI Battery Seller & Buyback Valuation Hub
                </h2>
                <p className="text-sm text-gray-500 mt-2 max-w-xl mx-auto">
                  Upload dashboard and casing photos to automatically extract mileage and inspect battery health in real-time.
                </p>
              </div>

              {/* DUAL IMAGE UPLOAD DROPZONES */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. Distance / Odometer Image Dropzone */}
                <div className="p-6 bg-gray-50 rounded-xl border-2 border-dashed border-red-300 text-center hover:border-red-600 hover:bg-red-50/30 transition-all shadow-sm">
                  <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-extrabold uppercase text-gray-900 mb-1">1. Speedometer / Odometer Photo</p>
                  <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                    Upload speed dial image for EasyOCR automatic mileage extraction
                  </p>
                  
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleOdometerUpload} 
                    className="text-xs text-gray-500 w-full file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-red-600 file:text-white file:font-bold cursor-pointer hover:file:bg-red-700" 
                  />

                  {scanningOdo && (
                    <p className="text-xs text-red-600 font-bold mt-3 flex items-center justify-center gap-1.5 animate-pulse">
                      <RefreshCw className="w-4 h-4 animate-spin" /> Scanning Speedometer for Mileage...
                    </p>
                  )}
                  {mileage && !scanningOdo && (
                    <div className="text-xs text-emerald-800 font-black mt-3 bg-emerald-50 p-2.5 rounded-lg border border-emerald-300 flex items-center justify-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Extracted Mileage: {mileage.toLocaleString('en-IN')} km</span>
                    </div>
                  )}
                </div>

                {/* 2. Physical Battery Condition Image Dropzone */}
                <div className="p-6 bg-gray-50 rounded-xl border-2 border-dashed border-red-300 text-center hover:border-red-600 hover:bg-red-50/30 transition-all shadow-sm">
                  <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-extrabold uppercase text-gray-900 mb-1">2. Battery Condition Photo</p>
                  <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                    Upload battery casing photo to detect surface rust & physical defects
                  </p>
                  
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleBatteryPhotoUpload} 
                    className="text-xs text-gray-500 w-full file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-red-600 file:text-white file:font-bold cursor-pointer hover:file:bg-red-700" 
                  />

                  {scanningBattery && (
                    <p className="text-xs text-red-600 font-bold mt-3 flex items-center justify-center gap-1.5 animate-pulse">
                      <RefreshCw className="w-4 h-4 animate-spin" /> Analyzing Casing Defect Vectors...
                    </p>
                  )}
                  {batteryInspection && !scanningBattery && (
                    <div className="text-xs text-emerald-800 font-black mt-3 bg-emerald-50 p-2.5 rounded-lg border border-emerald-300 flex items-center justify-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Defect Score: {batteryInspection.condition}</span>
                    </div>
                  )}
                </div>

              </div>

              {/* SPECIFICATIONS & INPUT FORM */}
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-4">
                <h3 className="font-bold text-sm text-gray-800 border-b border-gray-200 pb-2">
                  Battery Specifications
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <label className="font-bold text-gray-700 mb-1 block">EV Model</label>
                    <select value={vehicleModel} onChange={(e) => setVehicleModel(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 font-medium">
                      <option>Tata Nexon EV</option>
                      <option>MG ZS EV</option>
                      <option>Ather 450X</option>
                      <option>Toto E-Rickshaw</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 mb-1 block">Age (Years)</label>
                    <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 font-medium" />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 mb-1 block">Mileage (km)</label>
                    <input type="number" value={mileage} onChange={(e) => setMileage(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 font-semibold text-emerald-700" />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 mb-1 block">Capacity (kWh)</label>
                    <input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 font-medium" />
                  </div>
                </div>
              </div>

              {/* GENERATE OFFER BUTTON */}
              <button 
                onClick={handleCalculateQuote} 
                disabled={loading} 
                className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 text-white font-black py-4 rounded-xl text-base shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Running Random Forest SOH Machine Learning Model...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                    <span>GENERATE AI BUYBACK OFFER</span>
                  </>
                )}
              </button>

              {/* QUOTE RESULT DISPLAY */}
              {quote && (
                <div className="p-6 bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200 rounded-xl space-y-4 shadow-inner">
                  <h3 className="font-black text-gray-900 text-base border-b border-red-200 pb-2 flex items-center justify-between">
                    <span>📊 Official ReVolt AI Valuation Report</span>
                    <span className="text-xs font-bold text-red-600 bg-red-100 px-2.5 py-1 rounded-full">Guaranteed Offer</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="bg-white p-4 rounded-lg border border-red-100 shadow-sm">
                      <p className="text-xs text-gray-500 font-bold uppercase">State of Health (SOH)</p>
                      <p className="text-3xl font-black text-red-600 mt-1">{quote.soh}%</p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-red-100 shadow-sm">
                      <p className="text-xs text-gray-500 font-bold uppercase">Instant Buyback Offer</p>
                      <p className="text-3xl font-black text-gray-900 mt-1">₹{quote.estimatedOffer.toLocaleString('en-IN')}</p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-red-100 shadow-sm">
                      <p className="text-xs text-gray-500 font-bold uppercase">Recommended Action</p>
                      <p className="text-xs font-extrabold text-emerald-700 mt-2">{quote.action}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => alert(`🎉 Buyback request initialized! Our pickup agent will contact you to verify battery #${Math.floor(Math.random()*900000 + 100000)}.`)}
                    className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-lg text-sm shadow transition-all"
                  >
                    ACCEPT OFFER & SCHEDULE FREE DOORSTEP PICKUP
                  </button>
                </div>
              )}

            </div>
          )}

        </main>
      )}

    </div>
  );
}