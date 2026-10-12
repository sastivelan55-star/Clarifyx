import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { authApi } from '../services/api/authApi';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ShieldCheck, Lock, Terminal } from 'lucide-react';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { setUser } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = isLogin
        ? await authApi.login({ email, password })
        : await authApi.register({ email, password });

      if (response.success && response.data) {
        setUser(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'radial-gradient(circle at 50% 30%, #0F1728 0%, #070B14 80%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'var(--panel-bg)',
        padding: '36px',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '420px',
        border: '1px solid var(--panel-border)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '28px', textAlign: 'center' }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #1A3462, #0E2042)',
            border: '1px solid rgba(40, 215, 255, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--cyan-accent)',
            marginBottom: '14px',
            boxShadow: '0 0 16px rgba(40, 215, 255, 0.2)'
          }}>
            <ShieldCheck size={26} />
          </div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#fff' }}>
            ClarifyX <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: 4, background: 'rgba(40,215,255,0.15)', color: 'var(--cyan-accent)', fontFamily: 'var(--font-mono)' }}>2.0</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>
            Threat Intelligence Operations Console
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Operator Identity (Email)"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="operator@defense.local"
            required
          />
          <Input
            label="Cryptographic Token (Password)"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••••••"
            required
            minLength={8}
          />

          {error && (
            <div style={{
              color: '#EF4444',
              fontSize: '12px',
              background: 'var(--risk-high-bg)',
              border: '1px solid var(--risk-high-border)',
              padding: '10px 12px',
              borderRadius: '8px'
            }}>
              {error}
            </div>
          )}

          <Button type="submit" isLoading={loading} style={{ marginTop: '8px', width: '100%' }}>
            {isLogin ? 'Authenticate & Enter SOC' : 'Register Operator Credentials'}
          </Button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--cyan-accent)',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            {isLogin ? 'Need operator credentials? Register new account' : 'Already have credentials? Authenticate'}
          </button>
        </div>
      </div>
    </div>
  );
}
