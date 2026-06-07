import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate, Link } from 'react-router-dom'

function generateApiKey(storeName) {
  const clean = storeName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
  const random = Math.random().toString(36).substring(2, 10)
  return `avatar_${clean}_${random}`
}

function RetailerSignup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [storeName, setStoreName] = useState('')
  const [website, setWebsite] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Step 1 — create auth account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // Step 2 — save retailer profile with API key
    const apiKey = generateApiKey(storeName)

    const { error: dbError } = await supabase
      .from('retailers')
      .insert({
        user_id: authData.user.id,
        store_name: storeName,
        website: website,
        api_key: apiKey,
      })

    if (dbError) {
      setError(dbError.message)
      setLoading(false)
      return
    }

    navigate('/retailer/dashboard')
  }

  return (
    <div style={{ maxWidth: '480px', margin: '80px auto', padding: '2rem', fontFamily: 'sans-serif' }}>

      <h1 style={{ margin: '0 0 8px', fontSize: '26px' }}>Add Avatar to your store</h1>
      <p style={{ margin: '0 0 2rem', color: '#666', fontSize: '15px' }}>
        Create your retailer account and get your install code in 2 minutes.
      </p>

      <form onSubmit={handleSubmit}>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '14px', fontWeight: '500' }}>Store name</label><br />
          <input
            type="text"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            placeholder="StepRight Shoes"
            required
            style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box', fontSize: '14px' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '14px', fontWeight: '500' }}>Store website</label><br />
          <input
            type="text"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://stepright.com"
            required
            style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box', fontSize: '14px' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '14px', fontWeight: '500' }}>Email</label><br />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@yourstore.com"
            required
            style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box', fontSize: '14px' }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontSize: '14px', fontWeight: '500' }}>Password</label><br />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box', fontSize: '14px' }}
          />
        </div>

        {error && (
          <p style={{ color: 'red', fontSize: '14px', marginBottom: '1rem' }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '12px', background: '#000', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '500' }}
        >
          {loading ? 'Creating your account...' : 'Create retailer account →'}
        </button>

      </form>

      <p style={{ marginTop: '1.5rem', fontSize: '13px', color: '#888', textAlign: 'center' }}>
        Already have a retailer account? <Link to="/retailer/login">Log in</Link>
      </p>

    </div>
  )
}

export default RetailerSignup