import { Link } from '@chakra-ui/react';
import { FC } from 'react';

const Footer: FC = () => {
  return (
    <div className='mt-8'>
      <Link href='https://github.com/raynertjx/typedash' isExternal>
        Made by Click Clackers.
      </Link>
    </div>
  );
};

export default Footer;
