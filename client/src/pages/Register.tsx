import { Button, FormControl, FormErrorMessage, Input } from '@chakra-ui/react';
import { Formik } from 'formik';
import { FC, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { useAuth } from '/src/hooks/useAuth';
import { useRegister } from '/src/hooks/react-query/useRegister';
import toast from '/src/components/toast';

const Register: FC = () => {
  const navigate = useNavigate();
  const { onLogin, isAuthenticated } = useAuth();

  const { mutate: register, isPending: isRegisterPending } = useRegister({
    onSuccess: (data) => {
      toast({
        title: 'Registration successful',
        variant: 'solid',
        status: 'success',
        position: 'top-right',
        isClosable: true,
      });
      onLogin(data.user);
      navigate('/');
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className='flex flex-col justify-center items-center gap-6'>
      <Formik
        initialValues={{
          username: '',
          email: '',
          password: '',
          password2: '',
        }}
        validationSchema={Yup.object({
          username: Yup.string()
            .min(3, 'Username must be at least 3 characters')
            .max(20, 'Username must be 20 characters or less')
            .required('Username is required'),
          email: Yup.string()
            .email('Please enter a valid email')
            .required('Email is required'),
          password: Yup.string()
            .required('Please enter a password')
            .min(6, 'Password must have at least 6 characters'),
          password2: Yup.string()
            .required('Please re-type your password')
            .oneOf([Yup.ref('password')], 'Passwords do not match'),
        })}
        onSubmit={(values) => register(values)}
      >
        {({
          handleSubmit,
          handleChange,
          handleBlur,
          values,
          errors,
          touched,
        }) => (
          <form
            className='flex flex-col gap-6 w-1/2 text-left'
            onSubmit={handleSubmit}
          >
            <div>register</div>
            <div className='flex flex-col gap-2'>
              <FormControl isInvalid={touched.username && !!errors.username}>
                <Input
                  id='username'
                  name='username'
                  borderColor='text.primary'
                  focusBorderColor='accent.200'
                  errorBorderColor='red.600'
                  type='text'
                  placeholder='username'
                  _placeholder={{ color: 'inherit' }}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.username}
                />
                <FormErrorMessage color='red.600'>
                  {errors.username}
                </FormErrorMessage>
              </FormControl>
            </div>
            <div className='flex flex-col gap-2'>
              <FormControl isInvalid={touched.email && !!errors.email}>
                <Input
                  id='email'
                  name='email'
                  borderColor='text.primary'
                  focusBorderColor='accent.200'
                  errorBorderColor='red.600'
                  type='email'
                  placeholder='email'
                  _placeholder={{ color: 'inherit' }}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.email}
                />
                <FormErrorMessage color='red.600'>
                  {errors.email}
                </FormErrorMessage>
              </FormControl>
            </div>
            <div className='flex flex-col gap-2'>
              <FormControl isInvalid={touched.password && !!errors.password}>
                <Input
                  id='password'
                  name='password'
                  borderColor='text.primary'
                  focusBorderColor='accent.200'
                  errorBorderColor='red.600'
                  type='password'
                  placeholder='password'
                  _placeholder={{ color: 'inherit' }}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.password}
                />
                <FormErrorMessage color='red.600'>
                  {errors.password}
                </FormErrorMessage>
              </FormControl>
            </div>
            <div className='flex flex-col gap-2'>
              <FormControl isInvalid={touched.password2 && !!errors.password2}>
                <Input
                  id='password2'
                  name='password2'
                  borderColor='text.primary'
                  focusBorderColor='accent.200'
                  errorBorderColor='red.600'
                  type='password'
                  placeholder='verify password'
                  _placeholder={{ color: 'inherit' }}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.password2}
                />
                <FormErrorMessage color='red.600'>
                  {errors.password2}
                </FormErrorMessage>
              </FormControl>
            </div>
            <Button type='submit' variant='ghost' color='text.primary'>
              sign up
            </Button>
          </form>
        )}
      </Formik>
      <Button
        variant='link'
        color='text.primary'
        onClick={() => navigate('/login')}
        isLoading={isRegisterPending}
      >
        back to login
      </Button>
    </div>
  );
};

export default Register;
