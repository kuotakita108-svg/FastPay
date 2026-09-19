const aliases={pengguna:'user',pelanggan:'user',agen:'agent',pemasaran:'marketing',administrator:'admin',pemilik:'master',owner:'master'}

export const canonicalRole=value=>{
  const role=String(value||'user').trim().toLowerCase()
  return aliases[role]||role
}
