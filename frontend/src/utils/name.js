export const initials=name=>name.split(' ').filter(Boolean).map(x=>x[0]).slice(0,2).join('').toUpperCase();
