import React, { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Mail, Lock, UserPlus, User, Car, Flame, Zap, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ASSESSMENT_STEPS = [
  {
    title: 'Transportation',
    description: 'This helps the AI understand how you move day to day.',
    fields: [
      {
        name: 'transport_mode',
        label: 'Primary transport mode',
        type: 'select',
        options: [
          { value: 'public_transit', label: 'Public transit' },
          { value: 'bicycle_walk', label: 'Bicycle / Walk' },
          { value: 'electric_car', label: 'Electric vehicle' },
          { value: 'petrol_car', label: 'Petrol / Diesel car' },
          { value: 'motorbike', label: 'Motorbike / Scooter' },
        ],
        icon: Car,
      },
      {
        name: 'daily_distance',
        label: 'Approximate daily travel distance (km)',
        type: 'number',
        placeholder: 'e.g. 14',
        icon: Car,
      },
    ],
  },
  {
    title: 'Food Habits',
    description: 'Diet is one of the strongest signals in footprint analysis.',
    fields: [
      {
        name: 'diet',
        label: 'Diet pattern',
        type: 'select',
        options: [
          { value: 'vegan', label: 'Vegan' },
          { value: 'vegetarian', label: 'Vegetarian' },
          { value: 'mixed', label: 'Mixed diet' },
          { value: 'heavy_meat', label: 'Heavy meat-based' },
        ],
        icon: Flame,
      },
    ],
  },
  {
    title: 'Home Energy',
    description: 'Home energy usage informs the dashboard score and recommendations.',
    fields: [
      {
        name: 'ac_hours',
        label: 'AC usage per day',
        type: 'number',
        placeholder: 'e.g. 4',
        icon: Zap,
      },
      {
        name: 'energy_level',
        label: 'Electricity usage level',
        type: 'select',
        options: [
          { value: 'low', label: 'Low / solar-friendly' },
          { value: 'moderate', label: 'Moderate' },
          { value: 'high', label: 'High' },
        ],
        icon: Zap,
      },
    ],
  },
  {
    title: 'Shopping & Plastic',
    description: 'Consumption patterns help the report and chatbot stay relevant.',
    fields: [
      {
        name: 'shopping_frequency',
        label: 'Online shopping frequency',
        type: 'select',
        options: [
          { value: 'rarely', label: 'Rarely' },
          { value: 'monthly', label: 'Monthly' },
          { value: 'weekly', label: 'Weekly' },
        ],
        icon: ShoppingBag,
      },
      {
        name: 'plastic_usage',
        label: 'Single-use plastic habit',
        type: 'select',
        options: [
          { value: 'zero', label: 'Very low / zero waste' },
          { value: 'occasional', label: 'Occasional' },
          { value: 'regular', label: 'Regular' },
        ],
        icon: ShoppingBag,
      },
    ],
  },
];

const defaultAnswers = {
  transport_mode: 'public_transit',
  daily_distance: '',
  diet: 'mixed',
  ac_hours: '',
  energy_level: 'moderate',
  shopping_frequency: 'monthly',
  plastic_usage: 'occasional',
};

export default function Register() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    ...defaultAnswers,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const assessmentStep = ASSESSMENT_STEPS[step];
  const isAuthStep = step === 0;
  const isFinalAssessmentStep = step === ASSESSMENT_STEPS.length - 1;
  const progress = useMemo(() => ((step + 1) / (ASSESSMENT_STEPS.length + 1)) * 100, [step]);

  const updateField = (name, value) => {
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const nextStep = () => {
    if (isAuthStep) {
      if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
        setError('Please complete the account details first.');
        return;
      }
      if (!/\S+@\S+\.\S+/.test(form.email)) {
        setError('Please enter a valid email address.');
        return;
      }
      if (form.password.length < 6) {
        setError('Password should be at least 6 characters.');
        return;
      }
    }
    setError('');
    if (isAuthStep || !isFinalAssessmentStep) {
      setStep((previous) => Math.min(previous + 1, ASSESSMENT_STEPS.length - 1));
      return;
    }
    handleSubmit();
  };

  const previousStep = () => {
    setError('');
    setStep((previous) => Math.max(previous - 1, 0));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        transport_mode: form.transport_mode,
        daily_distance: form.daily_distance,
        diet: form.diet,
        ac_hours: form.ac_hours,
        energy_level: form.energy_level,
        shopping_frequency: form.shopping_frequency,
        plastic_usage: form.plastic_usage,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'We could not create your account right now.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-5 text-center px-4">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-eco-green/20" />
          <div className="absolute inset-0 rounded-full border-4 border-t-eco-green border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          <div className="absolute inset-3 rounded-full bg-eco-green/10 flex items-center justify-center">
            <span className="text-2xl">🌿</span>
          </div>
        </div>
        <h2 className="text-2xl font-extrabold text-eco-dark">AI is calculating your carbon index...</h2>
        <p className="text-base text-eco-textLight max-w-xl">
          We’re analyzing your registration answers, generating your report, and creating your three daily quests.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] font-sans px-4">
      <div className="w-full max-w-3xl flex flex-col gap-8">
        <div className="text-center flex flex-col gap-3">
          <div className="w-14 h-14 rounded-2xl bg-eco-green flex items-center justify-center text-white font-extrabold text-2xl mx-auto shadow-lg">
            C
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-eco-dark">Create your CarbonWise account</h1>
          <p className="text-base text-eco-textLight">
            Register once with email and password, then answer the footprint questions that power your score and quests.
          </p>
        </div>

        <div className="w-full h-2 bg-eco-border rounded-full overflow-hidden">
          <div className="h-full bg-eco-green rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>

        {error && (
          <p className="text-red-600 text-sm font-semibold bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
            {error}
          </p>
        )}

        <div className="bg-white/90 border border-eco-border rounded-3xl p-6 md:p-8 shadow-sm">
          {isAuthStep ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-semibold text-eco-dark flex items-center gap-2">
                  <User className="w-4 h-4 text-eco-green" />
                  Full name
                </label>
                <input
                  value={form.name}
                  onChange={(event) => updateField('name', event.target.value)}
                  className="bg-eco-light border border-eco-border rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-eco-green/30 focus:border-eco-green transition-all"
                  placeholder="e.g. Aanya Verma"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-eco-dark flex items-center gap-2">
                  <Mail className="w-4 h-4 text-eco-green" />
                  Email address
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField('email', event.target.value)}
                  className="bg-eco-light border border-eco-border rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-eco-green/30 focus:border-eco-green transition-all"
                  placeholder="aanya@example.com"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-eco-dark flex items-center gap-2">
                  <Lock className="w-4 h-4 text-eco-green" />
                  Password
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => updateField('password', event.target.value)}
                  className="bg-eco-light border border-eco-border rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-eco-green/30 focus:border-eco-green transition-all"
                  placeholder="Create a secure password"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-extrabold text-eco-dark">{assessmentStep.title}</h2>
                <p className="text-base text-eco-textLight leading-relaxed">{assessmentStep.description}</p>
              </div>

              <div className="grid grid-cols-1 gap-5">
                {assessmentStep.fields.map((field) => {
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
                          onChange={(event) => updateField(field.name, event.target.value)}
                          className="bg-eco-light border border-eco-border rounded-2xl p-4 text-sm font-medium focus:outline-none focus:border-eco-green"
                        >
                          {field.options.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="number"
                          value={form[field.name]}
                          onChange={(event) => updateField(field.name, event.target.value)}
                          placeholder={field.placeholder}
                          className="bg-eco-light border border-eco-border rounded-2xl p-4 text-sm font-medium focus:outline-none focus:border-eco-green"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={previousStep}
            disabled={step === 0}
            className={`flex-1 border rounded-2xl py-4 font-bold transition-all flex items-center justify-center gap-2 ${
              step === 0 ? 'border-eco-border bg-white/60 text-eco-textLight cursor-not-allowed' : 'border-eco-border bg-white text-eco-dark hover:bg-eco-light'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {isAuthStep || !isFinalAssessmentStep ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex-1 bg-eco-green hover:bg-eco-green/90 text-white font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-eco-green hover:bg-eco-green/90 text-white font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              <UserPlus className="w-4 h-4" />
              {loading ? 'Creating account...' : 'Register and continue'}
            </button>
          )}
        </div>

        <p className="text-center text-sm text-eco-textLight">
          Already have an account?{' '}
          <Link to="/login" className="text-eco-green font-bold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
