import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Car, Flame, ShoppingBag, Zap } from 'lucide-react';
import { saveProfileAndAnalysis, saveGeneratedQuests } from '../utils/storage';

const QUESTIONS = [
  {
    id: 'transport',
    section: 'Section A: Transportation',
    description: 'Help us understand your daily travel habits to calculate your environmental footprint.',
    fields: [
      {
        name: 'mode',
        label: 'Primary Mode of Transport',
        type: 'select',
        options: [
          { value: 'electric_car', label: 'Electric Vehicle (EV)' },
          { value: 'petrol_car', label: 'Petrol/Diesel Car' },
          { value: 'public_transit', label: 'Public Transit (Bus/Train)' },
          { value: 'bicycle_walk', label: 'Bicycle / Walk' },
          { value: 'motorbike', label: 'Motorbike/Scooter' }
        ],
        icon: Car
      },
      {
        name: 'distance',
        label: 'Daily Distance (km)',
        type: 'number',
        placeholder: 'e.g. 15',
        icon: Flame
      }
    ]
  },
  {
    id: 'food',
    section: 'Section B: Food Habits',
    description: 'Diet plays a massive role in environmental footprint. Let us know your eating style.',
    fields: [
      {
        name: 'diet',
        label: 'Dietary Preference',
        type: 'select',
        options: [
          { value: 'vegetarian', label: 'Vegetarian' },
          { value: 'vegan', label: 'Vegan (Strict Plant-Based)' },
          { value: 'mixed', label: 'Mixed (Some meat & veg)' },
          { value: 'heavy_meat', label: 'Non-vegetarian (Heavy meat)' }
        ],
        icon: Flame
      }
    ]
  },
  {
    id: 'energy',
    section: 'Section C: Home Energy Usage',
    description: 'Electricity and seasonal cooling/heating are prime sources of home emissions.',
    fields: [
      {
        name: 'ac_hours',
        label: 'AC Usage (Hours per day)',
        type: 'number',
        placeholder: 'e.g. 4',
        icon: Zap
      },
      {
        name: 'electricity_bill',
        label: 'Electricity Level',
        type: 'select',
        options: [
          { value: 'low', label: 'Low Usage / Solar energy' },
          { value: 'moderate', label: 'Standard/Moderate usage' },
          { value: 'high', label: 'High consumption (Large family/appliances)' }
        ],
        icon: Zap
      }
    ]
  },
  {
    id: 'shopping',
    section: 'Section D: Shopping & Consumption',
    description: 'Material consumption and shipping footprints add up quietly over time.',
    fields: [
      {
        name: 'online_shopping',
        label: 'Frequency of Online Shopping',
        type: 'select',
        options: [
          { value: 'rarely', label: 'Rarely (A few times a year)' },
          { value: 'monthly', label: 'Monthly (1-2 packages)' },
          { value: 'weekly', label: 'Weekly (Multiple packages)' }
        ],
        icon: ShoppingBag
      },
      {
        name: 'plastic_usage',
        label: 'Single-use Plastic Habits',
        type: 'select',
        options: [
          { value: 'zero', label: 'Zero waste (Bring own bags/bottles)' },
          { value: 'occasional', label: 'Occasional (Use plastic when convenient)' },
          { value: 'regular', label: 'Regular (Buy bottled water, plastic bags)' }
        ],
        icon: ShoppingBag
      }
    ]
  }
];

export default function Assessment() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    mode: 'public_transit',
    distance: '',
    diet: 'mixed',
    ac_hours: '',
    electricity_bill: 'moderate',
    online_shopping: 'monthly',
    plastic_usage: 'occasional'
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const currentQuestionnaire = QUESTIONS[step];

  const handleChange = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (step < QUESTIONS.length - 1) {
      setStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch('/analyze-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const analysis = await response.json();
      
      // Generate initial daily challenges
      const challResponse = await fetch('/generate-challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const challenges = await challResponse.json();

      // Store profile, analysis, and quests with today's date
      saveProfileAndAnalysis(form, analysis);
      saveGeneratedQuests(challenges);

      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 min-h-[60vh] text-center">
        <div className="w-16 h-16 border-4 border-eco-green border-t-transparent rounded-full animate-spin"></div>
        <h2 className="text-xl font-bold text-eco-dark">AI Analyzing Footprint...</h2>
        <p className="text-sm text-eco-textLight">We are querying Gemini models to generate customized carbon benchmarks and eco-quests.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 font-sans mt-2 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <span className="text-xs tracking-wider font-bold text-eco-green uppercase">Lifestyle Assessment</span>
        <span className="text-sm text-eco-textLight">Step {step + 1} of {QUESTIONS.length}</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-eco-border rounded-full overflow-hidden">
        <div 
          className="h-full bg-eco-green rounded-full transition-all duration-300"
          style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
        />
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-eco-dark">{currentQuestionnaire.section}</h1>
        <p className="text-sm text-eco-textLight leading-relaxed">{currentQuestionnaire.description}</p>
      </div>

      {/* Input Section Card */}
      <div className="eco-glass-card flex flex-col gap-6 bg-white border border-eco-border rounded-3xl p-6 shadow-sm">
        {currentQuestionnaire.fields.map(field => {
          const Icon = field.icon;
          return (
            <div key={field.name} className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-eco-dark flex items-center gap-2">
                <Icon className="w-4 h-4 text-eco-green" />
                {field.label}
              </label>

              {field.type === 'select' ? (
                <select
                  value={form[field.name]}
                  onChange={e => handleChange(field.name, e.target.value)}
                  className="bg-eco-light border border-eco-border rounded-2xl p-4 text-sm font-medium focus:outline-none focus:border-eco-green cursor-pointer"
                >
                  {field.options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : (
                <div className="relative flex items-center">
                  <input
                    type="number"
                    value={form[field.name]}
                    onChange={e => handleChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full bg-eco-light border border-eco-border rounded-2xl p-4 text-sm font-medium focus:outline-none focus:border-eco-green"
                  />
                  {field.name === 'distance' && (
                    <span className="absolute right-4 text-xs font-bold text-eco-textLight">km</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-center mt-2 text-sm text-eco-textLight/70 flex justify-center gap-1">
        <span>🌱 Tracking your journey to a greener future</span>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-4 mt-4">
        {step > 0 ? (
          <button
            onClick={handleBack}
            className="flex-1 bg-white hover:bg-eco-light border border-eco-border text-eco-dark font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        ) : (
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-white hover:bg-eco-light border border-eco-border text-eco-dark font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleNext}
          className="flex-1 bg-eco-green hover:bg-eco-green/90 text-white font-bold py-4 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
        >
          {step === QUESTIONS.length - 1 ? 'Calculate' : 'Next'} <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
