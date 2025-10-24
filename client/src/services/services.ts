// DEPRECATED - Loadouts are no longer supported
import { createStandaloneToast } from '@chakra-ui/react';
import http from '/src/services/api';
const { toast } = createStandaloneToast();

export const getStatistics = async (params: { user: string | undefined }) => {
  try {
    const stats = await http().get('/results', { params });
    return stats;
  } catch (e) {
    console.log(e);
  }
};

export const getLoadouts = async (params: { data: string | undefined }) => {
  try {
    const res = await http().get('account/loadout', { params });
    return res;
  } catch (e) {
    console.log(e);
  }
};

export const createLoadout = async (params: any) => {
  try {
    const res = await http()
      .post('account/loadout/create', params)
      .then(() => {
        toast({
          title: 'Loadout created.',
          description: '',
          variant: 'solid',
          status: 'success',
          position: 'top-right',
          duration: 5000,
          isClosable: true,
        });
      });
    return res;
  } catch (e) {
    console.log(e);
  }
};

export const updateLoadout = async (params: any) => {
  try {
    const res = await http()
      .put('account/loadout/update', params)
      .then(() => {
        toast({
          title: 'Loadout updated.',
          description: '',
          variant: 'solid',
          status: 'success',
          position: 'top-right',
          duration: 5000,
          isClosable: true,
        });
      });
    return res;
  } catch (e) {
    console.log(e);
  }
};

export const deleteLoadout = async (params: { data: number }) => {
  try {
    const res = await http()
      .delete('account/loadout/delete', { params })
      .then(() => {
        toast({
          title: 'Loadout deleted.',
          description: '',
          variant: 'solid',
          status: 'success',
          position: 'top-right',
          duration: 5000,
          isClosable: true,
        });
      });
    return res;
  } catch (e) {
    console.log(e);
  }
};
