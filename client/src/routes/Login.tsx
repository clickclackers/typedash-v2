import { Button } from '@chakra-ui/button';
import { Box, FormControl, FormErrorMessage, Input } from '@chakra-ui/react';
import { Formik, FormikValues } from 'formik';
import { FC, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { authContext } from '../context/authContext';
import { loginUser } from '../services/services';
interface LoginProps {}

export const Login: FC<LoginProps> = ({}) => {
  const navigate = useNavigate();
  const context = useContext(authContext);

  const loginUserHandler = (values: FormikValues) => {
    loginUser(values).then((res) => {
      if (res?.status === 200) {
        context?.setUser(res?.data.user.name);
        localStorage.setItem('token', res?.data.token);
        navigate('/');
      }
    });
  };

  return (
    <Box className='flex flex-col justify-center items-center gap-6'>
      <Formik
        initialValues={{
          email: '',
          password: '',
        }}
        validationSchema={Yup.object({
          email: Yup.string().required('Please enter your email'),
          password: Yup.string().required('Please enter your password'),
        })}
        onSubmit={(values) => loginUserHandler(values)}
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
            <div>login</div>
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
                  color='text.primary'
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
            <Button type='submit' variant='ghost' color='text.primary'>
              sign in
            </Button>
          </form>
        )}
      </Formik>
      <Button
        type='submit'
        variant='link'
        color='text.primary'
        onClick={() => navigate('/register')}
      >
        don't have an account? sign up
      </Button>
    </Box>
  );
};

export default Login;
