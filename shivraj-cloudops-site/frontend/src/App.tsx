import { useEffect, useState } from 'react'

type Content = {
  name: string
  title: string
  tagline: string
  services: string[]
}

export default function App() {
  const [content, setContent] = useState<Content | null>(null)
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState<string>('')

  useEffect(() => {
    fetch('/api/v1/content')
      .then(r => r.json())
      .then(setContent)
      .catch(() => setContent(null))
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('Sending...')
    const res = await fetch('/api/v1/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    if (res.ok) setStatus('Thanks! We will get back to you.')
    else setStatus('Failed to send. Please try again later.')
  }

  return (
    <div style={{fontFamily: 'system-ui, sans-serif', lineHeight: 1.6, maxWidth: 900, margin: '0 auto', padding: 16}}>
      <header style={{padding: '40px 0'}}>
        <h1>{content?.name ?? 'Shivraj Singh Bisht'}</h1>
        <h2 style={{color: '#555'}}>{content?.title ?? 'CloudOps | DevOps | Infrastructure | Security'}</h2>
        <p style={{fontSize: 18}}>{content?.tagline ?? 'Building secure, scalable, observable platforms.'}</p>
      </header>

      <section>
        <h3>Practice Areas</h3>
        <ul>
          {(content?.services ?? [
            'Kubernetes platform engineering',
            'CI/CD pipelines and GitOps',
            'Infrastructure as Code (Terraform, Helm)',
            'Cloud security and compliance',
            'Observability (Prometheus, Grafana, ELK)',
            'Cost optimization and reliability'
          ]).map(s => <li key={s}>{s}</li>)}
        </ul>
      </section>

      <section style={{marginTop: 40}}>
        <h3>Contact</h3>
        <form onSubmit={submit} style={{display: 'grid', gap: 12}}>
          <input required placeholder="Your name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <input required type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          <textarea required placeholder="Message" rows={5} value={form.message} onChange={e => setForm({...form, message: e.target.value})} />
          <button type="submit">Send</button>
          <div>{status}</div>
        </form>
      </section>
    </div>
  )
}