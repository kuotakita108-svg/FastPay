export default function LoadingState({cards=4}){return <div className="loading-grid">{Array.from({length:cards},(_,i)=><div className="skeleton" key={i}/>)}</div>}
