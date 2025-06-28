import { Button, FormControl, FormErrorMessage, Input } from '@chakra-ui/react';
import { Formik, FormikValues } from 'formik';
import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { registerUser } from '../services/services';

interface RegisterProps {}

const Register: FC<RegisterProps> = ({}) => {
  const navigate = useNavigate();
  const registerUserHandler = (values: FormikValues) => {
    registerUser(values).then((res) => {
      if (res?.status === 201) {
        navigate('/login');
      }
    });
  };

  const getCharacterValidationError = (str: string) => {
    return `Your password must have at least 1 ${str} character.`;
  };

  return (
    <div className='flex flex-col justify-center items-center gap-6'>
      <Formik
        initialValues={{
          name: '',
          email: '',
          password: '',
          password2: '',
        }}
        validationSchema={Yup.object({
          name: Yup.string()
            .min(6, 'Username must be at least 6 characters')
            .max(15, 'Username must be 15 characters or less')
            .required('Username is required'),
          email: Yup.string()
            .email('Invalid email address')
            .required('Email is required'),
          password: Yup.string()
            .required('Please enter a password')
            .min(8, 'Password must have at least 8 characters')
            .matches(/[0-9]/, getCharacterValidationError('digit'))
            .matches(/[a-z]/, getCharacterValidationError('lowercase'))
            .matches(/[A-Z]/, getCharacterValidationError('uppercase')),
          password2: Yup.string()
            .required('Please re-type your password')
            .oneOf([Yup.ref('password')], 'Passwords does not match'),
        })}
        onSubmit={(values) => registerUserHandler(values)}
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
              <FormControl isInvalid={touched.name && !!errors.name}>
                <Input
                  id='name'
                  name='name'
                  borderColor='text.primary'
                  focusBorderColor='accent.200'
                  errorBorderColor='red.600'
                  type='text'
                  placeholder='name'
                  _placeholder={{ color: 'inherit' }}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.name}
                />
                <FormErrorMessage color='red.600'>
                  {errors.name}
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
      >
        back to login
      </Button>
    </div>
  );
};

export default Register;
