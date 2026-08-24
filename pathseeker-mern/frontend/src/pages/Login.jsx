import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function Login(){
  const navigate=useNavigate();
  const [form,setForm]=useState({email:'',password:''});
  const [loading,setLoading]=useState(false); const [error,setError]=useState('');
  const submit=async e=>{e.preventDefault();setError('');setLoading(true);try{const {data}=await api.post('/auth/login',form);localStorage.setItem('token',data.token);localStorage.setItem('user',JSON.stringify(data.user));navigate('/dashboard')}catch(err){setError(err.response?.data?.message||'Unable to login. Please try again.')}finally{setLoading(false)}};
  return <main className="auth-page"><section className="auth-card"><div className="auth-brand"><span>PS</span><div><strong>PathSeeker</strong><small>Discover What Fits You Best.</small></div></div><h1>Welcome back</h1><p className="muted">Sign in to continue your career journey.</p>{error&&<div className="alert error">{error}</div>}<form onSubmit={submit}><label>Email<input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com"/></label><label>Password<input type="password" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="••••••••"/></label><div className="form-row"><label className="check"><input type="checkbox"/> Remember me</label><button type="button" className="link-button">Forgot password?</button></div><button className="btn full" disabled={loading}>{loading?'Signing in...':'Login'}</button></form><p className="auth-bottom">Don't have an account? <Link to="/register">Create one</Link></p></section></main>
}
