import { useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next'

const CommercePrivacyPolicy = () => {
  const navigate = useNavigate();
  const {t} = useTranslation()
  
  const handleGoBack = () => {
    navigate('/commerce-dashboard');
  };

  const policy = t('commerceDashboard.privacyPolicy', { returnObjects: true }) as string[];
  
  return (
    <div className="flex min-h-screen">      
      <main className="flex-1 p-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-end mb-6">
            <button 
              onClick={handleGoBack}
              className="px-4 py-2 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
            >
              {t('common.back')}
            </button>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-sm mb-8">
            <div className="flex items-center justify-center mb-6">
              <FileText size={28} className="text-gray-700 mr-3" />
               <h1 className="text-3xl font-bold">{t('commerceDashboard.privacyTitle')}</h1>
            </div>
            
           <div className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold mb-4">{t('commerceDashboard.privacyTitle')}</h2>
                <div className="space-y-4 text-gray-600">
                  {policy.map((item, idx) => (
                    <p key={idx}>{item}</p>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CommercePrivacyPolicy;
