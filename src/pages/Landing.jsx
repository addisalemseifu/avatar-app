import { useNavigate } from 'react-router-dom'

function Landing() {
  const navigate = useNavigate()

  return (
    <div style={{ fontFamily: 'sans-serif', color: '#111' }}>

      {/* Nav */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 2rem', borderBottom: '1px solid #eee' }}>
        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '700' }}>Avatar</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => navigate('/login')}
            style={{ padding: '8px 18px', background: 'transparent', border: '1px solid #ccc', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}
          >
            Log in
          </button>
          <button
            onClick={() => navigate('/signup')}
            style={{ padding: '8px 18px', background: '#000', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}
          >
            Get started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '5rem 2rem 4rem' }}>
        <div style={{ display: 'inline-block', background: '#f0f7ff', color: '#0C447C', fontSize: '13px', fontWeight: '500', padding: '6px 14px', borderRadius: '20px', marginBottom: '1.5rem' }}>
          Your size. Your style. Everywhere you shop.
        </div>
        <h2 style={{ fontSize: '52px', fontWeight: '700', margin: '0 0 1.5rem', lineHeight: '1.15' }}>
          Shop without filling<br />out a single form.
        </h2>
        <p style={{ fontSize: '20px', color: '#555', maxWidth: '560px', margin: '0 auto 2.5rem', lineHeight: '1.6' }}>
          Avatar remembers your sizes, style, and preferences. Every store that supports Avatar instantly knows what fits you.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/signup')}
            style={{ padding: '14px 32px', background: '#000', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '16px', fontWeight: '500' }}
          >
            Create your Avatar — it's free
          </button>
          <button
            onClick={() => navigate('/demo')}
            style={{ padding: '14px 32px', background: 'transparent', border: '1px solid #ccc', borderRadius: '10px', cursor: 'pointer', fontSize: '16px' }}
          >
            See the demo →
          </button>
        </div>
      </div>

      {/* How it works */}
      <div style={{ background: '#f9f9f9', padding: '4rem 2rem' }}>
        <h3 style={{ textAlign: 'center', fontSize: '28px', fontWeight: '700', margin: '0 0 3rem' }}>How it works</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '42px', marginBottom: '1rem' }}>📋</div>
            <h4 style={{ margin: '0 0 8px', fontSize: '17px' }}>1. Build your Avatar</h4>
            <p style={{ margin: 0, color: '#666', fontSize: '14px', lineHeight: '1.6' }}>Fill in your sizes, style preferences, and favourite brands. Takes 2 minutes. You do it once.</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '42px', marginBottom: '1rem' }}>🛍️</div>
            <h4 style={{ margin: '0 0 8px', fontSize: '17px' }}>2. Shop anywhere</h4>
            <p style={{ margin: 0, color: '#666', fontSize: '14px', lineHeight: '1.6' }}>Visit any store that supports Avatar. Click "Shop my size" and the store instantly filters to what fits you.</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '42px', marginBottom: '1rem' }}>✨</div>
            <h4 style={{ margin: '0 0 8px', fontSize: '17px' }}>3. Never guess again</h4>
            <p style={{ margin: 0, color: '#666', fontSize: '14px', lineHeight: '1.6' }}>No wrong sizes. No returns. No forms. Avatar gets smarter the more you shop.</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding: '4rem 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2rem', maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <div>
            <p style={{ fontSize: '48px', fontWeight: '700', margin: '0 0 8px' }}>30%</p>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>of online clothing orders are returned due to wrong size</p>
          </div>
          <div>
            <p style={{ fontSize: '48px', fontWeight: '700', margin: '0 0 8px' }}>70%</p>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>of shoppers abandon carts because of too many steps</p>
          </div>
          <div>
            <p style={{ fontSize: '48px', fontWeight: '700', margin: '0 0 8px' }}>1</p>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>click is all it takes with Avatar</p>
          </div>
        </div>
      </div>

      {/* For retailers */}
      <div style={{ background: '#111', color: '#fff', padding: '4rem 2rem', textAlign: 'center' }}>
        <h3 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 1rem' }}>Are you a retailer?</h3>
        <p style={{ fontSize: '16px', color: '#aaa', maxWidth: '500px', margin: '0 auto 2rem', lineHeight: '1.6' }}>
          Add one line of code to your store. Watch your conversion rate go up and your return rate go down.
        </p>
        <button
  onClick={() => navigate('/retailer/signup')}
  style={{ padding: '14px 32px', background: '#fff', color: '#000', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '16px', fontWeight: '500' }}
>
  Add Avatar to my store →
</button>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '2rem', borderTop: '1px solid #eee', color: '#aaa', fontSize: '13px' }}>
        © 2026 Avatar. All rights reserved.
      </div>

    </div>
  )
}

export default Landing