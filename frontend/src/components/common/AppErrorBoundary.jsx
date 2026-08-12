import React from 'react'

export default class AppErrorBoundary extends React.Component {
  state={failed:false}

  static getDerivedStateFromError(){return {failed:true}}

  componentDidCatch(error,info){
    console.error('KuotaKita UI error',error,info)
    const message=String(error?.message||error||'')
    const staleBundle=/chunk|dynamically imported|failed to fetch module|importing a module/i.test(message)
    const retryKey='kuotakita_bundle_retry'
    if(staleBundle&&!sessionStorage.getItem(retryKey)){
      sessionStorage.setItem(retryKey,'1')
      const url=new URL(window.location.href)
      url.searchParams.set('_v',Date.now().toString())
      window.location.replace(url.toString())
    }
  }

  componentDidUpdate(previousProps){
    if(this.state.failed&&previousProps.resetKey!==this.props.resetKey)this.setState({failed:false})
  }

  render(){
    if(!this.state.failed){sessionStorage.removeItem('kuotakita_bundle_retry');return this.props.children}
    return <main className="mobile-app" style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:24,background:'#f6f7fb'}}>
      <section style={{width:'min(100%,420px)',padding:24,borderRadius:24,background:'#fff',boxShadow:'0 18px 50px rgba(31,41,55,.12)',textAlign:'center'}}>
        <h1 style={{margin:'0 0 10px',fontSize:22}}>Halaman belum dapat ditampilkan</h1>
        <p style={{margin:'0 0 18px',color:'#64748b'}}>Muat ulang aplikasi. Transaksi yang sudah dikirim tetap aman tersimpan di server.</p>
        <button type="button" className="primary-button" onClick={()=>window.location.reload()}>Muat Ulang</button>
      </section>
    </main>
  }
}
