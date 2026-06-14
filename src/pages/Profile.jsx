import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

function Profile({ session }) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [shoeSize, setShoeSize] = useState('')
  const [topSize, setTopSize] = useState('')
  const [bottomSize, setBottomSize] = useState('')
  const [styleTags, setStyleTags] = useState('')
  const [brandPrefs, setBrandPrefs] = useState('')
  const [shippingAddress, setShippingAddress] = useState('')

  useEffect(() => {
    async function loadProfile() {
      const { data, error } = await supabase
        .from('avatars')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle()

      if (data) {
  setFullName(data.full_name || '')
  setShoeSize(data.shoe_size || '')
  setTopSize(data.top_size || '')
  setBottomSize(data.bottom_size || '')
  setStyleTags(data.style_tags || '')
  setBrandPrefs(data.brand_prefs || '')
  setShippingAddress(data.shipping_address || '')
}
// 406 just means no row exists yet — that's fine, ignore it
setLoading(false)
    }
    loadProfile()
  }, [session])

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

   const avatarData = {
  user_id: session.user.id,
  full_name: fullName,
  shoe_size: shoeSize,
  top_size: topSize,
  bottom_size: bottomSize,
  style_tags: styleTags,
  brand_prefs: brandPrefs,
  shipping_address: shippingAddress,
}

    const { error } = await supabase
      .from('avatars')
      .upsert(avatarData, { onConflict: 'user_id' })

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Avatar saved successfully!' })
    }
    setSaving(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  if (loading) return <p style={{ textAlign: 'center', marginTop: '100px' }}>Loading your avatar...</p>

  return (
    <div style={{ maxWidth: '500px', margin: '60px auto', padding: '2rem' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0 }}>Your Avatar</h1>
          <p style={{ margin: '4px 0 0', color: '#666', fontSize: '14px' }}>{session.user.email}</p>
        </div>
        <button
          onClick={handleLogout}
          style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer' }}
        >
          Log out
        </button>
      </div>

      <form onSubmit={handleSave}>
        <h3 style={{ marginBottom: '1rem' }}>Personal</h3>

<div style={{ marginBottom: '1rem' }}>
  <label>Full Name</label><br />
  <input
    type="text"
    value={fullName}
    onChange={(e) => setFullName(e.target.value)}
    placeholder="John Smith"
    style={{ width: '100%', padding: '8px', marginTop: '4px', boxSizing: 'border-box' }}
  />
</div>
        <h3 style={{ marginBottom: '1rem' }}>Sizes</h3>

        <div style={{ marginBottom: '1rem' }}>
          <label>Shoe Size (e.g. US 10, EU 43)</label><br />
          <input
            type="text"
            value={shoeSize}
            onChange={(e) => setShoeSize(e.target.value)}
            placeholder="US 10"
            style={{ width: '100%', padding: '8px', marginTop: '4px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Top Size (e.g. S, M, L, XL)</label><br />
          <input
            type="text"
            value={topSize}
            onChange={(e) => setTopSize(e.target.value)}
            placeholder="M"
            style={{ width: '100%', padding: '8px', marginTop: '4px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Bottom Size (e.g. 32x30, M)</label><br />
          <input
            type="text"
            value={bottomSize}
            onChange={(e) => setBottomSize(e.target.value)}
            placeholder="32x30"
            style={{ width: '100%', padding: '8px', marginTop: '4px', boxSizing: 'border-box' }}
          />
        </div>

        <h3 style={{ margin: '1.5rem 0 1rem' }}>Style</h3>

        <div style={{ marginBottom: '1rem' }}>
          <label>Style Tags (e.g. casual, sport, formal)</label><br />
          <input
            type="text"
            value={styleTags}
            onChange={(e) => setStyleTags(e.target.value)}
            placeholder="casual, sport"
            style={{ width: '100%', padding: '8px', marginTop: '4px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Favourite Brands (e.g. Nike, Zara)</label><br />
          <input
            type="text"
            value={brandPrefs}
            onChange={(e) => setBrandPrefs(e.target.value)}
            placeholder="Nike, Adidas"
            style={{ width: '100%', padding: '8px', marginTop: '4px', boxSizing: 'border-box' }}
          />
        </div>

        <h3 style={{ margin: '1.5rem 0 1rem' }}>Shipping</h3>

        <div style={{ marginBottom: '1.5rem' }}>
          <label>Default Shipping Address</label><br />
          <textarea
            value={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
            placeholder="123 Main St, Toronto, ON, Canada"
            rows={3}
            style={{ width: '100%', padding: '8px', marginTop: '4px', boxSizing: 'border-box' }}
          />
        </div>

        {message && (
          <p style={{ color: message.type === 'error' ? 'red' : 'green', marginBottom: '1rem' }}>
            {message.text}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          style={{ width: '100%', padding: '10px', background: '#000', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          {saving ? 'Saving...' : 'Save Avatar'}
        </button>

      </form>
    </div>
  )
}

export default Profile