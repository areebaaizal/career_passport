import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';

export default function Careers(){
 const [params,setParams]=useSearchParams(); const [careers,setCareers]=useState([]); const [loading,setLoading]=useState(true); const [error,setError]=useState('');
 const search=params.get('search')||''; const domain=params.get('domain')||'All'; const demand=params.get('demand')||'All';
 useEffect(()=>{let active=true;(async()=>{setLoading(true);try{const q=new URLSearchParams();if(search)q.set('search',search);if(domain!=='All')q.set('domain',domain);if(demand!=='All')q.set('demand',demand);const {data}=await api.get(`/careers?${q}`);if(active)setCareers(data||[])}catch(e){if(active)setError('Could not load careers. Make sure the backend and MongoDB Atlas are connected.')}finally{if(active)setLoading(false)}})();return()=>active=false},[search,domain,demand]);
 const domains=useMemo(()=>['All',...new Set(careers.map(c=>c.domain).filter(Boolean))],[careers]);
 const update=(key,value)=>{const next=new URLSearchParams(params);if(value==='All'||!value)next.delete(key);else next.set(key,value);setParams(next)};
 return <main className="content-page"><div className="page-hero"><div><span className="eyebrow">CAREER BANK</span><h1>Find a career that fits.</h1><p>Explore roles by domain, demand and your interests. Save the ones you want to revisit.</p></div><Link className="btn" to="/quiz">Take the quiz →</Link></div>
 <div className="searchbar"><span>⌕</span><input value={search} onChange={e=>update('search',e.target.value)} placeholder="Search careers, skills or roles..."/><button onClick={()=>update('search','')}>Clear</button></div>
 <div className="filter-row"><div className="filter-label">Domain</div>{domains.map(d=><button key={d} className={domain===d?'filter active':'filter'} onClick={()=>update('domain',d)}>{d}</button>)}<select value={demand} onChange={e=>update('demand',e.target.value)}><option>All</option><option>High</option><option>Medium</option><option>Low</option></select></div>
 {error&&<div className="alert error">{error}</div>}
 <div className="result-head"><span>{loading?'Loading...':`${careers.length} career${careers.length===1?'':'s'} found`}</span><span>Updated from Career Bank</span></div>
 <div className="career-grid">{!loading&&careers.map(c=><article className="career-card" key={c._id}><div className="career-top"><span className="career-icon">{(c.title||'C').slice(0,2).toUpperCase()}</span><button className="ghost-icon" title="Bookmark">♡</button></div><span className="tag">{c.domain||'Career'}</span><h2>{c.title}</h2><p>{c.description||'Explore this career path, required skills and growth opportunities.'}</p><div className="skill-list">{(c.skills||[]).slice(0,4).map(s=><span key={s}>{s}</span>)}</div><div className="career-meta"><span>Demand <b>{c.demand||'Growing'}</b></span><span>{c.salary||'Salary varies'}</span></div><Link to={`/careers/${c._id}`} className="card-link">View career details <b>→</b></Link></article>)}{loading&&[1,2,3,4,5,6].map(i=><div className="skeleton" key={i}/>) }{!loading&&!careers.length&&<div className="empty wide">No careers match these filters yet. Try another search or ask an admin to add careers.</div>}</div></main>
}
