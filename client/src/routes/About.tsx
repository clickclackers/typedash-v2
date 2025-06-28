import { FC } from 'react';

interface AboutProps {}

const About: FC<AboutProps> = ({}) => {
  return (
    <div className='flex flex-col justify-center font-semibold'>
      <div>
        Made with love by Kee Song Yang and Rayner Toh Jing Xiang for Orbital
        2023.
        <br />
        Click Clackers, #5537.
        <br />
        Heavily inspired by Monkeytype and Typeracer.
        <br />
        We hope you enjoy using it as much as we enjoyed making it {'<3'}
      </div>
    </div>
  );
};

export default About;
