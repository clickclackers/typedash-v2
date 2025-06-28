import { createStandaloneToast } from '@chakra-ui/react';
import { AxiosError } from 'axios';
import { FormikValues } from 'formik';
import { LoadoutProps } from '../routes/Account';
import http from './api';
const { toast } = createStandaloneToast();

export const loginUser = async (params: FormikValues) => {
  try {
    const res = await http()
      .post('login', params)
      .then((response) => {
        toast({
          title: 'Login successful.',
          description: 'You are now logged in.',
          variant: 'solid',
          status: 'success',
          position: 'top-right',
          duration: 5000,
          isClosable: true,
        });
        return response;
      });
    return res;
  } catch (e) {
    console.log(e);
    if (e instanceof AxiosError)
      toast({
        title: 'Login failed.',
        description: `${e.response?.data.message}.`,
        variant: 'solid',
        status: 'error',
        position: 'top-right',
        duration: 5000,
        isClosable: true,
      });
  }
};

export const registerUser = async (params: FormikValues) => {
  try {
    const res = await http()
      .post('register', params)
      .then((response) => {
        toast({
          title: 'Registered successfully.',
          description: 'Your account has been created.',
          variant: 'solid',
          status: 'success',
          position: 'top-right',
          duration: 5000,
          isClosable: true,
        });
        return response;
      });
    return res;
  } catch (e) {
    if (e instanceof AxiosError)
      toast({
        title: 'Registration failed.',
        description: `${e.response?.data.message}`,
        variant: 'solid',
        status: 'error',
        position: 'top-right',
        duration: 5000,
        isClosable: true,
      });
  }
};

export const logoutUser = async () => {
  try {
    const res = await http()
      .post('logout')
      .then((response) => {
        toast({
          title: 'Logout successful.',
          description: 'You are now logged out.',
          variant: 'solid',
          status: 'success',
          position: 'top-right',
          duration: 5000,
          isClosable: true,
        });
        return response;
      });
    return res;
  } catch (e) {
    if (e instanceof AxiosError)
      toast({
        title: 'Logout failed.',
        description: `${e.response?.data.message}.`,
        variant: 'solid',
        status: 'error',
        position: 'top-right',
        duration: 5000,
        isClosable: true,
      });
  }
};

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

export const updateLoadout = async (params: LoadoutProps) => {
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
