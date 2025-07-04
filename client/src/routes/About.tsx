import { FC } from 'react';

const About: FC = () => {
  return (
    <div className='flex flex-col justify-center font-semibold gap-4'>
      <p>
        Made with love by Kee Song Yang and Rayner Toh Jing Xiang for Orbital
        2023.
      </p>
      <p>Heavily inspired by Monkeytype and Typeracer.</p>
      <p>We hope you enjoy using it as much as we enjoyed making it {'<3'}</p>
    </div>
  );
};

export default About;
