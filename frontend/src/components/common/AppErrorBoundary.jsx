import React from 'react'
import {recoverApplication} from '../../utils/recoverApplication'

export default class AppErrorBoundary extends React.Component {
  state={failed:false}

  static getDerivedStateFromError(){return {failed:true}}

  componentDidCatch(error,info){console.error('KuotaKita UI error',error,info)}

  componentDidUpdate(previousProps){
    if(this.state.failed&&previousProps.resetKey!==this.props.resetKey)this.setState({failed:false})
  }

  render(){
    if(!this.state.failed)return this.props.children
    return <main className="mobile-app" style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:24,background:'#f6f7fb'}}>
      <section style={{width:'min(100%,420px)',padding:24,borderRadius:24,background:'#fff',boxShadow:'0 18px 50px rgba(31,41,55,.12)',textAlign:'center'}}>
        <h1 style={{margin:'0 0 10px',fontSize:22}}>Halaman belum dapat ditampilkan</h1>
        <p style={{margin:'0 0 18px',color:'#64748b'}}>Tampilan ini mengalami kendala. Transaksi yang sudah dikirim tetap aman tersimpan di server.</p>
        <button type="button" className="primary-button" onClick={()=>recoverApplication()}>Perbarui Aplikasi</button>
      </section>
    </main>
  }
}
