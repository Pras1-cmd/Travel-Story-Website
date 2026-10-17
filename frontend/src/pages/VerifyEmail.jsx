import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { authAPI } from '../services/api';

function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        const response = await authAPI.verifyEmail(token);
        setStatus('success');
        setMessage(response.data?.message || 'Email verified successfully.');
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed.');
      }
    };

    if (token) {
      verify();
    }
  }, [token]);

  return (
    <div className="mx-auto max-w-lg px-4 py-20">
      <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-lg">
        <h1 className="text-3xl font-black text-slate-900">Email Verification</h1>

        {status === 'verifying' && (
          <div className="mt-6">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="mt-4 text-slate-600">Verifying your email address...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="mt-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-600">✓</div>
            <p className="text-lg font-semibold text-emerald-700">{message}</p>
            <Link to="/login" className="mt-6 inline-block rounded-full bg-blue-600 px-6 py-3 font-semibold text-white">Go to Login</Link>
          </div>
        )}

        {status === 'error' && (
          <div className="mt-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-2xl text-red-600">!</div>
            <p className="text-lg font-semibold text-red-700">{message}</p>
            <Link to="/register" className="mt-6 inline-block rounded-full bg-slate-900 px-6 py-3 font-semibold text-white">Create an account</Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;
