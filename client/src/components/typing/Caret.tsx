import { Box } from '@chakra-ui/react';
import { FC } from 'react';

interface CaretProps {
  offset: number;
}

const Caret: FC<CaretProps> = ({ offset }) => {
  return <Box bg='accent.200' className='caret' style={{ left: offset }} />;
};

export default Caret;
