import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

function RetailerDashboard() {
  const [retailer, setRetailer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    async function loadRetailer() {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        navigate('/retailer/signup')
        return
      }

      const { data, error } = await supabase
        .from('retailers')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle()

      if (error || !data) {
        navigate('/retailer/signup')
        return
      }

      setRetailer(data)
      setLoading(false)
    }
    loadRetailer()
  }, [])

  function handleCopy() {
    const code = `<script src="https://avatar-app.vercel.app/widget.js" data-store-key="${retailer.api_key}"></script>`
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/retailer/signup')
  }

  if (loading) return <p style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>Loading your dashboard...</p>

  const installCode = `<script src="https://avatar-app.vercel.app/widget.js" data-store-key="${retailer.api_key}"></script>`

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem', fontFamily: 'sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', paddingBottom: '1.25rem', borderBottom: '1px solid #eee' }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: '22px' }}>Avatar for Retailers</h1>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>{retailer.store_name}</p>
        </div>
        <button
          onClick={handleLogout}
          style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #ccc', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}
        >
          Log out
        </button>
      </div>

      {/* Welcome card */}
      <div style={{ background: '#f0f7ff', border: '1px solid #b3d4f5', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
        <h2 style={{ margin: '0 0 8px', fontSize: '18px' }}>🎉 You're all set, {retailer.store_name}!</h2>
        <p style={{ margin: 0, color: '#444', fontSize: '14px', lineHeight: '1.6' }}>
          Your retailer account is ready. Paste the install code below into your website and the Avatar button will appear automatically for your shoppers.
        </p>
      </div>

      {/* API Key */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ margin: '0 0 12px', fontSize: '16px' }}>Your API Key</h3>
        <div style={{ background: '#f9f9f9', border: '1px solid #eee', borderRadius: '8px', padding: '12px 16px', fontFamily: 'monospace', fontSize: '14px', color: '#333', wordBreak: 'break-all' }}>
          {retailer.api_key}
        </div>
        <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#888' }}>Keep this key private — it identifies your store.</p>
      </div>

      {/* Install code */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ margin: '0 0 12px', fontSize: '16px' }}>Install code</h3>
        <p style={{ margin: '0 0 12px', fontSize: '14px', color: '#555', lineHeight: '1.6' }}>
          Paste this one line of code before the closing <code>&lt;/body&gt;</code> tag on your website. That's it — the Avatar button will appear automatically.
        </p>
        <div style={{ background: '#111', borderRadius: '10px', padding: '1.25rem', position: 'relative' }}>
          <code style={{ color: '#7dd3fc', fontSize: '13px', wordBreak: 'break-all', lineHeight: '1.8' }}>
            {installCode}
          </code>
          <button
            onClick={handleCopy}
            style={{ position: 'absolute', top: '12px', right: '12px', padding: '6px 14px', background: copied ? '#22c55e' : '#333', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', transition: 'background 0.2s' }}
          >
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* How to install steps */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '16px' }}>How to install</h3>
        {[
          { step: '1', title: 'Copy the install code above', sub: 'Click the Copy button — the whole script tag is copied to your clipboard.' },
          { step: '2', title: 'Open your website theme or template', sub: 'In Shopify go to Online Store → Themes → Edit code. Find your theme.liquid file.' },
          { step: '3', title: 'Paste before </body>', sub: 'Find the closing </body> tag and paste the code just above it. Save.' },
          { step: '4', title: 'The button appears automatically', sub: 'Visit your store — the ✨ Shop my size button will appear for any shopper who has an Avatar account.' },
        ].map(item => (
          <div key={item.step} style={{ display: 'flex', gap: '14px', marginBottom: '14px', alignItems: 'flex-start' }}>
            <div style={{ minWidth: '30px', height: '30px', background: '#000', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '500', flexShrink: 0 }}>
              {item.step}
            </div>
            <div>
              <p style={{ margin: '0 0 3px', fontSize: '14px', fontWeight: '500' }}>{item.title}</p>
              <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>{item.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Support */}
      <div style={{ background: '#f9f9f9', borderRadius: '10px', padding: '1.25rem', textAlign: 'center' }}>
        <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: '500' }}>Need help installing?</p>
        <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>Email us at <a href="mailto:support@avatar.com" style={{ color: '#000' }}>support@avatar.com</a> and we'll set it up for you.</p>
      </div>

    </div>
  )
}

export default RetailerDashboard