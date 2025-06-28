import { Link } from '@chakra-ui/react';
import { FC } from 'react';

interface FooterProps {}

const Footer: FC<FooterProps> = ({}) => {
  return (
    <div className='mt-8'>
      <Link href='https://github.com/raynertjx/typedash' isExternal>
        Made by Click Clackers.
      </Link>
    </div>
  );
};

export default Footer;
