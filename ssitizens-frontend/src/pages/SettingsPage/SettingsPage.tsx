import { useLanguageSelector } from "@/hooks/useLanguageSelector";
import { useTranslation } from "react-i18next";

export const SettingsPage = () => {
	const { language, handleLanguageChange, languageLabels } = useLanguageSelector();
	const { t } = useTranslation("translation", { keyPrefix: "settings" });
	const { t: Common } = useTranslation("translation", { keyPrefix: "common" });

	return (
		<div className='flex min-h-screen bg-gray-50'>
			<main className='flex-1 px-8 py-8 md:px-16'>
				<h1 className='text-2xl font-bold mb-6'>{Common("settings")}</h1>

				<section>
					<div className='mb-4 ml-11'>
						<h2 className='text-lg font-semibold text-gray-800'>{t("title")}</h2>
						<p className='mt-1 text-sm text-gray-600'>{t("subtitle")}</p>
					</div>

					<div>
						<select
							id='language'
							name='language'
							value={language}
							onChange={(e) => handleLanguageChange(e.target.value)}
							className='
                  block
                  w-72 max-w-lg 
                  rounded-md
                  bg-white
                  border border-gray-300
                  py-2 px-3 
                  text-base
                  placeholder-gray-400
                  focus:outline-none
                  focus:border-indigo-500 focus:ring-indigo-500 ml-11'
						>
							{Object.entries(languageLabels).map(([key, label]) => (
								<option key={key} value={key}>
									{label}
								</option>
							))}
						</select>
					</div>
				</section>
			</main>
		</div>
	);
};
