// pages/index.tsx
import React, { useEffect, useState } from 'react';
import { basenameFromPath } from '../lib/basename';

type Source = {
    source_id: string;
    filename?: string | null;
    title?: string | null;
    author?: string | null;
    year?: number | null;
    edition?: string | null;
    publisher?: string | null;
    source_url?: string | null;
};

function EditModal({
                       item,
                       onClose,
                       onSave,
                   }: {
    item: Source | null;
    onClose: () => void;
    onSave: (s: Source) => void;
}) {
    const [form, setForm] = useState<Source | null>(null);
    useEffect(() => setForm(item ? { ...item } : null), [item]);

    if (!form) return null;

    // Точно указываем тип значения v: соответствует типу поля Source[K]
    function change<K extends keyof Source>(k: K, v: Source[K]) {
        // используем functional updater — безопасно при возможном null
        setForm((prev) => {
            if (!prev) return prev;
            // TS не всегда может вывести тип при computed property, поэтому приводим к Source
            return { ...prev, [k]: v } as Source;
        });
    }

    function save() {
        // payload: скопируем form — year теперь либо number, либо null (не '')
        const payload = { ...form } as Source;

        // можно удалить пустые поля или привести типы перед отправкой, например:
        // если year === undefined, не отправлять его, но у нас year уже number|null
        onSave(payload);
    }

    return (
        <div style={{position:'fixed',left:0,right:0,top:0,bottom:0,background:'rgba(0,0,0,0.35)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
            <div style={{background:'#fff',padding:18,width:760,borderRadius:8,boxShadow:'0 6px 18px rgba(0,0,0,0.2)'}}>
                <h3 style={{margin:0, marginBottom:12}}>Редактировать — {form.source_id}</h3>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                    <label style={{display:'flex',flexDirection:'column'}}>Title
                        <input value={form.title ?? ''} onChange={e=>change('title', e.target.value as Source['title'])} />
                    </label>
                    <label style={{display:'flex',flexDirection:'column'}}>Author
                        <input value={form.author ?? ''} onChange={e=>change('author', e.target.value as Source['author'])} />
                    </label>
                    <label style={{display:'flex',flexDirection:'column'}}>Year
                        {/* При пустом поле сохраняем null, иначе Number */}
                        <input value={form.year ?? ''} onChange={e=> {
                            const val = e.target.value;
                            const parsed = val === '' ? null : Number(val);
                            change('year', parsed as Source['year']);
                        }} />
                    </label>
                    <label style={{display:'flex',flexDirection:'column'}}>Edition
                        <input value={form.edition ?? ''} onChange={e=>change('edition', e.target.value as Source['edition'])} />
                    </label>
                    <label style={{display:'flex',flexDirection:'column'}}>Publisher
                        <input value={form.publisher ?? ''} onChange={e=>change('publisher', e.target.value as Source['publisher'])} />
                    </label>
                    <label style={{display:'flex',flexDirection:'column'}}>Source URL
                        <input value={form.source_url ?? ''} onChange={e=>change('source_url', e.target.value as Source['source_url'])} />
                    </label>
                </div>

                <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:12}}>
                    <button onClick={onClose}>Отмена</button>
                    <button onClick={save}>Сохранить</button>
                </div>
            </div>
        </div>
    );
}


export default function Home() {
    const [rows, setRows] = useState<Source[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editing, setEditing] = useState<Source | null>(null);

    async function fetchAll() {
        setLoading(true); setError(null);
        try {
            const res = await fetch('/api/sources');
            if (!res.ok) throw new Error(`Fetch failed ${res.status}`);
            const data = await res.json();
            setRows(data);
        } catch (e: any) {
            setError(e.message || 'Ошибка загрузки');
        } finally { setLoading(false); }
    }

    useEffect(()=>{ fetchAll(); }, []);

    async function handleSave(updated: Source) {
        try {
            const res = await fetch(`/api/sources/${encodeURIComponent(updated.source_id)}`, {
                method: 'PUT',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify(updated),
            });
            if (!res.ok) {
                const jd = await res.json().catch(()=>null);
                throw new Error(jd?.error ?? `Status ${res.status}`);
            }
            const saved = await res.json();
            setRows(prev => prev.map(r => r.source_id === saved.source_id ? saved : r));
            setEditing(null);
        } catch (err: any) {
            alert('Ошибка при сохранении: ' + (err.message || err));
        }
    }

    return (
        <div style={{padding:20,fontFamily:'Arial, sans-serif'}}>
            <h1 style={{marginTop:0}}>RAG Sources — Admin</h1>

            <div style={{marginBottom:12, display:'flex', gap:8}}>
                <button onClick={fetchAll} disabled={loading}>Обновить</button>
                {loading && <div style={{alignSelf:'center'}}>Загрузка...</div>}
            </div>

            {error && <div style={{color:'red'}}>{error}</div>}

            <div style={{overflowX:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse',minWidth:900}}>
                    <thead>
                    <tr>
                        <th style={{borderBottom:'1px solid #ddd',textAlign:'left',padding:8}}>source_id</th>
                        <th style={{borderBottom:'1px solid #ddd',textAlign:'left',padding:8}}>FileName</th>
                        <th style={{borderBottom:'1px solid #ddd',textAlign:'left',padding:8}}>Title</th>
                        <th style={{borderBottom:'1px solid #ddd',textAlign:'left',padding:8}}>Author</th>
                        <th style={{borderBottom:'1px solid #ddd',textAlign:'left',padding:8}}>Year</th>
                        <th style={{borderBottom:'1px solid #ddd',textAlign:'left',padding:8}}>Edition</th>
                        <th style={{borderBottom:'1px solid #ddd',textAlign:'left',padding:8}}>Publisher</th>
                        <th style={{borderBottom:'1px solid #ddd',textAlign:'left',padding:8}}>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {rows.map(r => (
                        <tr key={r.source_id}>
                            <td style={{padding:8,borderBottom:'1px solid #f0f0f0',verticalAlign:'top'}}>{r.source_id}</td>
                            <td style={{padding:8,borderBottom:'1px solid #f0f0f0',verticalAlign:'top'}} title={r.filename ?? ''}>
                                {basenameFromPath(r.filename ?? '') || '—'}
                            </td>
                            <td style={{padding:8,borderBottom:'1px solid #f0f0f0',verticalAlign:'top'}}>{r.title ?? ''}</td>
                            <td style={{padding:8,borderBottom:'1px solid #f0f0f0',verticalAlign:'top'}}>{r.author ?? ''}</td>
                            <td style={{padding:8,borderBottom:'1px solid #f0f0f0',verticalAlign:'top'}}>{r.year ?? ''}</td>
                            <td style={{padding:8,borderBottom:'1px solid #f0f0f0',verticalAlign:'top'}}>{r.edition ?? ''}</td>
                            <td style={{padding:8,borderBottom:'1px solid #f0f0f0',verticalAlign:'top'}}>{r.publisher ?? ''}</td>
                            <td style={{padding:8,borderBottom:'1px solid #f0f0f0',verticalAlign:'top'}}><button onClick={()=>setEditing(r)}>Edit</button></td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <EditModal item={editing} onClose={()=>setEditing(null)} onSave={handleSave} />
        </div>
    );
}
