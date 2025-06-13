import { useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next'

const UserManual = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('translation', { keyPrefix: 'userManual' });
  const { t: tCommon } = useTranslation('translation', { keyPrefix: 'common' });

  return (
    <div className="flex min-h-screen">
     
      <main className="flex-1 p-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">{t("title")}</h1>
            <button 
              onClick={() => navigate('/citizen-dashboard')}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
            >
              {tCommon('back')}
            </button>
          </div>

          <div className="bg-gray-100 p-10 rounded-lg mb-8">
            <div className="flex justify-center mb-6">
              <FileText size={48} className="text-ssitizens-darkgray" />
            </div>
            <h2 className="text-3xl font-bold text-center">{t("title")}</h2>
          </div>

            <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">{t("section1Title")}</h2>
            <p className="text-gray-600 mb-4">{t("section1Text1")}</p>
            <p className="text-gray-600 mb-4">{t("section1Text2")}</p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">{t("section2Title")}</h2>
            <p className="text-gray-600 mb-4">{t("section2Text1")}</p>
            <p className="text-gray-600 mb-4">{t("section2Text2")}</p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">{t("section3Title")}</h2>
            <p className="text-gray-600 mb-4">{t("section3Text1")}</p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">{t("section4Title")}</h2>
            <p className="text-gray-600 mb-4">{t("section4Text1")}</p>
            <p className="text-gray-600 mb-4">{t("section4Text2")}</p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default UserManual;
