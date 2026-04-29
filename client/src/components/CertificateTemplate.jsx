import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const CertificateTemplate = forwardRef(({ certData }, ref) => {
  const certRef = useRef(null);

  // Expose download function to parent
  useImperativeHandle(ref, () => ({
    downloadPDF: async () => {
      const element = certRef.current;
      if (!element) return;
      
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${certData.type}_Certificate_${certData.userName.replace(/\s+/g, '_')}.pdf`);
    }
  }));

  if (!certData) return null;

  const isAchievement = certData.type === 'achievement';
  const titleColor = isAchievement ? '#7c3aed' : '#1e1b4b'; // Violet vs Indigo
  const borderGradient = isAchievement 
    ? 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)' 
    : 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%)';

  return (
    <div style={{ position: 'fixed', top: '-10000px', left: '-10000px' }}>
      <div 
        ref={certRef}
        style={{
          width: '1056px', // 11in at 96dpi
          height: '816px', // 8.5in at 96dpi
          background: '#ffffff',
          padding: '40px',
          boxSizing: 'border-box',
          fontFamily: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif"
        }}
      >
        <div style={{
          width: '100%',
          height: '100%',
          border: '4px solid #e5e7eb',
          position: 'relative',
          padding: '2px'
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            background: 'white',
            border: `6px solid transparent`,
            borderImage: `${borderGradient} 1`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '60px'
          }}>
            <div style={{
              position: 'absolute',
              top: '40px',
              left: '50px',
              opacity: 0.1,
              fontSize: '120px'
            }}>
              🎓
            </div>
            
            <h1 style={{
              fontSize: '48px',
              fontWeight: 900,
              color: titleColor,
              margin: '0 0 20px 0',
              textTransform: 'uppercase',
              letterSpacing: '4px'
            }}>
              {isAchievement ? 'Certificate of Achievement' : 'Certificate of Participation'}
            </h1>
            
            <div style={{
              width: '100px',
              height: '4px',
              background: borderGradient,
              margin: '0 auto 40px auto'
            }}></div>
            
            <p style={{
              fontSize: '22px',
              color: '#4b5563',
              margin: '0 0 20px 0'
            }}>
              This is to proudly present that
            </p>
            
            <h2 style={{
              fontSize: '56px',
              fontWeight: 800,
              color: '#111827',
              margin: '0 0 20px 0',
              borderBottom: '2px solid #e5e7eb',
              paddingBottom: '10px',
              display: 'inline-block',
              minWidth: '400px'
            }}>
              {certData.userName}
            </h2>
            
            <p style={{
              fontSize: '22px',
              color: '#4b5563',
              margin: '0 0 20px 0',
              maxWidth: '700px',
              lineHeight: '1.6'
            }}>
              {isAchievement 
                ? `has successfully secured ${certData.rank || 'a top position'} in the event` 
                : `has successfully participated in the event`}
            </p>
            
            <h3 style={{
              fontSize: '36px',
              fontWeight: 800,
              color: titleColor,
              margin: '0 0 40px 0'
            }}>
              {certData.eventName}
            </h3>
            
            <p style={{
              fontSize: '18px',
              color: '#6b7280',
              fontWeight: 600
            }}>
              Awarded on {certData.date}
            </p>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              width: '80%',
              marginTop: '80px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ borderBottom: '2px solid #9ca3af', width: '200px', height: '40px', marginBottom: '10px' }}></div>
                <p style={{ fontSize: '16px', fontWeight: 700, color: '#374151' }}>Event Coordinator</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ borderBottom: '2px solid #9ca3af', width: '200px', height: '40px', marginBottom: '10px' }}></div>
                <p style={{ fontSize: '16px', fontWeight: 700, color: '#374151' }}>SMART Event Manager</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default CertificateTemplate;
