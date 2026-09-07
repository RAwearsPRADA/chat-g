'use client'

import { useBoundStore } from "@/shared/store/store"


export function ConnectionStatusTitle() {
    const wsStatus = useBoundStore(s => s.wsStatus) 
    const hasIssues = wsStatus !== 'connected'
    if (!hasIssues)
        return null
    return (
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '14px',
          fontWeight: 600,
          letterSpacing: '0.5px',
          padding: '10px 0', 
          color: (wsStatus === 'connecting' ? '#9146ff' : '#e63946'),
        
          textShadow: (wsStatus === 'connecting' 
                ? '0 0 8px rgba(145, 70, 255, 0.8), 0 0 20px rgba(145, 70, 255, 0.4)' 
                : '0 0 8px rgba(230, 57, 70, 0.8), 0 0 20px rgba(230, 57, 70, 0.4)'),
            
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes mini-spin { 100% { transform: rotate(360deg); } }
        `}} />  
        <span 
          style={{
            borderRadius: '50%',
            width: '8px',
            height: '8px',
            transform: 'scale(1)',
            backgroundColor: wsStatus === 'connecting' ? '#9146ff' : '#e63946',
            boxShadow: (wsStatus === 'connecting' 
                  ? '0 0 10px #9146ff, 0 0 20px #9146ff' 
                  : '0 0 10px #e63946, 0 0 20px #e63946'),
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
          }} 
        />  
        <span>
          {wsStatus === 'connecting' && 'CONNECTING...'}
          {(wsStatus === 'closed' || !wsStatus) && 'OFFLINE'}
        </span> 
        {wsStatus === 'connecting' && (
          <span style={{
            width: '12px',
            height: '12px',
            border: '2px solid rgba(145, 70, 255, 0.2)',
            borderTopColor: '#9146ff',
            borderRadius: '50%',
            animation: 'mini-spin 0.8s linear infinite',
            marginLeft: 'auto'
          }} />
        )}
      </div>
    )
}
