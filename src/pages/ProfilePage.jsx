// src/pages/ProfilePage.jsx
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';

export default function ProfilePage({ session }) {
  const user = session.user;

  const [fullName, setFullName] = useState(user.user_metadata?.full_name || '');
  const [infoMsg, setInfoMsg] = useState('');
  const [infoErr, setInfoErr] = useState('');

  const [newPass, setNewPass] = useState('');
  const [passMsg, setPassMsg] = useState('');
  const [passErr, setPassErr] = useState('');

  const [avatarUrl, setAvatarUrl] = useState(user.user_metadata?.avatar_url || '');
  const [uploading, setUploading] = useState(false);

  async function handleSaveInfo(e) {
    e.preventDefault();
    setInfoErr('');
    setInfoMsg('');
    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName }
    });
    if (error) setInfoErr(error.message);
    else setInfoMsg('✅ Profil mis à jour !');
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPassErr('');
    setPassMsg('');
    if (newPass.length < 6) { setPassErr('Minimum 6 caractères.'); return; }
    const { error } = await supabase.auth.updateUser({ password: newPass });
    if (error) setPassErr(error.message);
    else { setPassMsg('✅ Mot de passe mis à jour !'); setNewPass(''); }
  }

  async function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const filePath = `${user.id}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from('avatars').upload(filePath, file);
    if (error) {
      alert(error.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    const url = data.publicUrl;
    await supabase.auth.updateUser({ data: { avatar_url: url } });
    setAvatarUrl(url);
    setUploading(false);
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      <Navbar session={session} />
      <main style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ color: '#1A8C82' }}>👤 Mon profil</h2>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%',
            background: '#E2E8F0', margin: '0 auto 1rem', overflow: 'hidden',
            border: '3px solid #1A8C82' }}>
            {avatarUrl
              ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: '2.5rem', lineHeight: '100px' }}>👤</span>}
          </div>
          <label style={{ cursor: 'pointer', color: '#1A8C82', fontWeight: 600 }}>
            {uploading ? 'Envoi...' : '📷 Changer la photo'}
            <input type='file' accept='image/*' onChange={handleAvatarUpload}
              style={{ display: 'none' }} />
          </label>
        </div>

        <div style={cardStyle}>
          <h3 style={{ marginTop: 0 }}>Informations générales</h3>
          <p style={{ color: '#64748B' }}>Email : {user.email}</p>
          <form onSubmit={handleSaveInfo}>
            <label style={labelStyle}>Nom complet</label>
            <input value={fullName} onChange={e => setFullName(e.target.value)}
              placeholder='Votre nom' style={inputStyle} />
            {infoMsg && <p style={{ color: 'green' }}>{infoMsg}</p>}
            {infoErr && <p style={{ color: 'red' }}>{infoErr}</p>}
            <button type='submit' style={btnStyle}>Sauvegarder</button>
          </form>
        </div>

        <div style={cardStyle}>
          <h3 style={{ marginTop: 0 }}>Changer le mot de passe</h3>
          <form onSubmit={handleChangePassword}>
            <label style={labelStyle}>Nouveau mot de passe</label>
            <input type='password' value={newPass} onChange={e => setNewPass(e.target.value)}
              placeholder='Min. 6 caractères' style={inputStyle} />
            {passMsg && <p style={{ color: 'green' }}>{passMsg}</p>}
            {passErr && <p style={{ color: 'red' }}>{passErr}</p>}
            <button type='submit' style={btnStyle}>Mettre à jour</button>
          </form>
        </div>
      </main>
    </div>
  );
}

const cardStyle = {
  background: 'white', padding: '1.5rem', borderRadius: '10px',
  marginBottom: '1.5rem', border: '1px solid #E2E8F0'
};
const inputStyle = {
  width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #CBD5E1',
  borderRadius: '6px', fontSize: '0.9rem', marginBottom: '0.75rem', boxSizing: 'border-box'
};
const labelStyle = {
  display: 'block', marginBottom: '0.3rem', fontSize: '0.8rem',
  fontWeight: 600, color: '#64748B'
};
const btnStyle = {
  background: '#1A8C82', color: 'white', border: 'none',
  padding: '0.6rem 1.5rem', borderRadius: '6px', cursor: 'pointer'
};