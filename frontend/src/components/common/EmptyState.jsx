export default function EmptyState({icon:Icon,title,description,action}){return <div className="state-card">{Icon&&<Icon/>}<h2>{title}</h2><p>{description}</p>{action}</div>}
