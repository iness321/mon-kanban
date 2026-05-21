import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    let result;
    if (isRegister) {
      result = await supabase.auth.signUp({ email, password });
    } else {
      result = await supabase.auth.signInWithPassword({ email, password });
    }

    if (result.error) {
      // Traduction rapide des erreurs courantes pour faire plus propre
      if (result.error.message === 'Invalid login credentials') {
        setError('Identifiants invalides. Vérifiez votre email ou mot de passe.');
      } else {
        setError(result.error.message);
      }
    }
    setLoading(false);
  }

  // Styles modernisés
  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', // Dégradé subtil en arrière-plan
    fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    padding: '1rem'
  };

  const cardStyle = {
    background: '#FFFFFF',
    padding: '2.5rem 2rem',
    borderRadius: '16px', // Coins plus arrondis
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)', // Ombre portée pour donner du relief
    boxSizing: 'border-box'
  };

  const titleStyle = {
    color: '#1A8C82',
    marginBottom: '0.5rem',
    textAlign: 'center',
    fontSize: '1.8rem',
    fontWeight: '700',
    letterSpacing: '-0.025em'
  };

  const subtitleStyle = {
    color: '#64748B',
    textAlign: 'center',
    marginBottom: '2rem',
    fontSize: '0.95rem'
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    marginBottom: '1.25rem',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    fontSize: '0.95rem',
    boxSizing: 'border-box',
    backgroundColor: '#F8FAFC',
    transition: 'all 0.2s ease',
    outline: 'none'
  };

  const btnStyle = {
    width: '100%',
    padding: '0.85rem',
    background: '#1A8C82',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    boxShadow: '0 4px 6px -1px rgba(26, 140, 130, 0.2)'
  };

  const errorStyle = {
    backgroundColor: '#FEF2F2',
    color: '#DC2626',
    border: '1px solid #FEE2E2',
    padding: '0.75rem',
    borderRadius: '8px',
    marginBottom: '1.25rem',
    fontSize: '0.875rem',
    textAlign: 'center'
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>
          {isRegister ? 'Créer un compte' : 'Bienvenue'}
        </h1>
        <p style={subtitleStyle}>
          {isRegister ? 'Inscrivez-vous pour accéder à votre Kanban' : 'Connectez-vous à votre espace KanbanRT'}
        </p>
        
        {error && <div style={errorStyle}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontSize: '0.85rem', fontWeight: '600' }}>Adresse Email</label>
          <input 
            type="email" 
            placeholder="nom@exemple.fr" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            style={inputStyle} 
            onFocus={(e) => { e.target.style.borderColor = '#1A8C82'; e.target.style.backgroundColor = '#FFF'; }}
            onBlur={(e) => { e.target.style.borderColor = '#E2E8F0'; e.target.style.backgroundColor = '#F8FAFC'; }}
          />
          
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontSize: '0.85rem', fontWeight: '600' }}>Mot de passe</label>
          <input 
            type="password" 
            placeholder="••••••••" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
            style={inputStyle} 
            onFocus={(e) => { e.target.style.borderColor = '#1A8C82'; e.target.style.backgroundColor = '#FFF'; }}
            onBlur={(e) => { e.target.style.borderColor = '#E2E8F0'; e.target.style.backgroundColor = '#F8FAFC'; }}
          />
          
          <button 
            type="submit" 
            disabled={loading} 
            style={btnStyle}
            onMouseOver={(e) => e.target.style.backgroundColor = '#146E66'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#1A8C82'}
          >
            {loading ? 'Chargement...' : isRegister ? 'Créer mon compte' : 'Se connecter'}
          </button>
          
          <p 
            style={{ marginTop: '1.5rem', textAlign: 'center', cursor: 'pointer', color: '#1A8C82', fontSize: '0.9rem', fontWeight: '500' }} 
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
          >
            {isRegister ? 'Déjà un compte ? Se connecter' : "Pas de compte ? S'inscrire"}
          </p>
        </form>
      </div>
    </div>
  );
}