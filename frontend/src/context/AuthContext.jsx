import {createContext,useContext,useEffect,useState} from 'react';import {currentUser,login as loginRequest,register as registerRequest} from '../services/authService';

const AuthContext=createContext();
const sessionKey='kuotakita_session';

// sessionStorage dipisahkan untuk setiap tab browser. Ini membuat Agent,
// Marketing, dan Analis dapat masuk bersamaan tanpa sesi mereka saling tertimpa.
const readSession=()=>{try{const saved=JSON.parse(sessionStorage.getItem(sessionKey));return saved?.user?{...saved,user:{...saved.user,balance:0}}:saved}catch{return null}};

export function AuthProvider({children}){
const[session,setSession]=useState(readSession);
const save=result=>{sessionStorage.setItem(sessionKey,JSON.stringify(result));setSession(result);return result};
useEffect(()=>{
  if(!session?.token)return;
  let active=true;
  currentUser().then(user=>{
    if(!active)return;
    const next={...session,user};
    sessionStorage.setItem(sessionKey,JSON.stringify(next));
    setSession(next);
  }).catch(()=>{/* login/session errors are handled by the protected action itself */});
  return()=>{active=false};
},[session?.token]);
const login=async credentials=>save(await loginRequest(credentials));
const register=async profile=>save(await registerRequest(profile));
const updateUser=user=>{const next={...session,user:{...session.user,...user}};save(next);return next.user};
const setBalance=balance=>{const next=updateUser({balance:Number(balance)});return next.balance};
const addBalance=amount=>setBalance(Number(session.user.balance||0)+Number(amount));
const deductBalance=amount=>{const value=Number(amount),current=Number(session.user.balance||0);if(value<=0)throw new Error('Nominal pembayaran tidak valid');if(current<value)throw new Error('Saldo KuotaKita tidak mencukupi');return setBalance(current-value)};
const logout=()=>{sessionStorage.removeItem(sessionKey);setSession(null)};
return <AuthContext.Provider value={{session,user:session?.user,login,register,updateUser,setBalance,addBalance,deductBalance,logout}}>{children}</AuthContext.Provider>}
export const useAuth=()=>useContext(AuthContext);
