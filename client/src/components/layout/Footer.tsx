import { Link } from '@chakra-ui/react';
import { FC } from 'react';

const Footer: FC = () => {
  return (
    <Link
      href='https://github.com/clickclackers/typedash-v2'
      isExternal
      className='text-sm text-center'
    >
      Made by Click Clackers.
    </Link>
  );
};

export default Footer;
