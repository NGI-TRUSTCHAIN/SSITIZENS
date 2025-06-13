export const transformCitizensErrorMessage = (errorData: any, t: (key: string) => string): string => {
	const output: string[] = [];

	Object.entries(errorData).forEach(([key, value]) => {
		const translation = t(`toastCitizenFormErrors.${key}`);
		if (translation !== `toastCitizenFormErrors.${key}`) {
			output.push(translation);
		} else if (Array.isArray(value)) {
			output.push(`${key}: ${value.join(", ")}`);
		} else {
			output.push(`${key}: ${value}`);
		}
	});

	return output.join("\n");
};
