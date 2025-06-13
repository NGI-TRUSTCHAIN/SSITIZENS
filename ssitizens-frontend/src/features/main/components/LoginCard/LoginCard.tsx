import { ILoginCardProps } from "@/features/main/interfaces/ILoginCard";

export const LoginCard = ({
  icon,
  title,
  subtitle,
  buttonText,
  onClick,
  animationDelay,
}: ILoginCardProps) => {
  return (
		<div className='ssitizens-card animate-fade-in' style={{ animationDelay }}>
			<div className='flex flex-col items-center'>
				<div className='mb-4 p-3 rounded-full bg-white'>{icon}</div>
				<h2 className='text-2xl font-bold mb-2'>{title}</h2>
				<p className='text-ssitizens-darkgray text-center mb-6 h-28'>{subtitle}</p>
				<button className='ssitizens-button w-full' onClick={onClick}>
					{buttonText}
				</button>
			</div>
		</div>
  );
};
