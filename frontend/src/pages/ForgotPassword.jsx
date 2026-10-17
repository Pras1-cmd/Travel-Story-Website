import { useState } from 'react';
import { authAPI } from '../services/api';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await authAPI.forgotPassword({ email });
      const resetToken = response.data?.data?.resetToken;
      setMessage(resetToken
        ? `Reset token created: ${resetToken}. Use it in the reset page.`
        : 'Password reset request sent.');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to process password reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-black text-slate-900">Reset Password</h1>
        <p className="mt-2 text-slate-600">Enter your email to generate a reset token.</p>

        {error && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">{error}</div>}
        {message && <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-700">{message}</div>}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:translate-y-[-1px]"
          >
            {loading ? 'Processing...' : 'Generate Reset Token'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;
