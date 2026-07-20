import {useState} from 'react';export function useModal(){const[open,setOpen]=useState(false);return{open,show:()=>setOpen(true),hide:()=>setOpen(false)}}
