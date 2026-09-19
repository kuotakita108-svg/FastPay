import {createContext,useContext,useState} from 'react';import {googleLogin as googleLoginRequest,login as loginRequest,register as registerRequest} from '../services/authService';import {clearTabSession,readTabSession,writeTabSession} from '../utils/tabSession';import {canonicalRole} from '../utils/role';

const AuthContext=createContext();
// Setiap tab memakai kunci sesi unik. Tab baru tidak mewarisi role tab asal,
// sedangkan reload pada tab yang sama tetap mempertahankan login.
const readSession=()=>{const saved=readTabSession();return saved?.user?{...saved,user:{...saved.user,role:canonicalRole(saved.user.role),balance:Number(saved.user.balance||0)}}:saved};

export function AuthProvider({children}){
const[session,setSession]=useState(readSession);
const save=result=>{writeTabSession(result);setSession(result);return result};
const login=async credentials=>save(await loginRequest(credentials));
const googleLogin=async()=>save(await googleLoginRequest());
const register=async profile=>save(await registerRequest(profile));
const updateUser=user=>{const next={...session,user:{...session.user,...user}};save(next);return next.user};
const setBalance=balance=>{const next=updateUser({balance:Number(balance)});return next.balance};
const addBalance=amount=>setBalance(Number(session.user.balance||0)+Number(amount));
const deductBalance=amount=>{const value=Number(amount),current=Number(session.user.balance||0);if(value<=0)throw new Error('Nominal pembayaran tidak valid');if(current<value)throw new Error('Saldo KuotaKita tidak mencukupi');return setBalance(current-value)};
const logout=()=>{clearTabSession();setSession(null)};
return <AuthContext.Provider value={{session,user:session?.user,login,googleLogin,register,updateUser,setBalance,addBalance,deductBalance,logout}}>{children}</AuthContext.Provider>}
export const useAuth=()=>useContext(AuthContext);
