import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase'; // ⚠️ Check this path!
import AvatarCreator from '../avatar/AvatarCreator';

export default function Register() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState(null);
  
  const [formData, setFormData] = useState({ full_name: '', email: '', password: '', academic_level: '100' });
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email, password: formData.password,
        options: { data: { full_name: formData.full_name, academic_level: formData.academic_level } }
      });
      if (error) throw error;
      if (data.user) { setUserId(data.user.id); setStep(2); }
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  // THE MAGIC FIX: Force a hard page reload to the campus!
  const handleAvatarComplete = (config, username) => {
    window.location.href = '/virtual-campus';
  };

  if (step === 2 && userId) {
    return <AvatarCreator userId={userId} onComplete={handleAvatarComplete} />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#020617', padding: '20px', fontFamily: '-apple-system, sans-serif' }}>
      <div style={{ background: '#0F172A', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)', width: '100%', maxWidth: '420px', border: '1px solid #1E293B' }}>
        <h2 style={{ textAlign: 'center', color: '#F8FAFC', marginBottom: '25px', fontSize: '24px' }}>Join UCC Campus Hub</h2>
        {error && <div style={{ background: '#450a0a', color: '#fca5a5', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>{error}</div>}
        <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input name="full_name" placeholder="Full Name" value={formData.full_name} onChange={handleChange} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#020617', color: 'white' }} />
          <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#020617', color: 'white' }} />
          <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#020617', color: 'white' }} />
          <select name="academic_level" value={formData.academic_level} onChange={handleChange} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#020617', color: 'white' }}>
            <option value="100">Level 100 (Fresher)</option>
            <option value="200">Level 200</option>
            <option value="300">Level 300</option>
            <option value="400">Level 400</option>
          </select>
          <button type="submit" disabled={loading} style={{ padding: '14px', borderRadius: '10px', border: 'none', background: '#E53E3E', color: 'white', fontWeight: 'bold', fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Creating...' : 'Start Character Creation 🎨'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#94A3B8' }}>
          Have an account? <Link to="/login" style={{ color: '#3B82F6', textDecoration: 'none', fontWeight: 'bold' }}>Log In</Link>
        </p>
      </div>
    </div>
  );
}